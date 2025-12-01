import { Card, Flex, Text } from "@radix-ui/themes";
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
  const { isAuthenticated } = useSelector((state) => state.user);

  const plans = {
    basic: {
      name: "Basic Plan",
      amount: 5000,
      description: "Perfect for getting started",
    },
    pro: {
      name: "Pro Plan",
      amount: 10000,
      description: "Best for growing businesses",
    },
    enterprise: {
      name: "Enterprise Plan",
      amount: 15000,
      description: "For large-scale operations",
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
      setPlanDetails(plans[plan]);
    } else {
      setError("Invalid plan selected");
      navigate("/pricing");
    }
  }, [searchParams, navigate, isAuthenticated]);

  const handlePaymentSuccess = async (response) => {
    try {
      await paymentAPI.handlePaymentSuccess(
        response.reference,
        searchParams.get("plan")
      );
      navigate("/dashboard");
    } catch (error) {
      console.error("Payment success handling failed:", error);
      setError("Payment verification failed");
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

  if (error) {
    return (
      <FullPageLayout>
        <Flex align="center" justify="center" style={{ minHeight: "100vh" }}>
          <Text color="red">{error}</Text>
        </Flex>
      </FullPageLayout>
    );
  }

  if (!planDetails) {
    return (
      <FullPageLayout>
        <Flex align="center" justify="center" style={{ minHeight: "100vh" }}>
          <Text>Loading payment details...</Text>
        </Flex>
      </FullPageLayout>
    );
  }

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
            maxWidth: "400px",
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
          <PaystackPayment
            plan={planDetails.name}
            amount={planDetails.amount}
            onSuccess={handlePaymentSuccess}
            onClose={handlePaymentClose}
          />
        </Card>
      </Flex>
    </FullPageLayout>
  );
};

export default PaymentPage;
