import { InfoCircledIcon } from "@radix-ui/react-icons";
import { Box, Card, Flex, Switch, Text } from "@radix-ui/themes";

/**
 * Channel Preferences Component
 * Controls which notification channels are enabled (Email, SMS, Push)
 */
const ChannelPreferences = ({ preferences, onPreferenceChange }) => {
  if (!preferences) return null;

  const handleChannelToggle = (channel) => {
    const newState = {
      ...preferences,
      channels: {
        ...preferences.channels,
        [channel]: !preferences.channels[channel],
      },
    };
    onPreferenceChange(newState);
  };

  return (
    <Flex direction="column" gap="4">
      {/* Email Channel */}
      <Card>
        <Flex direction="column" gap="3">
          <Flex justify="between" align="center">
            <Flex direction="column" gap="1">
              <Text weight="bold" size="3">
                📧 Email Notifications
              </Text>
              <Text color="gray" size="2">
                Receive notifications via email
              </Text>
            </Flex>
            <Switch
              checked={preferences.channels.email}
              onCheckedChange={() => handleChannelToggle("email")}
              size="2"
            />
          </Flex>
          <Box style={{ paddingTop: "8px" }}>
            <Flex gap="2" align="start">
              <InfoCircledIcon
                style={{ marginTop: "4px", color: "#2980b9", flexShrink: 0 }}
              />
              <Text size="2" color="blue">
                Required for critical notifications (passwords, security
                alerts). Disabling email will not disable these.
              </Text>
            </Flex>
          </Box>
        </Flex>
      </Card>

      {/* SMS Channel */}
      <Card>
        <Flex direction="column" gap="3">
          <Flex justify="between" align="center">
            <Flex direction="column" gap="1">
              <Text weight="bold" size="3">
                📱 SMS Notifications
              </Text>
              <Text color="gray" size="2">
                Receive notifications via text message
              </Text>
            </Flex>
            <Switch
              checked={preferences.channels.sms}
              onCheckedChange={() => handleChannelToggle("sms")}
              size="2"
            />
          </Flex>
          <Box style={{ paddingTop: "8px" }}>
            <Flex gap="2" align="start">
              <InfoCircledIcon
                style={{
                  marginTop: "4px",
                  color: "#f39c12",
                  flexShrink: 0,
                }}
              />
              <Text size="2" color="amber">
                Enable to receive trial reminders, payment alerts, and urgent
                notifications via SMS. Make sure your phone number is verified
                and up-to-date.
              </Text>
            </Flex>
          </Box>
        </Flex>
      </Card>

      {/* Push Notifications Channel */}
      <Card>
        <Flex direction="column" gap="3">
          <Flex justify="between" align="center">
            <Flex direction="column" gap="1">
              <Text weight="bold" size="3">
                🔔 Push Notifications
              </Text>
              <Text color="gray" size="2">
                Receive notifications in your browser
              </Text>
            </Flex>
            <Switch
              checked={preferences.channels.push}
              onCheckedChange={() => handleChannelToggle("push")}
              size="2"
            />
          </Flex>
          <Box style={{ paddingTop: "8px" }}>
            <Flex gap="2" align="start">
              <InfoCircledIcon
                style={{
                  marginTop: "4px",
                  color: "#27ae60",
                  flexShrink: 0,
                }}
              />
              <Text size="2" color="green">
                Receive real-time notifications in your browser about new
                messages, matches, and activity. You can control browser
                notification permissions in your browser settings.
              </Text>
            </Flex>
          </Box>
        </Flex>
      </Card>

      {/* Channel Settings Summary */}
      <Card
        style={{
          background: "#f5f9ff",
          borderLeft: "4px solid #2980b9",
        }}
      >
        <Flex direction="column" gap="2">
          <Text weight="bold" size="3" color="blue">
            Active Channels
          </Text>
          <Text size="2">
            {[
              preferences.channels.email && "📧 Email",
              preferences.channels.sms && "📱 SMS",
              preferences.channels.push && "🔔 Push",
            ]
              .filter(Boolean)
              .join(", ") || "No channels enabled"}
          </Text>
        </Flex>
      </Card>
    </Flex>
  );
};

export default ChannelPreferences;
