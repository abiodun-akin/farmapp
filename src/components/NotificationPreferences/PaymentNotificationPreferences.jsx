import { StarIcon } from "@radix-ui/react-icons";
import { Box, Card, Flex, Switch, Text } from "@radix-ui/themes";

/**
 * Payment Notifications Component
 * Controls notifications for payment-related events
 */
const PaymentNotificationPreferences = ({
  preferences,
  onPreferenceChange,
}) => {
  if (!preferences || !preferences.payment) return null;

  const paymentEvents = preferences.payment;

  const handleToggle = (eventKey) => {
    onPreferenceChange({
      payment: {
        ...paymentEvents,
        [eventKey]: !paymentEvents[eventKey],
      },
    });
  };

  // Events marked as important (cannot be disabled)
  const importantEvents = ["payment_success", "payment_failed"];

  const eventDetails = [
    {
      key: "payment_initialized",
      label: "Payment Started",
      description: "Confirmation when you initiate a payment",
      required: false,
    },
    {
      key: "payment_success",
      label: "Payment Successful",
      description: "Receipt and confirmation of successful payment",
      required: true,
    },
    {
      key: "payment_failed",
      label: "Payment Failed",
      description: "Alert when a payment attempt fails",
      required: true,
    },
    {
      key: "payment_reminder",
      label: "Renewal Reminder",
      description: "Reminder before your subscription renews",
      required: false,
    },
    {
      key: "payment_cancelled",
      label: "Payment Cancelled",
      description: "Confirmation when a payment is cancelled",
      required: false,
    },
    {
      key: "payment_refund",
      label: "Refund Processed",
      description: "Notification when a refund is processed",
      required: false,
    },
  ];

  return (
    <Flex direction="column" gap="4">
      <Card style={{ background: "#fef5e7", borderLeft: "4px solid #f39c12" }}>
        <Flex gap="2" align="start">
          <StarIcon
            style={{ marginTop: "2px", color: "#f39c12", flexShrink: 0 }}
          />
          <Text size="2" color="orange">
            Events marked with ⭐ are important for payment tracking and
            typically cannot be disabled.
          </Text>
        </Flex>
      </Card>

      {eventDetails.map((event) => (
        <Card key={event.key}>
          <Flex justify="between" align="start" gap="3">
            <Flex direction="column" gap="1" style={{ flex: 1 }}>
              <Flex gap="2" align="center">
                <Text weight="bold" size="3">
                  {event.label}
                </Text>
                {event.required && (
                  <StarIcon
                    style={{
                      width: "16px",
                      height: "16px",
                      color: "#f39c12",
                    }}
                  />
                )}
              </Flex>
              <Text color="gray" size="2">
                {event.description}
              </Text>
            </Flex>
            <Switch
              checked={paymentEvents[event.key] !== false}
              onCheckedChange={() => handleToggle(event.key)}
              disabled={event.required}
              size="2"
            />
          </Flex>
        </Card>
      ))}

      <Box style={{ paddingTop: "8px" }}>
        <Text size="1" color="gray">
          💳 Transaction History: View detailed payment history in your account
          dashboard. You'll always receive notifications for successful and
          failed payments.
        </Text>
      </Box>
    </Flex>
  );
};

export default PaymentNotificationPreferences;
