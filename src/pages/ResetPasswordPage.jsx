import * as Form from "@radix-ui/react-form";
import { Button, Flex, Link, Text, TextField } from "@radix-ui/themes";
import { useEffect, useState } from "react";
import { Link as RouterLink, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import AuthLayout from "../layouts/AuthLayout";

const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [localError, setLocalError] = useState("");
  const token = searchParams.get("token") || "";
  const {
    resetPassword,
    loading,
    error,
    statusMessage,
    passwordResetCompleted,
    clearFeedback,
  } = useAuth();

  useEffect(() => () => clearFeedback(), [clearFeedback]);

  useEffect(() => {
    if (passwordResetCompleted && !error) {
      const timeoutId = window.setTimeout(() => navigate("/login"), 1200);
      return () => window.clearTimeout(timeoutId);
    }
    return undefined;
  }, [passwordResetCompleted, error, navigate]);

  const handleSubmit = (event) => {
    event.preventDefault();
    setLocalError("");

    if (!token) {
      setLocalError("Reset token is missing. Please request a new password reset email.");
      return;
    }

    const data = Object.fromEntries(new FormData(event.currentTarget));
    if (data.password !== data.confirmPassword) {
      setLocalError("Passwords do not match.");
      return;
    }

    resetPassword(token, data.password);
  };

  return (
    <AuthLayout title="Choose New Password">
      <Form.Root onSubmit={handleSubmit}>
        {(localError || error) && <Text color="red">{localError || error}</Text>}
        {statusMessage && <Text color="green">{statusMessage}</Text>}
        <div style={{ display: "grid", gap: "var(--space-4)" }}>
          <Text size="2" color="gray">
            Create a new password with at least 8 characters, one uppercase letter, and one number.
          </Text>

          <Form.Field
            name="password"
            style={{ display: "grid", gap: "var(--space-1)" }}
          >
            <Form.Label asChild>
              <Text size="2" weight="bold">
                New Password
              </Text>
            </Form.Label>
            <Form.Control asChild>
              <TextField.Root
                size="3"
                type="password"
                required
                minLength={8}
                placeholder="••••••••"
              />
            </Form.Control>
          </Form.Field>

          <Form.Field
            name="confirmPassword"
            style={{ display: "grid", gap: "var(--space-1)" }}
          >
            <Form.Label asChild>
              <Text size="2" weight="bold">
                Confirm Password
              </Text>
            </Form.Label>
            <Form.Control asChild>
              <TextField.Root
                size="3"
                type="password"
                required
                minLength={8}
                placeholder="••••••••"
              />
            </Form.Control>
          </Form.Field>

          <Form.Submit asChild>
            <Button
              disabled={loading || !token}
              size="3"
              style={{
                marginTop: "var(--space-3)",
                backgroundColor: "var(--color-pry-900)",
                color: "var(--color-white)",
              }}
            >
              {loading ? "Updating..." : "Reset Password"}
            </Button>
          </Form.Submit>

          <Flex justify="center" direction="column" align="center" gap="1">
            {!token && (
              <Text size="2" color="red" align="center">
                Reset token missing. Request a new reset email.
              </Text>
            )}
            <Text size="2" color="gray">
              Need a new link?{" "}
              <Link asChild ml="1">
                <RouterLink to="/forgot-password">Request reset email</RouterLink>
              </Link>
            </Text>
          </Flex>
        </div>
      </Form.Root>
    </AuthLayout>
  );
};

export default ResetPasswordPage;
