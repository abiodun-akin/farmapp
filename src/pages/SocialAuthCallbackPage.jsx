import { Card, Flex, Spinner, Text, Button } from "@radix-ui/themes";
import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import AuthLayout from "../layouts/AuthLayout";
import { fetchSessionSuccess } from "../redux/slices/userSlice";
import api from "../config/api";

const SocialAuthCallbackPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  const handled = useRef(false);
  const [exchangeError, setExchangeError] = useState(null);
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

    api
      .post("/auth/social/exchange", { code: exchangeCode })
      .then(({ data }) => {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        dispatch(fetchSessionSuccess({ user: data.user, token: data.token }));
        navigate("/", { replace: true });
      })
      .catch((err) => {
        setExchangeError(
          err.response?.data?.error || "Sign-in failed. Please try again.",
        );
        setLoading(false);
      });
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
            {displayError || "Please wait while we complete your sign-in."}
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
