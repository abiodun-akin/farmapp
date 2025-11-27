import { Button, Card, Flex, Text } from "@radix-ui/themes";
import { useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import FullPageLayout from "../layouts/FullPageLayout";

const PricingPage = () => {
  const navigate = useNavigate();
  const [loadingPlan, setLoadingPlan] = useState(null);
  const { isAuthenticated } = useSelector((state) => state.user);

  const handleChoosePlan = (plan) => {
    if (!isAuthenticated) {
      console.log("User not authenticated, redirecting to login");
      navigate("/login", { state: { redirectTo: `/payment?plan=${plan}` } });
      return;
    }
    setLoadingPlan(plan);
    setTimeout(() => {
      navigate(`/payment?plan=${plan}`);
      setLoadingPlan(null);
    }, 500);
  };

  return (
    <FullPageLayout>
      <Flex
        direction="column"
        align="center"
        justify="center"
        p="8"
        gap="8"
        style={{ minHeight: "100vh" }}
      >
        <Text size="8" weight="bold" style={{ color: "white" }}>
          Our Pricing Plans
        </Text>
        <Flex gap="8" wrap="wrap" justify="center">
          <Card
            style={{
              backgroundColor: "white",
              width: "320px",
              minHeight: "384px",
            }}
          >
            <Flex direction="column" align="center" p="6" gap="4" height="100%">
              <Text size="6" weight="bold">
                Basic Plan
              </Text>
              <Text size="8" weight="bold">
                $10<Text size="4">/month</Text>
              </Text>
              <Flex
                direction="column"
                gap="2"
                style={{ textAlign: "left", flexGrow: 1 }}
              >
                <Text>Feature 1</Text>
                <Text>Feature 2</Text>
                <Text>Feature 3</Text>
              </Flex>
              <Button
                onClick={() => handleChoosePlan("basic")}
                disabled={loadingPlan === "basic"}
                style={{
                  backgroundColor: "var(--color-pry-800)",
                  color: "white",
                  borderRadius: "9999px",
                  opacity: loadingPlan === "basic" ? 0.7 : 1,
                }}
              >
                {loadingPlan === "basic" ? "Processing..." : "Choose Plan"}
              </Button>
            </Flex>
          </Card>
          <Card
            style={{
              backgroundColor: "white",
              width: "320px",
              minHeight: "384px",
            }}
          >
            <Flex direction="column" align="center" p="6" gap="4" height="100%">
              <Text size="6" weight="bold">
                Pro Plan
              </Text>
              <Text size="8" weight="bold">
                $20<Text size="4">/month</Text>
              </Text>
              <Flex
                direction="column"
                gap="2"
                style={{ textAlign: "left", flexGrow: 1 }}
              >
                <Text>Feature 1</Text>
                <Text>Feature 2</Text>
                <Text>Feature 3</Text>
                <Text>Feature 4</Text>
              </Flex>
              <Button
                onClick={() => handleChoosePlan("pro")}
                disabled={loadingPlan === "pro"}
                style={{
                  backgroundColor: "var(--color-pry-800)",
                  color: "white",
                  borderRadius: "9999px",
                  opacity: loadingPlan === "pro" ? 0.7 : 1,
                }}
              >
                {loadingPlan === "pro" ? "Processing..." : "Choose Plan"}
              </Button>
            </Flex>
          </Card>
          <Card
            style={{
              backgroundColor: "white",
              width: "320px",
              minHeight: "384px",
            }}
          >
            <Flex direction="column" align="center" p="6" gap="4" height="100%">
              <Text size="6" weight="bold">
                Enterprise Plan
              </Text>
              <Text size="8" weight="bold">
                $30<Text size="4">/month</Text>
              </Text>
              <Flex
                direction="column"
                gap="2"
                style={{ textAlign: "left", flexGrow: 1 }}
              >
                <Text>Feature 1</Text>
                <Text>Feature 2</Text>
                <Text>Feature 3</Text>
                <Text>Feature 4</Text>
                <Text>Feature 5</Text>
              </Flex>
              <Button
                onClick={() => handleChoosePlan("enterprise")}
                disabled={loadingPlan === "enterprise"}
                style={{
                  backgroundColor: "var(--color-pry-800)",
                  color: "white",
                  borderRadius: "9999px",
                  opacity: loadingPlan === "enterprise" ? 0.7 : 1,
                }}
              >
                {loadingPlan === "enterprise" ? "Processing..." : "Choose Plan"}
              </Button>
            </Flex>
          </Card>
        </Flex>
      </Flex>
    </FullPageLayout>
  );
};

export default PricingPage;
