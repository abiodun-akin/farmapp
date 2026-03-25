import { Button, Flex, Text } from "@radix-ui/themes";
import { useEffect } from "react";
import { Link as RouterLink, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import AuthLayout from "../layouts/AuthLayout";

const VerifyEmailPage = () => {
  const {
    verifyEmail,
    loading,
    error,
    statusMessage,
    emailVerified,
    clearFeedback,
  } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const token = new URLSearchParams(location.search).get("token");

  useEffect(() => {
    if (token) {
      verifyEmail(token);
    }

    return () => clearFeedback();
  }, [token, verifyEmail, clearFeedback]);

  useEffect(() => {
    if (emailVerified) {
      const timeout = setTimeout(() => {
        navigate("/login");
      }, 1500);

      return () => clearTimeout(timeout);
    }

    return undefined;
  }, [emailVerified, navigate]);

  return (
    <AuthLayout title="Verify Email">
      <Flex direction="column" gap="4" align="start">
        {!token && (
          <Text color="red" size="2">
            Verification token is missing. Open the link from your email again.
          </Text>
        )}

        {loading && token && <Text size="2">Verifying your email...</Text>}

        {error && <Text color="red">{error}</Text>}

        {statusMessage && <Text color="green">{statusMessage}</Text>}

        {emailVerified && (
          <Text size="2" color="gray">
            Redirecting to login...
          </Text>
        )}

        <Button asChild variant="soft" color="green" disabled={loading}>
          <RouterLink to="/login">Go to Login</RouterLink>
        </Button>
      </Flex>
    </AuthLayout>
  );
};

export default VerifyEmailPage;
