import {
  BellIcon,
  BoxIcon,
  ChatBubbleIcon,
  CheckCircledIcon,
  HandIcon,
  HeartIcon,
  Pencil1Icon,
  TargetIcon,
} from "@radix-ui/react-icons";
import { Box, Card, Flex, Switch, Text } from "@radix-ui/themes";

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

  // Helper to render icons
  const renderIcon = (iconName) => {
    const iconProps = { style: { width: "20px", height: "20px" } };
    const iconMap = {
      heart: <HeartIcon {...iconProps} />,
      thumbsUp: <HandIcon {...iconProps} />,
      chat: <ChatBubbleIcon {...iconProps} />,
      box: <BoxIcon {...iconProps} />,
      checkCircled: <CheckCircledIcon {...iconProps} />,
      pencil1: <Pencil1Icon {...iconProps} />,
    };
    return iconMap[iconName] || null;
  };

  const eventDetails = [
    {
      key: "new_match",
      label: "New Match",
      description: "When someone matches with your profile",
      icon: "heart",
    },
    {
      key: "interest_expressed",
      label: "Interest Expressed",
      description: "When someone shows interest in your profile",
      icon: "thumbsUp",
    },
    {
      key: "new_message",
      label: "New Messages",
      description: "When you receive a new message from a match",
      icon: "chat",
    },
    {
      key: "match_archived",
      label: "Match Archived",
      description: "When a match conversation is archived",
      icon: "box",
    },
    {
      key: "profile_completed",
      label: "Profile Completed",
      description: "When your profile setup is marked as complete",
      icon: "checkCircled",
    },
    {
      key: "profile_updated",
      label: "Profile Updated",
      description: "When your profile information is successfully updated",
      icon: "pencil1",
    },
  ];

  return (
    <Box>
      <Card style={{ background: "#e8f4f8", borderLeft: "4px solid #3498db" }}>
        <Flex gap="2" align="start">
          <TargetIcon style={{ marginTop: "2px", flexShrink: 0 }} />
          <Text size="2" color="blue">
            Stay connected with matches and activity. Customize how you're
            notified about new connections, messages, and profile updates.
          </Text>
        </Flex>
      </Card>

      <Box style={{ marginTop: "16px" }}>
        {eventDetails.map((event) => (
          <Card key={event.key} style={{ marginBottom: "12px" }}>
            <Flex justify="between" align="center">
              <Flex direction="column" gap="1">
                <Flex gap="2" align="center">
                  <Text size="3">{renderIcon(event.icon)}</Text>
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
              />
            </Flex>
          </Card>
        ))}
      </Box>

      <Box style={{ paddingTop: "8px" }}>
        <Flex gap="2" align="start">
          <BellIcon style={{ marginTop: "2px", flexShrink: 0 }} />
          <Text size="1" color="gray">
            Pro Tip: Enable notifications for "New Messages" to stay engaged
            with your matches. You can always view all activity in your
            dashboard.
          </Text>
        </Flex>
      </Box>
    </Box>
  );
};

export default ActivityNotificationPreferences;
