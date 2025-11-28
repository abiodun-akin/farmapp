import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button, Flex, Text } from "@radix-ui/themes";
import { initializePaymentRequest, verifyPaymentRequest } from "../redux/slices/paymentSlice";

const PaystackPayment = ({ plan, amount, onSuccess, onClose }) => {
  const dispatch = useDispatch();
  const { loading } = useSelector((state) => state.payment);
  const { user } = useSelector((state) => state.user);
  const [paystackReady, setPaystackReady] = useState(false);

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

  const initializePayment = () => {
    if (!window.PaystackPop) {
      console.error("Paystack not loaded");
      return;
    }

    console.log("Initializing payment for:", { plan, amount, email: user?.email });
    dispatch(initializePaymentRequest({ plan, amount, email: user?.email }));
    
    const handler = window.PaystackPop.setup({
      key: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY,
      email: user?.email || "user@example.com",
      amount: amount * 100,
      currency: "NGN",
      ref: `${Date.now()}`,
      metadata: { plan },
      callback: function(response) {
        console.log("Payment successful:", response);
        dispatch(verifyPaymentRequest({ reference: response.reference }));
        onSuccess(response);
      },
      onClose: function() {
        console.log("Payment modal closed");
        onClose();
      }
    });
    
    handler.openIframe();
  };

  return (
    <Flex direction="column" gap="4" align="center">
      <Text size="6" weight="bold">Subscribe to {plan}</Text>
      <Text size="4">Amount: ₦{amount.toLocaleString()}</Text>
      <Button
        onClick={initializePayment}
        disabled={loading || !paystackReady}
        style={{
          backgroundColor: "var(--color-pry-800)",
          color: "white",
          borderRadius: "8px",
          padding: "12px 24px",
          opacity: (loading || !paystackReady) ? 0.6 : 1,
        }}
      >
        {!paystackReady ? "Loading..." : loading ? "Processing..." : "Pay Now"}
      </Button>
    </Flex>
  );
};

export default PaystackPayment;
