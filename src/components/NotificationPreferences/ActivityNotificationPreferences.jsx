import { Box, Card, Flex, Switch, Text } from "@radix-ui/themes";

/**
 * Activity Notifications Component
 * Controls notifications for user activity and matching events
 */
const ActivityNotificationPreferences = ({
  preferences,
  onPreferenceChange,
}) => {
  if (!preferences || !preferences.activity) return null;

  const activityEvents = preferences.activity;

  const handleToggle = (eventKey) => {
    onPreferenceChange({
      activity: {
        ...activityEvents,
        [eventKey]: !activityEvents[eventKey],
      },
    });
  };

  const eventDetails = [
    {
      key: "new_match",
      label: "New Match",
      description: "When someone matches with your profile",
      icon: "💕",
    },
    {
      key: "interest_expressed",
      label: "Interest Expressed",
      description: "When someone shows interest in your profile",
      icon: "👍",
    },
    {
      key: "new_message",
      label: "New Messages",
      description: "When you receive a new message from a match",
      icon: "💬",
    },
    {
      key: "match_archived",
      label: "Match Archived",
      description: "When a match conversation is archived",
      icon: "📦",
    },
    {
      key: "profile_completed",
      label: "Profile Completed",
      description: "When your profile setup is marked as complete",
      icon: "✅",
    },
    {
      key: "profile_updated",
      label: "Profile Updated",
      description: "When your profile information is successfully updated",
      icon: "📝",
    },
  ];

  return (
    <Flex direction="column" gap="4">
      <Card style={{ background: "#e8f4f8", borderLeft: "4px solid #3498db" }}>
        <Flex gap="2" align="start">
          <Text size="2" color="blue">
            🎯 Stay connected with matches and activity. Customize how you're
            notified about new connections, messages, and profile updates.
          </Text>
        </Flex>
      </Card>

      {eventDetails.map((event) => (
        <Card key={event.key}>
          <Flex justify="between" align="start" gap="3">
            <Flex direction="column" gap="1" style={{ flex: 1 }}>
              <Flex gap="2" align="center">
                <Text size="3">{event.icon}</Text>
                <Text weight="bold" size="3">
                  {event.label}
                </Text>
              </Flex>
              <Text color="gray" size="2">
                {event.description}
              </Text>
            </Flex>
            <Switch
              checked={activityEvents[event.key] !== false}
              onCheckedChange={() => handleToggle(event.key)}
              size="2"
            />
          </Flex>
        </Card>
      ))}

      <Box style={{ paddingTop: "8px" }}>
        <Text size="1" color="gray">
          🔔 Pro Tip: Enable notifications for "New Messages" to stay engaged
          with your matches. You can always view all activity in your dashboard.
        </Text>
      </Box>
    </Flex>
  );
};

export default ActivityNotificationPreferences;
