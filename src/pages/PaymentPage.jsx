import { Card, Flex, Text, Button } from "@radix-ui/themes";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useSearchParams } from "react-router-dom";
import { paymentAPI } from "../api/paymentApi";
import PaystackPayment from "../components/PaystackPayment";
import FullPageLayout from "../layouts/FullPageLayout";
import { addToast } from "../redux/slices/toastSlice";
import { logout } from "../redux/slices/userSlice";

const PaymentPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [planDetails, setPlanDetails] = useState(null);
  const [error, setError] = useState(null);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [subscriptionDetails, setSubscriptionDetails] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const { isAuthenticated } = useSelector((state) => state.user);

  const plans = {
    basic: {
      name: "Basic Plan",
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
      } catch (err) {
        return true;
      }
    };

    if (!isAuthenticated || isTokenExpired(token)) {
      // clear any stale auth and redirect to login with return path
      if (isTokenExpired(token)) {
        // remove local auth state and show a helpful toast
        dispatch(logout());
        dispatch(
          addToast({
            message: "Session expired — please sign in again",
            type: "warning",
          })
        );
      }

      navigate("/login", {
        state: {
          redirectTo: window.location.pathname + window.location.search,
        },
      });
      return;
    }

    const plan = searchParams.get("plan");
    if (plan && plans[plan]) {
      setPlanDetails({ ...plans[plan], planKey: plan });
    } else {
      setError("Invalid plan selected");
      navigate("/pricing");
    }
  }, [searchParams, navigate, isAuthenticated, dispatch]);

  const handlePaymentSuccess = async (response) => {
    try {
      setIsProcessing(true);
      
      // Call success endpoint to finalize subscription
      const result = await paymentAPI.handlePaymentSuccess(
        response.reference,
        searchParams.get("plan")
      );

      // Show success state
      setPaymentSuccess(true);
      setSubscriptionDetails(result.data.subscription);

      dispatch(
        addToast({
          message: "Payment successful! Your subscription is now active.",
          type: "success",
        })
      );

      // Redirect after a short delay
      setTimeout(() => {
        navigate("/dashboard");
      }, 2000);
    } catch (error) {
      console.error("Payment success handling failed:", error);
      const errorMessage =
        error.response?.data?.error || "Payment verification failed";
      setError(errorMessage);
      dispatch(addToast({ message: errorMessage, type: "error" }));
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePaymentClose = async () => {
    try {
      await paymentAPI.handlePaymentClose();
      dispatch(addToast({ message: "Payment cancelled", type: "warning" }));
    } catch (error) {
      console.error("Payment close handling failed:", error);
    }
  };

  // Success State
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
            }}
          >
            <Text size="6" weight="bold" style={{ color: "#e74c3c" }}>
              Payment Error
            </Text>
            <Text size="3" style={{ color: "#666", marginTop: "16px" }}>
              {error}
            </Text>
            <Button
              onClick={() => setError(null)}
              style={{
                marginTop: "20px",
                backgroundColor: "#3498db",
                color: "white",
                padding: "10px 24px",
              }}
            >
              Try Again
            </Button>
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
            amount={planDetails.amount}
            onSuccess={handlePaymentSuccess}
            onClose={handlePaymentClose}
          />

          {isProcessing && (
            <Text size="2" color="gray" style={{ marginTop: "16px" }}>
              Processing your payment...
            </Text>
          )}
        </Card>
      </Flex>
    </FullPageLayout>
  );
};

export default PaymentPage;
