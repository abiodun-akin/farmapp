import { Card, Flex, Text } from "@radix-ui/themes";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate, useSearchParams } from "react-router-dom";
import { paymentAPI } from "../api/paymentApi";
import PaystackPayment from "../components/PaystackPayment";
import FullPageLayout from "../layouts/FullPageLayout";

const PaymentPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [planDetails, setPlanDetails] = useState(null);
  const { isAuthenticated } = useSelector((state) => state.user);

  const plans = {
    basic: {
      name: "Basic Plan",
      amount: 5000,
      features: ["Feature 1", "Feature 2", "Feature 3"],
    },
    pro: {
      name: "Pro Plan",
      amount: 10000,
      features: ["Feature 1", "Feature 2", "Feature 3", "Feature 4"],
    },
    enterprise: {
      name: "Enterprise Plan",
      amount: 15000,
      features: [
        "Feature 1",
        "Feature 2",
        "Feature 3",
        "Feature 4",
        "Feature 5",
      ],
    },
  };

  useEffect(() => {
    if (!isAuthenticated) {
      console.log("PaymentPage - user not authenticated, redirecting to login");
      navigate("/login", { state: { redirectTo: window.location.pathname + window.location.search } });
      return;
    }

    const plan = searchParams.get("plan");
    console.log("PaymentPage - plan from URL:", plan);
    if (plan && plans[plan]) {
      console.log("PaymentPage - setting plan details:", plans[plan]);
      setPlanDetails(plans[plan]);
    } else {
      console.log("PaymentPage - plan not found, redirecting to pricing");
      navigate("/pricing");
    }
  }, [searchParams, navigate, isAuthenticated]);

  const handlePaymentSuccess = async (response) => {
    console.log("Payment success:", response);
    try {
      await paymentAPI.handlePaymentSuccess(response.reference, searchParams.get("plan"));
      navigate("/dashboard");
    } catch (error) {
      console.error("Payment success handling failed:", error);
    }
  };

  const handlePaymentClose = async () => {
    console.log("Payment closed by user");
    try {
      await paymentAPI.handlePaymentClose();
    } catch (error) {
      console.error("Payment close handling failed:", error);
    }
  };

  if (!planDetails) {
    console.log("PaymentPage - planDetails not loaded yet");
    return (
      <FullPageLayout>
        <Flex align="center" justify="center" style={{ minHeight: "100vh" }}>
          <Text>Loading...</Text>
        </Flex>
      </FullPageLayout>
    );
  }

  console.log("PaymentPage - rendering with planDetails:", planDetails);

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
