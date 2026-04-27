import { Button, Card, Flex, Spinner, Text } from "@radix-ui/themes";
import { useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import api from "../config/api";
import AuthLayout from "../layouts/AuthLayout";
import { fetchSessionSuccess } from "../redux/slices/userSlice";

const EXCHANGE_TIMEOUT_MS = 15000; // 15 seconds

const SocialAuthCallbackPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  const handled = useRef(false);
  const [exchangeError, setExchangeError] = useState(null);
  const [exchangeErrorCode, setExchangeErrorCode] = useState(null);
  const [loading, setLoading] = useState(true);

  const provider = searchParams.get("provider") || "social";
  const callbackError = searchParams.get("error");
  const status = searchParams.get("status");
  const exchangeCode = searchParams.get("code");

  useEffect(() => {
    if (handled.current) return;
    handled.current = true;

    if (callbackError || status !== "success" || !exchangeCode) {
      setLoading(false);
      return;
    }

    // Remove the code from browser history immediately
    window.history.replaceState({}, "", "/auth/social/callback");

    // Set timeout for exchange request
    const timeoutId = setTimeout(() => {
      setExchangeError("Sign-in took too long. Please try again.");
      setExchangeErrorCode("EXCHANGE_TIMEOUT");
      setLoading(false);
      console.error("[Social Auth] Exchange timeout", {
        provider,
        timeout: EXCHANGE_TIMEOUT_MS,
      });
    }, EXCHANGE_TIMEOUT_MS);

    api
      .post("/auth/social/exchange", { code: exchangeCode })
      .then(({ data }) => {
        clearTimeout(timeoutId);
        console.log("[Social Auth] Exchange successful", { provider });
        localStorage.setItem("token", data.token);
        dispatch(fetchSessionSuccess({ user: data.user, token: data.token }));
        navigate("/", { replace: true });
      })
      .catch((err) => {
        clearTimeout(timeoutId);
        const errorMessage =
          err.response?.data?.error || err.message || "Sign-in failed";
        const errorCode = err.response?.data?.code || "UNKNOWN_ERROR";

        console.error("[Social Auth] Exchange failed", {
          provider,
          errorMessage,
          errorCode,
          status: err.response?.status,
        });

        setExchangeError(errorMessage);
        setExchangeErrorCode(errorCode);
        setLoading(false);
      });

    return () => clearTimeout(timeoutId);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const displayError = callbackError || exchangeError;

  return (
    <AuthLayout title="Signing You In">
      <Card style={{ padding: "24px" }}>
        <Flex direction="column" align="center" gap="4">
          {!displayError && loading && <Spinner size="3" />}
          <Text align="center" size="4" weight="bold">
            {displayError
              ? `${provider} sign-in failed`
              : `Completing your ${provider} sign-in`}
          </Text>
          <Text align="center" color="gray">
            {displayError ? (
              <Flex direction="column" align="center" gap="2">
                <span>{displayError}</span>
                {exchangeErrorCode && exchangeErrorCode !== "UNKNOWN_ERROR" && (
                  <span style={{ fontSize: "0.85em", opacity: 0.7 }}>
                    Error code: {exchangeErrorCode}
                  </span>
                )}
                {exchangeErrorCode === "EXCHANGE_CODE_EXPIRED" && (
                  <span style={{ fontSize: "0.85em" }}>
                    This can happen with slow connections. Please try again.
                  </span>
                )}
                {exchangeErrorCode === "EXCHANGE_TIMEOUT" && (
                  <span style={{ fontSize: "0.85em" }}>
                    Your network may be slow. Please ensure you have a stable
                    connection.
                  </span>
                )}
              </Flex>
            ) : (
              "Please wait while we complete your sign-in."
            )}
          </Text>
          {displayError && (
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
