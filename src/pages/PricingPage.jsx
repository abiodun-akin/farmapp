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
      navigate("/login", { state: { redirectTo: `/payment?plan=${plan}` } });
      return;
    }
    setLoadingPlan(plan);
    setTimeout(() => {
      navigate(`/payment?plan=${plan}`);
      setLoadingPlan(null);
    }, 500);
  };

  const plans = [
    {
      id: "basic",
      name: "Basic Plan",
      price: "₦5,000",
      description: "Get started with our 30 days free trial.",
      features: ["Free signup", "Free listing", "Unlimited listing", "Basic support", "Analytics dashboard", "Access to community", "And many more..."],
    },
    // {
    //   id: "pro",
    //   name: "Pro Plan",
    //   price: "₦10,000",
    //   description: "Best for growing businesses",
    //   features: ["Feature 1", "Feature 2", "Feature 3", "Feature 4"],
    // },
    // {
    //   id: "enterprise",
    //   name: "Enterprise Plan",
    //   price: "₦15,000",
    //   description: "For large-scale operations",
    //   features: [
    //     "Feature 1",
    //     "Feature 2",
    //     "Feature 3",
    //     "Feature 4",
    //     "Feature 5",
    //   ],
    // },
  ];

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
          {plans.map((plan) => (
            <Card
              key={plan.id}
              style={{
                backgroundColor: "white",
                width: "320px",
                minHeight: "384px",
              }}
            >
              <Flex
                direction="column"
                align="center"
                p="6"
                gap="4"
                height="100%"
              >
                <Text size="6" weight="bold">
                  {plan.name}
                </Text>
                <Text size="2" color="gray">
                  {plan.description}
                </Text>
                <Text size="8" weight="bold">
                  {plan.price}
                </Text>
                <Text size="2" color="gray">
                  /month
                </Text>
                <Flex
                  direction="column"
                  gap="2"
                  style={{ textAlign: "left", flexGrow: 1 }}
                >
                  {plan.features.map((feature, idx) => (
                    <Text key={idx} size="2">
                      ✓ {feature}
                    </Text>
                  ))}
                </Flex>
                <Button
                  onClick={() => handleChoosePlan(plan.id)}
                  disabled={loadingPlan === plan.id}
                  style={{
                    backgroundColor: "var(--color-pry-800)",
                    color: "white",
                    borderRadius: "9999px",
                    opacity: loadingPlan === plan.id ? 0.7 : 1,
                  }}
                >
                  {loadingPlan === plan.id ? "Processing..." : "Choose Plan"}
                </Button>
              </Flex>
            </Card>
          ))}
        </Flex>
      </Flex>
    </FullPageLayout>
  );
};

export default PricingPage;
