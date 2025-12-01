import * as Form from "@radix-ui/react-form";
import { Button, Flex, Link, Text, TextField } from "@radix-ui/themes";
import { useEffect } from "react";
import { FaApple, FaFacebook, FaGoogle } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import AuthLayout from "../layouts/AuthLayout";

const LoginPage = () => {
  const navigate = useNavigate();
  const { login, loading, error, isAuthenticated } = useAuth();

  const handleSubmit = (event) => {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(event.currentTarget));
    login(data.email, data.password);
  };

  useEffect(() => {
    if (isAuthenticated && !error) {
      navigate("/");
    }
  }, [isAuthenticated, error, navigate]);

  return (
    <AuthLayout title="Sign In">
      <Form.Root onSubmit={handleSubmit}>
        {error && <p>{error}</p>}
        {isAuthenticated && <p>You are logged in</p>}
        <div style={{ display: "grid", gap: "var(--space-4)" }}>
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

          <Form.Field
            name="password"
            style={{ display: "grid", gap: "var(--space-1)" }}
          >
            <Form.Label asChild>
              <Text size="2" weight="bold">
                Password
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
            <Form.Message match="valueMissing" asChild>
              <Text size="2" color="red">
                A password is required
              </Text>
            </Form.Message>
            <Form.Message match={(value) => value.length < 8} asChild>
              <Text size="2" color="red">
                Min 8 characters
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
              {loading ? "Signing in..." : "Sign In"}
            </Button>
          </Form.Submit>

          <Flex justify="center" direction="column" align="center" gap="1">
            <Text size="2" color="gray">
              Not a member?{" "}
              <Link href="/signup" ml="1">
                Create Account
              </Link>
            </Text>
            <Text size="2" color="gray" align={"center"}>
              By signing in, you agree to our <Link href="#">Terms</Link>.
            </Text>
          </Flex>

          <Flex align="center" justify="center" wrap="wrap" gap="3">
            <Text size="2" color="gray">
              --- or sign in with ---
            </Text>
          </Flex>

          <Flex align="center" justify="between" wrap="wrap" gap="3">
            <Button variant="outline" color="gray" highContrast>
              <FaGoogle /> Google
            </Button>
            <Button variant="outline" color="gray" highContrast>
              <FaFacebook /> facebook
            </Button>
            <Button variant="outline" color="gray" highContrast>
              <FaApple /> Apple
            </Button>
          </Flex>
        </div>
      </Form.Root>
    </AuthLayout>
  );
};

export default LoginPage;
