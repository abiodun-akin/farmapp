import { Button, Flex, Text } from "@radix-ui/themes";
import { useEffect, useRef } from "react";
import { useDispatch } from "react-redux";
import { Link as RouterLink, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import AuthLayout from "../layouts/AuthLayout";
import {
  clearAuthFeedback,
  verifyEmailRequest,
} from "../redux/slices/userSlice";

const VerifyEmailPage = () => {
  const { loading, error, statusMessage, emailVerified } = useAuth();
  const dispatch = useDispatch();
  const location = useLocation();
  const navigate = useNavigate();
  const verifiedTokenRef = useRef(null);

  const token = new URLSearchParams(location.search).get("token");

  useEffect(() => {
    if (!token) {
      return;
    }

    if (verifiedTokenRef.current === token) {
      return;
    }

    verifiedTokenRef.current = token;
    dispatch(verifyEmailRequest({ token }));
  }, [token, dispatch]);

  useEffect(() => {
    return () => {
      dispatch(clearAuthFeedback());
    };
  }, [dispatch]);

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
