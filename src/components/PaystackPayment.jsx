import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button, Flex, Text } from "@radix-ui/themes";
import { initializePaymentRequest, verifyPaymentRequest } from "../redux/slices/paymentSlice";

const PaystackPayment = ({ plan, amount, onSuccess, onClose }) => {
  const dispatch = useDispatch();
  const { loading, paymentData } = useSelector((state) => state.payment);
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

  const initializePayment = async () => {
    if (!window.PaystackPop) {
      console.error("Paystack not loaded");
      return;
    }

    setPaymentInProgress(true);

    try {
      console.log("Initializing payment for:", { plan, amount, email: user?.email });
      
      // Initialize payment on backend to get unique reference
      dispatch(initializePaymentRequest({ plan, amount, email: user?.email }));

      // Wait a moment for state to update, then get the reference from paymentData
      // In a real app, you'd want to wait for the async action to complete properly
      setTimeout(() => {
        openPaystackModal();
      }, 500);
    } catch (error) {
      console.error("Payment initialization error:", error);
      setPaymentInProgress(false);
    }
  };

  const openPaystackModal = () => {
    // Use backend-generated reference, fallback to timestamp
    const reference = paymentData?.paymentData?.reference || `ref_${Date.now()}`;

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

        // Verify the payment with backend
        dispatch(verifyPaymentRequest({ reference: response.reference, plan }));

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
