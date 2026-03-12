import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button, Flex, Text } from "@radix-ui/themes";
import { initializePaymentRequest, verifyPaymentRequest } from "../redux/slices/paymentSlice";
import useToast from "../hooks/useToast";

const PaystackPayment = ({ plan, amount, onSuccess, onClose, isTrialAuth = false }) => {
  const dispatch = useDispatch();
  const { addToast } = useToast();
  const { loading, paymentData, error, verifyResult } = useSelector((state) => state.payment);
  const { user } = useSelector((state) => state.user);
  const [paystackReady, setPaystackReady] = useState(false);
  const [paymentInProgress, setPaymentInProgress] = useState(false);
  const [pendingVerificationRef, setPendingVerificationRef] = useState(null);

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

  useEffect(() => {
    if (!pendingVerificationRef || loading) return;

    if (verifyResult?.status === "success" && verifyResult?.reference === pendingVerificationRef) {
      const ref = pendingVerificationRef;
      setPendingVerificationRef(null);
      onSuccess({ reference: ref, plan });
      return;
    }

    if (error) {
      addToast(error, "error");
      setPendingVerificationRef(null);
    }
  }, [pendingVerificationRef, loading, verifyResult, error, onSuccess, plan, addToast]);

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
        setPendingVerificationRef(response.reference);
        dispatch(verifyPaymentRequest({ reference: response.reference, plan }));
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
        {isTrialAuth ? "Authorize Card" : `Subscribe to ${plan}`}
      </Text>

      {isTrialAuth ? (
        <div style={{ textAlign: "center", padding: "0 8px" }}>
          <Text size="3" style={{ color: "#555", display: "block", marginBottom: "6px" }}>
            A <strong>₦50</strong> authorization charge is used to verify your card.
          </Text>
          <Text size="2" color="gray" style={{ display: "block" }}>
            ₦5,000 will only be charged after your free trial ends (if you haven't cancelled).
          </Text>
        </div>
      ) : (
        <Text size="4">Amount: ₦{amount.toLocaleString()}</Text>
      )}

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
            : isTrialAuth
              ? "Authorize Card — ₦50"
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
