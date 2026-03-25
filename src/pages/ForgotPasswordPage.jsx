import * as Form from "@radix-ui/react-form";
import { Button, Flex, Link, Text, TextField } from "@radix-ui/themes";
import { useEffect } from "react";
import { Link as RouterLink } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import AuthLayout from "../layouts/AuthLayout";

const ForgotPasswordPage = () => {
  const {
    forgotPassword,
    loading,
    error,
    statusMessage,
    passwordResetRequested,
    clearFeedback,
  } = useAuth();

  useEffect(() => () => clearFeedback(), [clearFeedback]);

  const handleSubmit = (event) => {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(event.currentTarget));
    forgotPassword(data.email);
  };

  return (
    <AuthLayout title="Reset Password">
      <Form.Root onSubmit={handleSubmit}>
        {error && <Text color="red">{error}</Text>}
        {statusMessage && <Text color="green">{statusMessage}</Text>}
        <div style={{ display: "grid", gap: "var(--space-4)" }}>
          <Text size="2" color="gray">
            Enter your email address and we will send you a password reset link.
          </Text>

          <Form.Field
            name="email"
            style={{ display: "grid", gap: "var(--space-1)" }}
          >
            <Form.Label asChild>
              <Text size="2" weight="bold">
                Email
              </Text>
            </Form.Label>
            <Form.Control asChild>
              <TextField.Root
                size="3"
                type="email"
                required
                placeholder="you@example.com"
              />
            </Form.Control>
            <Form.Message match="valueMissing" asChild>
              <Text size="2" color="red">
                Please enter your email
              </Text>
            </Form.Message>
            <Form.Message match="typeMismatch" asChild>
              <Text size="2" color="red">
                Must be a valid email
              </Text>
            </Form.Message>
          </Form.Field>

          <Form.Submit asChild>
            <Button
              disabled={loading}
              size="3"
              style={{
                marginTop: "var(--space-3)",
                backgroundColor: "var(--color-pry-900)",
                color: "var(--color-white)",
              }}
            >
              {loading ? "Sending..." : "Send Reset Link"}
            </Button>
          </Form.Submit>

          <Flex justify="center" direction="column" align="center" gap="1">
            {passwordResetRequested && (
              <Text size="2" color="gray" align="center">
                Check your inbox and spam folder for the reset email.
              </Text>
            )}
            <Text size="2" color="gray">
              Remembered your password?{" "}
              <Link asChild ml="1">
                <RouterLink to="/login">Sign In</RouterLink>
              </Link>
            </Text>
          </Flex>
        </div>
      </Form.Root>
    </AuthLayout>
  );
};

export default ForgotPasswordPage;
