import { InfoCircledIcon, StarIcon } from "@radix-ui/react-icons";
import { Box, Card, Flex, Switch, Text } from "@radix-ui/themes";

/**
 * Authentication Notifications Component
 * Controls notifications for auth-related events
 */
const AuthNotificationPreferences = ({ preferences, onPreferenceChange }) => {
  if (!preferences || !preferences.auth) return null;

  const authEvents = preferences.auth;

  const handleToggle = (eventKey) => {
    onPreferenceChange({
      auth: {
        ...authEvents,
        [eventKey]: !authEvents[eventKey],
      },
    });
  };

  // Events marked as important (cannot be disabled)
  const importantEvents = [
    "email_verification",
    "two_factor_setup",
    "password_reset",
  ];

  const eventDetails = [
    {
      key: "signup",
      label: "Account Created",
      description: "Welcome email when you create an account",
      required: false,
    },
    {
      key: "login",
      label: "New Login",
      description:
        "Notification when your account is accessed from a new device",
      required: false,
    },
    {
      key: "logout",
      label: "Logout Confirmation",
      description: "Confirm when you log out from your account",
      required: false,
    },
    {
      key: "password_reset",
      label: "Password Reset Request",
      description: "Notification when password reset is initiated",
      required: true,
    },
    {
      key: "password_reset_completed",
      label: "Password Changed",
      description: "Confirmation that your password has been changed",
      required: false,
    },
    {
      key: "email_verification",
      label: "Email Verification",
      description: "Continue receiving verification links and reminders",
      required: true,
    },
    {
      key: "two_factor_setup",
      label: "2FA Setup",
      description: "Notifications related to two-factor authentication setup",
      required: true,
    },
    {
      key: "two_factor_login",
      label: "2FA Login Codes",
      description: "Receive 2FA codes via SMS or email when logging in",
      required: false,
    },
    {
      key: "security_alert",
      label: "Security Alerts",
      description: "Suspicious activity or unauthorized access attempts",
      required: true,
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
            Events marked with a star are important for account security and
            cannot be disabled.
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
              checked={authEvents[event.key] !== false}
              onCheckedChange={() => handleToggle(event.key)}
              disabled={event.required}
              size="2"
            />
          </Flex>
        </Card>
      ))}

      <Box style={{ paddingTop: "8px" }}>
        <Flex gap="2" align="start">
          <InfoCircledIcon style={{ marginTop: "2px", flexShrink: 0 }} />
          <Text size="1" color="gray">
            Tip: Keep security-related notifications enabled to protect your
            account. If you disable these, you won't be notified of suspicious
            activity.
          </Text>
        </Flex>
      </Box>
    </Flex>
  );
};

export default AuthNotificationPreferences;
