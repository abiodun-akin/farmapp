import { Button, Flex, Text } from "@radix-ui/themes";
import { useAuth } from "../hooks/useAuth";

const EmailVerificationBanner = () => {
  const { user, loading, sendVerificationEmail } = useAuth();

  if (!user || user.isEmailVerified) {
    return null;
  }

  return (
    <div
      style={{
        margin: "12px auto 0",
        maxWidth: "min(1100px, 94vw)",
        padding: "12px 14px",
        borderRadius: "10px",
        border: "1px solid #facc15",
        background: "#fef9c3",
      }}
    >
      <Flex align="center" justify="between" gap="3" wrap="wrap">
        <Text size="2" color="brown">
          Your email is not verified. Verify your email to unlock all account features.
        </Text>
        <Button
          size="2"
          color="amber"
          variant="solid"
          disabled={loading}
          onClick={sendVerificationEmail}
        >
          {loading ? "Sending..." : "Resend verification"}
        </Button>
      </Flex>
    </div>
  );
};

export default EmailVerificationBanner;
