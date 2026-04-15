import { Button, Card, Flex, Text } from "@radix-ui/themes";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useSearchParams } from "react-router-dom";
import ErrorDisplay from "../components/ErrorDisplay";
import PaystackPayment from "../components/PaystackPayment";
import useSagaApi from "../hooks/useSagaApi";
import useToast from "../hooks/useToast";
import FullPageLayout from "../layouts/FullPageLayout";
import {
  clearPaymentFlowState,
  closePaymentRequest,
  fetchSubscriptionStatusRequest,
  successPaymentRequest,
} from "../redux/slices/paymentSlice";
import { logoutRequest } from "../redux/slices/userSlice";

const PLANS = {
  premium: {
    name: "Premium Plan",
    amount: 5000,
    description: "Get started with our 30 days free trial.",
    features: [
      "Access to core features",
      "30-day trial period",
      "Email support",
      "Basic analytics",
    ],
  },
};

const PaymentPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { addToast } = useToast();
  const [planDetails, setPlanDetails] = useState(null);
  const [error, setError] = useState(null);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [isCardAuthSuccess, setIsCardAuthSuccess] = useState(false);
  const [subscriptionDetails, setSubscriptionDetails] = useState(null);
  const [isTrialAuth, setIsTrialAuth] = useState(false);
  const [pendingFinalizeReference, setPendingFinalizeReference] =
    useState(null);
  const [invoices, setInvoices] = useState([]);
  const [invoicesLoading, setInvoicesLoading] = useState(false);
  const [invoiceError, setInvoiceError] = useState("");
  const [downgradeLoading, setDowngradeLoading] = useState(false);
  const [downgradeMessage, setDowngradeMessage] = useState("");
  const sagaApi = useSagaApi();
  const { isAuthenticated } = useSelector((state) => state.user);
  const {
    successResult,
    error: paymentError,
    loading: paymentLoading,
    subscription,
  } = useSelector((state) => state.payment);

  useEffect(() => {
    // Quick client-side JWT expiry check to avoid unexpected 401s
    const token = localStorage.getItem("token");
    const isTokenExpired = (t) => {
      if (!t) return true;
      try {
        const payload = JSON.parse(atob(t.split(".")[1]));
        // exp is in seconds since epoch
        return (
          typeof payload.exp === "number" && payload.exp * 1000 <= Date.now()
        );
      } catch {
        return true;
      }
    };

    if (!isAuthenticated || isTokenExpired(token)) {
      // clear any stale auth and redirect to login with return path
      if (isTokenExpired(token)) {
        dispatch(logoutRequest({ reason: "expired", skipApi: true }));
      }

      navigate("/login", {
        state: {
          redirectTo: window.location.pathname + window.location.search,
        },
      });
      return;
    }

    const plan = searchParams.get("plan");
    if (plan && PLANS[plan]) {
      setPlanDetails({ ...PLANS[plan], planKey: plan });
      dispatch(fetchSubscriptionStatusRequest({ force: true }));
    } else {
      setError("Invalid plan selected");
      navigate("/pricing");
    }
  }, [searchParams, navigate, isAuthenticated, dispatch, addToast]);

  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }

    const loadInvoices = async () => {
      try {
        setInvoicesLoading(true);
        setInvoiceError("");
        const response = await sagaApi({
          service: "userApi",
          method: "getInvoices",
        });
        setInvoices(response?.data?.invoices || []);
      } catch (err) {
        setInvoiceError(
          err?.response?.data?.error || "Unable to load invoices",
        );
      } finally {
        setInvoicesLoading(false);
      }
    };

    loadInvoices();
  }, [isAuthenticated, sagaApi]);

  const handlePaymentSuccess = (data) => {
    const planFromUrl = searchParams.get("plan");
    setPendingFinalizeReference(data.reference);
    dispatch(
      successPaymentRequest({ reference: data.reference, plan: planFromUrl }),
    );
  };

  useEffect(() => {
    const shouldAuthorizeCard =
      subscription?.status === "trial" && !subscription?.isCardAuthorized;
    setIsTrialAuth(Boolean(shouldAuthorizeCard));
  }, [subscription]);

  useEffect(() => {
    if (!pendingFinalizeReference || !successResult) return;

    if (successResult?.isCardAuthorization) {
      setIsCardAuthSuccess(true);
      setPaymentSuccess(true);
      addToast(
        "Card authorized! You'll be charged ₦5,000 after your trial ends.",
        "success",
      );
      setPendingFinalizeReference(null);
      setTimeout(() => navigate("/profile"), 2500);
      return;
    }

    if (successResult?.subscription) {
      setPaymentSuccess(true);
      setSubscriptionDetails(successResult.subscription);
      addToast(
        "Payment successful! Your subscription is now active.",
        "success",
      );
      setPendingFinalizeReference(null);
      setTimeout(() => navigate("/profile"), 2000);
    }
  }, [pendingFinalizeReference, successResult, navigate, addToast]);

  useEffect(() => {
    if (!pendingFinalizeReference || !paymentError) return;
    setError(paymentError);
    setPendingFinalizeReference(null);
  }, [pendingFinalizeReference, paymentError]);

  useEffect(() => {
    return () => {
      dispatch(clearPaymentFlowState());
    };
  }, [dispatch]);

  const handlePaymentClose = () => {
    dispatch(closePaymentRequest());
  };

  const handleScheduleDowngrade = async () => {
    try {
      setDowngradeLoading(true);
      setDowngradeMessage("");
      const response = await sagaApi({
        service: "userApi",
        method: "scheduleDowngrade",
      });
      setDowngradeMessage(
        response?.data?.message || "Downgrade to free access scheduled",
      );
      dispatch(fetchSubscriptionStatusRequest({ force: true }));
    } catch (err) {
      setDowngradeMessage(
        err?.response?.data?.error || "Unable to schedule downgrade",
      );
    } finally {
      setDowngradeLoading(false);
    }
  };

  // Card Authorization Success State
  if (paymentSuccess && isCardAuthSuccess) {
    return (
      <FullPageLayout>
        <Flex
          direction="column"
          align="center"
          justify="center"
          p="8"
          style={{ minHeight: "100vh" }}
        >
          <Card
            style={{
              backgroundColor: "white",
              padding: "40px",
              maxWidth: "500px",
              textAlign: "center",
              border: "2px solid #27ae60",
            }}
          >
            <div style={{ fontSize: "48px", marginBottom: "20px" }}>✅</div>
            <Text size="7" weight="bold" style={{ color: "#27ae60" }}>
              Card Authorized!
            </Text>
            <Text
              size="4"
              style={{ color: "#555", marginTop: "16px", display: "block" }}
            >
              Your card has been saved for future billing.
            </Text>
            <div
              style={{
                margin: "24px 0",
                padding: "20px",
                background: "#f0f7f4",
                borderRadius: "8px",
                border: "1px solid #27ae60",
              }}
            >
              <Text size="3" style={{ color: "#333" }}>
                ₦5,000 will be charged automatically when your free trial
                expires. You can cancel anytime before then.
              </Text>
            </div>
            <Button
              onClick={() => navigate("/profile")}
              style={{
                backgroundColor: "#27ae60",
                color: "white",
                padding: "10px 24px",
              }}
            >
              Go to Dashboard
            </Button>
          </Card>
        </Flex>
      </FullPageLayout>
    );
  }

  // Subscription Success State
  if (paymentSuccess && subscriptionDetails) {
    return (
      <FullPageLayout>
        <Flex
          direction="column"
          align="center"
          justify="center"
          p="8"
          style={{ minHeight: "100vh" }}
        >
          <Card
            style={{
              backgroundColor: "white",
              padding: "40px",
              maxWidth: "500px",
              textAlign: "center",
              border: "2px solid #27ae60",
            }}
          >
            <div style={{ fontSize: "48px", marginBottom: "20px" }}>✓</div>
            <Text size="7" weight="bold" style={{ color: "#27ae60" }}>
              Payment Successful!
            </Text>
            <Text size="4" style={{ color: "#666", marginTop: "16px" }}>
              Your subscription is now active
            </Text>

            <div
              style={{
                margin: "30px 0",
                padding: "20px",
                background: "#f0f7f4",
                borderRadius: "8px",
                border: "1px solid #27ae60",
              }}
            >
              <p style={{ color: "#555", margin: "8px 0" }}>
                <strong>Plan:</strong> {subscriptionDetails.plan}
              </p>
              <p style={{ color: "#555", margin: "8px 0" }}>
                <strong>Status:</strong>{" "}
                <span style={{ color: "#27ae60" }}>
                  {subscriptionDetails.status}
                </span>
              </p>
              <p style={{ color: "#555", margin: "8px 0" }}>
                <strong>Valid Until:</strong>{" "}
                {new Date(subscriptionDetails.endDate).toLocaleDateString()}
              </p>
            </div>

            <Text size="2" style={{ color: "#999" }}>
              You will be redirected to your dashboard shortly...
            </Text>

            <Button
              onClick={() => navigate("/dashboard")}
              style={{
                marginTop: "20px",
                backgroundColor: "#27ae60",
                color: "white",
                padding: "10px 24px",
              }}
            >
              Go to Dashboard
            </Button>
          </Card>
        </Flex>
      </FullPageLayout>
    );
  }

  // Error State
  if (error) {
    return (
      <FullPageLayout>
        <Flex
          direction="column"
          justify="center"
          align="center"
          p="8"
          style={{ minHeight: "100vh" }}
        >
          <Card
            style={{
              backgroundColor: "white",
              padding: "40px",
              maxWidth: "500px",
            }}
          >
            <ErrorDisplay
              error={error}
              onRetry={() => setError(null)}
              showDismiss={false}
            />
          </Card>
        </Flex>
      </FullPageLayout>
    );
  }

  // Loading State
  if (!planDetails) {
    return (
      <FullPageLayout>
        <Flex align="center" justify="center" style={{ minHeight: "100vh" }}>
          <Text>Loading payment details...</Text>
        </Flex>
      </FullPageLayout>
    );
  }

  // Payment Form
  return (
    <FullPageLayout>
      <Flex
        direction="column"
        align="center"
        justify="center"
        p="8"
        style={{ minHeight: "100vh" }}
      >
        <Card
          style={{
            backgroundColor: "white",
            padding: "32px",
            maxWidth: "450px",
          }}
        >
          <Flex direction="column" gap="4" align="center" mb="6">
            <Text size="6" weight="bold">
              {planDetails.name}
            </Text>
            <Text size="2" color="gray">
              {planDetails.description}
            </Text>
          </Flex>

          {/* Features List */}
          <div
            style={{
              margin: "20px 0",
              padding: "15px",
              background: "#f9f9f9",
              borderRadius: "6px",
            }}
          >
            <Text size="2" weight="bold" style={{ marginBottom: "10px" }}>
              Includes:
            </Text>
            {planDetails.features?.map((feature, idx) => (
              <div key={idx} style={{ marginBottom: "6px" }}>
                <Text size="2">✓ {feature}</Text>
              </div>
            ))}
          </div>

          <PaystackPayment
            plan={planDetails.planKey}
            amount={isTrialAuth ? 50 : planDetails.amount}
            isTrialAuth={isTrialAuth}
            onSuccess={handlePaymentSuccess}
            onClose={handlePaymentClose}
          />

          {paymentLoading && (
            <Text size="2" color="gray" style={{ marginTop: "16px" }}>
              Processing your payment...
            </Text>
          )}

          {subscription?.status &&
            ["active", "trial"].includes(subscription.status) && (
              <div
                style={{
                  marginTop: "20px",
                  paddingTop: "16px",
                  borderTop: "1px solid #ececec",
                }}
              >
                <Text size="2" weight="bold">
                  Subscription Controls
                </Text>
                <Text
                  size="2"
                  color="gray"
                  style={{ display: "block", marginTop: "6px" }}
                >
                  Status: {subscription.status}{" "}
                  {subscription?.plan ? `• Plan: ${subscription.plan}` : ""}
                </Text>
                <Button
                  onClick={handleScheduleDowngrade}
                  disabled={downgradeLoading}
                  variant="soft"
                  color="orange"
                  style={{ marginTop: "10px" }}
                >
                  {downgradeLoading
                    ? "Scheduling..."
                    : "Schedule Downgrade to Free"}
                </Button>
                {downgradeMessage && (
                  <Text
                    size="2"
                    style={{
                      display: "block",
                      marginTop: "8px",
                      color: "#8a5d00",
                    }}
                  >
                    {downgradeMessage}
                  </Text>
                )}
              </div>
            )}

          <div
            style={{
              marginTop: "20px",
              paddingTop: "16px",
              borderTop: "1px solid #ececec",
            }}
          >
            <Text size="2" weight="bold">
              Recent Invoices
            </Text>
            {invoicesLoading ? (
              <Text
                size="2"
                color="gray"
                style={{ display: "block", marginTop: "8px" }}
              >
                Loading invoices...
              </Text>
            ) : invoiceError ? (
              <Text
                size="2"
                style={{ display: "block", marginTop: "8px", color: "#c0392b" }}
              >
                {invoiceError}
              </Text>
            ) : invoices.length === 0 ? (
              <Text
                size="2"
                color="gray"
                style={{ display: "block", marginTop: "8px" }}
              >
                No invoices available yet.
              </Text>
            ) : (
              <div style={{ marginTop: "10px", display: "grid", gap: "8px" }}>
                {invoices.slice(0, 5).map((invoice) => (
                  <div
                    key={invoice.reference}
                    style={{
                      background: "#f8f8f8",
                      border: "1px solid #ececec",
                      borderRadius: "8px",
                      padding: "10px",
                    }}
                  >
                    <Text size="2" weight="bold">
                      {invoice.reference}
                    </Text>
                    <Text size="2" style={{ display: "block", color: "#444" }}>
                      {invoice.plan} • ₦
                      {Number(invoice.amount || 0).toLocaleString()} •{" "}
                      {invoice.status}
                    </Text>
                    <Text size="1" color="gray">
                      {invoice.createdAt
                        ? new Date(invoice.createdAt).toLocaleDateString()
                        : ""}
                    </Text>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>
      </Flex>
    </FullPageLayout>
  );
};

export default PaymentPage;
