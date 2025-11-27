import { Button, Flex, Text } from "@radix-ui/themes";
import { useDispatch, useSelector } from "react-redux";
import {
  initializePaymentRequest,
  verifyPaymentRequest,
} from "../redux/slices/paymentSlice";

const PaystackPayment = ({ plan, amount, onSuccess, onClose }) => {
  const dispatch = useDispatch();
  const { loading } = useSelector((state) => state.payment);
  const { user } = useSelector((state) => state.user);

  console.log("PaystackPayment - props:", { plan, amount });
  console.log("PaystackPayment - user:", user);
  console.log(
    "PaystackPayment - Paystack key:",
    import.meta.env.VITE_PAYSTACK_PUBLIC_KEY
  );

  const initializePayment = () => {
    console.log("PaystackPayment - initializePayment called");
    dispatch(initializePaymentRequest({ plan, amount, email: user?.email }));

    if (!window.PaystackPop) {
      console.error("PaystackPop not loaded");
      return;
    }

    const handler = window.PaystackPop.setup({
      key: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY,
      email: user?.email || "user@example.com",
      amount: amount * 100,
      currency: "NGN",
      ref: `${Date.now()}`,
      metadata: {
        plan: plan,
      },
      callback: function (response) {
        console.log("PaystackPayment - payment callback:", response);
        dispatch(verifyPaymentRequest({ reference: response.reference }));
        onSuccess(response);
      },
      onClose: function () {
        console.log("PaystackPayment - payment closed");
        onClose();
      },
    });

    handler.openIframe();
  };

  return (
    <Flex direction="column" gap="4" align="center">
      <Text size="6" weight="bold">
        Subscribe to {plan}
      </Text>
      <Text size="4">Amount: ₦{amount.toLocaleString()}</Text>
      <Button
        onClick={initializePayment}
        disabled={loading}
        style={{
          backgroundColor: "var(--color-pry-800)",
          color: "white",
          borderRadius: "8px",
          padding: "12px 24px",
        }}
      >
        {loading ? "Processing..." : "Pay Now"}
      </Button>
    </Flex>
  );
};

export default PaystackPayment;
