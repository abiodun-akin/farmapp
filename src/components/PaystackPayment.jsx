import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button, Flex, Text } from "@radix-ui/themes";
import { initializePaymentRequest, verifyPaymentRequest } from "../redux/slices/paymentSlice";
import { paymentAPI } from "../api/paymentApi";
import { addToast } from "../redux/slices/toastSlice";

const PaystackPayment = ({ plan, amount, onSuccess, onClose }) => {
  const dispatch = useDispatch();
  const { loading, paymentData, error } = useSelector((state) => state.payment);
  const { user } = useSelector((state) => state.user);
  const [paystackReady, setPaystackReady] = useState(false);
  const [paymentInProgress, setPaymentInProgress] = useState(false);

  useEffect(() => {
    const checkPaystack = () => {
      if (window.PaystackPop) {
        console.log("PaystackPop is ready");
        setPaystackReady(true);
      } else {
        console.log("Waiting for PaystackPop...");
        setTimeout(checkPaystack, 500);
      }
    };
    checkPaystack();
  }, []);

  // Watch for payment data and open modal when it's ready
  useEffect(() => {
    if (paymentInProgress && !loading && paymentData && !error) {
      openPaystackModal();
    }
  }, [paymentData, loading, paymentInProgress, error]);

  const initializePayment = async () => {
    if (!window.PaystackPop) {
      console.error("Paystack not loaded");
      return;
    }

    if (!user?.email) {
      console.error("User email not available");
      return;
    }

    setPaymentInProgress(true);

    try {
      console.log("Initializing payment for:", { plan, amount, email: user?.email });
      
      // Dispatch action to initialize payment via saga
      dispatch(initializePaymentRequest({ plan, amount, email: user?.email }));
    } catch (error) {
      console.error("Payment initialization error:", error);
      setPaymentInProgress(false);
    }
  };

  const handlePaymentConfirmation = async (reference) => {
    try {
      // First verify the payment
      console.log("Verifying payment...");
      const verifyResponse = await paymentAPI.verifyPayment(reference, plan);
      console.log("Payment verification successful:", verifyResponse.data);

      // Then confirm payment success to create subscription
      console.log("Confirming payment success...");
      const successResponse = await paymentAPI.handlePaymentSuccess(reference, plan);
      console.log("Payment success confirmed:", successResponse.data);

      dispatch(addToast({
        message: "Subscription activated successfully!",
        type: "success"
      }));
    } catch (error) {
      console.error("Payment success handling failed:", error.response?.data || error.message);
      dispatch(addToast({
        message: error.response?.data?.message || "Failed to confirm payment. Please contact support.",
        type: "error"
      }));
    }
  };

  const openPaystackModal = () => {
    if (!paymentData?.paymentData?.reference) {
      console.error("No payment reference available");
      setPaymentInProgress(false);
      return;
    }

    const reference = paymentData.paymentData.reference;

    const handler = window.PaystackPop.setup({
      key: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY,
      email: user?.email || "user@example.com",
      amount: amount * 100,
      currency: "NGN",
      ref: reference,
      metadata: {
        plan,
        reference,
      },
      callback: function (response) {
        console.log("Payment successful:", response);
        setPaymentInProgress(false);

        // Verify the payment with backend and then confirm success
        handlePaymentConfirmation(response.reference);

        // Call success handler
        onSuccess(response);
      },
      onClose: function () {
        console.log("Payment modal closed");
        setPaymentInProgress(false);
        onClose();
      },
    });

    handler.openIframe();
  };

  const isProcessing = loading || paymentInProgress;
  const isDisabled = isProcessing || !paystackReady;

  return (
    <Flex direction="column" gap="4" align="center">
      <Text size="6" weight="bold">
        Subscribe to {plan}
      </Text>
      <Text size="4">Amount: ₦{amount.toLocaleString()}</Text>

      {!paystackReady && <Text size="2" color="gray">Loading payment provider...</Text>}

      {error && <Text size="2" color="red">Error: {error}</Text>}

      <Button
        onClick={initializePayment}
        disabled={isDisabled}
        style={{
          backgroundColor: isDisabled ? "#ccc" : "var(--color-pry-800)",
          color: "white",
          borderRadius: "8px",
          padding: "12px 24px",
          cursor: isDisabled ? "not-allowed" : "pointer",
          opacity: isDisabled ? 0.6 : 1,
        }}
      >
        {!paystackReady
          ? "Loading..."
          : isProcessing
            ? "Processing..."
            : "Pay Now"}
      </Button>

      {isProcessing && (
        <Text size="2" color="gray">
          Please wait while we process your payment...
        </Text>
      )}
    </Flex>
  );
};

export default PaystackPayment;
