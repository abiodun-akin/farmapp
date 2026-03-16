import { Card, Flex, Spinner, Text, Button } from "@radix-ui/themes";
import { useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import AuthLayout from "../layouts/AuthLayout";
import { useAuth } from "../hooks/useAuth";

const SocialAuthCallbackPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { restoreSession, loading, error, isAuthenticated } = useAuth();

  const provider = searchParams.get("provider") || "social";
  const callbackError = searchParams.get("error");
  const status = searchParams.get("status");

  useEffect(() => {
    if (status === "success" && !callbackError) {
      restoreSession();
    }
  }, [callbackError, restoreSession, status]);

  useEffect(() => {
    if (isAuthenticated && !error) {
      navigate("/", { replace: true });
    }
  }, [error, isAuthenticated, navigate]);

  return (
    <AuthLayout title="Signing You In">
      <Card style={{ padding: "24px" }}>
        <Flex direction="column" align="center" gap="4">
          {!callbackError && loading && <Spinner size="3" />}
          <Text align="center" size="4" weight="bold">
            {callbackError
              ? `${provider} sign-in failed`
              : `Completing your ${provider} sign-in`}
          </Text>
          <Text align="center" color="gray">
            {callbackError || error || "Please wait while we restore your session."}
          </Text>
          {(callbackError || error) && (
            <Button asChild>
              <Link to="/login">Back to Sign In</Link>
            </Button>
          )}
        </Flex>
      </Card>
    </AuthLayout>
  );
};

export default SocialAuthCallbackPage;