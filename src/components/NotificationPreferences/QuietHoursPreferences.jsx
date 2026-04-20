import {
  BellIcon,
  ClockIcon,
  EnvelopeClosedIcon,
  MobileIcon,
} from "@radix-ui/react-icons";
import { Box, Card, Flex, Select, Switch, Text } from "@radix-ui/themes";
import { useEffect, useState } from "react";

/**
 * Quiet Hours Preferences Component
 * Controls do-not-disturb / quiet hours settings
 */
const QuietHoursPreferences = ({ preferences, onPreferenceChange }) => {
  if (!preferences || !preferences.quietHours) return null;

  const [localQuietHours, setLocalQuietHours] = useState(
    preferences.quietHours,
  );

  useEffect(() => {
    setLocalQuietHours(preferences.quietHours);
  }, [preferences.quietHours]);

  const handleQuietHoursToggle = () => {
    const updated = {
      ...localQuietHours,
      enabled: !localQuietHours.enabled,
    };
    setLocalQuietHours(updated);
    onPreferenceChange({
      quietHours: updated,
    });
  };

  const handleTimeChange = (field, value) => {
    const updated = {
      ...localQuietHours,
      [field]: value,
    };
    setLocalQuietHours(updated);
    onPreferenceChange({
      quietHours: updated,
    });
  };

  const handleChannelToggle = (channel) => {
    const updated = {
      ...localQuietHours,
      respectChannels: {
        ...(localQuietHours.respectChannels || {}),
        [channel]: !(localQuietHours.respectChannels?.[channel] ?? true),
      },
    };
    setLocalQuietHours(updated);
    onPreferenceChange({
      quietHours: updated,
    });
  };

  const handleTimezoneChange = (timezone) => {
    const updated = {
      ...localQuietHours,
      timezone,
    };
    setLocalQuietHours(updated);
    onPreferenceChange({
      quietHours: updated,
    });
  };

  const timezones = [
    "UTC",
    "Africa/Lagos", // Nigeria
    "Africa/Johannesburg",
    "Africa/Cairo",
    "Europe/London",
    "Europe/Paris",
    "Asia/Dubai",
    "Asia/Kolkata",
    "America/New_York",
    "America/Chicago",
    "America/Los_Angeles",
    "Australia/Sydney",
  ];

  // Generate hours for time picker (0-23)
  const hours = Array.from({ length: 24 }, (_, i) =>
    i.toString().padStart(2, "0"),
  );

  // Generate minutes for time picker (0, 15, 30, 45)
  const minutes = ["00", "15", "30", "45"];

  return (
    <Flex direction="column" gap="4">
      {/* Main Toggle */}
      <Card style={{ background: "#ecf0f1", borderLeft: "4px solid #34495e" }}>
        <Flex justify="between" align="center">
          <Flex direction="column" gap="2">
            <Text weight="bold" size="3">
              🌙 Enable Quiet Hours
            </Text>
            <Text color="gray" size="2">
              {localQuietHours.enabled
                ? `Notifications paused from ${localQuietHours.startTime} to ${localQuietHours.endTime}`
                : "Set a time range when you don't want to be disturbed"}
            </Text>
          </Flex>
          <Switch
            checked={localQuietHours.enabled}
            onCheckedChange={handleQuietHoursToggle}
            size="2"
          />
        </Flex>
      </Card>

      {/* Quiet Hours Settings */}
      {localQuietHours.enabled && (
        <>
          {/* Timezone Selection */}
          <Card>
            <Flex direction="column" gap="3">
              <Text weight="bold" size="3">
                🌍 Timezone
              </Text>
              <Select.Root
                value={localQuietHours.timezone || "UTC"}
                onValueChange={handleTimezoneChange}
              >
                <Select.Trigger />
                <Select.Content>
                  <Select.Group>
                    <Select.Label>Select Timezone</Select.Label>
                    {timezones.map((tz) => (
                      <Select.Item key={tz} value={tz}>
                        {tz}
                      </Select.Item>
                    ))}
                  </Select.Group>
                </Select.Content>
              </Select.Root>
              <Text size="2" color="gray">
                Current timezone: {localQuietHours.timezone || "UTC"}
              </Text>
            </Flex>
          </Card>

          {/* Start Time */}
          <Card>
            <Flex direction="column" gap="3">
              <Text weight="bold" size="3">
                🕐 Start Time
              </Text>
              <Flex gap="3" align="end">
                <Flex direction="column" gap="2" style={{ flex: 1 }}>
                  <Text size="2" weight="medium">
                    Hour
                  </Text>
                  <Select.Root
                    value={(
                      localQuietHours.startTime?.split(":")?.[0] || "22"
                    ).toString()}
                    onValueChange={(hour) => {
                      const minutes =
                        localQuietHours.startTime?.split(":")?.[1] || "00";
                      handleTimeChange("startTime", `${hour}:${minutes}`);
                    }}
                  >
                    <Select.Trigger />
                    <Select.Content>
                      <Select.Group>
                        {hours.map((h) => (
                          <Select.Item key={h} value={h}>
                            {h}
                          </Select.Item>
                        ))}
                      </Select.Group>
                    </Select.Content>
                  </Select.Root>
                </Flex>
                <Flex direction="column" gap="2" style={{ flex: 1 }}>
                  <Text size="2" weight="medium">
                    Minute
                  </Text>
                  <Select.Root
                    value={(
                      localQuietHours.startTime?.split(":")?.[1] || "00"
                    ).toString()}
                    onValueChange={(minute) => {
                      const hour =
                        localQuietHours.startTime?.split(":")?.[0] || "22";
                      handleTimeChange("startTime", `${hour}:${minute}`);
                    }}
                  >
                    <Select.Trigger />
                    <Select.Content>
                      <Select.Group>
                        {minutes.map((m) => (
                          <Select.Item key={m} value={m}>
                            {m}
                          </Select.Item>
                        ))}
                      </Select.Group>
                    </Select.Content>
                  </Select.Root>
                </Flex>
              </Flex>
            </Flex>
          </Card>

          {/* End Time */}
          <Card>
            <Flex direction="column" gap="3">
              <Text weight="bold" size="3">
                🕑 End Time
              </Text>
              <Flex gap="3" align="end">
                <Flex direction="column" gap="2" style={{ flex: 1 }}>
                  <Text size="2" weight="medium">
                    Hour
                  </Text>
                  <Select.Root
                    value={(
                      localQuietHours.endTime?.split(":")?.[0] || "08"
                    ).toString()}
                    onValueChange={(hour) => {
                      const minutes =
                        localQuietHours.endTime?.split(":")?.[1] || "00";
                      handleTimeChange("endTime", `${hour}:${minutes}`);
                    }}
                  >
                    <Select.Trigger />
                    <Select.Content>
                      <Select.Group>
                        {hours.map((h) => (
                          <Select.Item key={h} value={h}>
                            {h}
                          </Select.Item>
                        ))}
                      </Select.Group>
                    </Select.Content>
                  </Select.Root>
                </Flex>
                <Flex direction="column" gap="2" style={{ flex: 1 }}>
                  <Text size="2" weight="medium">
                    Minute
                  </Text>
                  <Select.Root
                    value={(
                      localQuietHours.endTime?.split(":")?.[1] || "00"
                    ).toString()}
                    onValueChange={(minute) => {
                      const hour =
                        localQuietHours.endTime?.split(":")?.[0] || "08";
                      handleTimeChange("endTime", `${hour}:${minute}`);
                    }}
                  >
                    <Select.Trigger />
                    <Select.Content>
                      <Select.Group>
                        {minutes.map((m) => (
                          <Select.Item key={m} value={m}>
                            {m}
                          </Select.Item>
                        ))}
                      </Select.Group>
                    </Select.Content>
                  </Select.Root>
                </Flex>
              </Flex>
            </Flex>
          </Card>

          {/* Channel-Specific Quiet Hours */}
          <Card
            style={{ background: "#fef9e7", borderLeft: "4px solid #f1c40f" }}
          >
            <Flex direction="column" gap="3">
              <Text weight="bold" size="3">
                📢 Respect Quiet Hours For
              </Text>
              <Flex direction="column" gap="2">
                <Flex justify="between" align="center">
                  <Flex gap="2" align="center">
                    <EnvelopeClosedIcon
                      style={{ width: "16px", height: "16px" }}
                    />
                    <Text size="2">Email Notifications</Text>
                  </Flex>
                  <Switch
                    checked={localQuietHours.respectChannels?.email ?? true}
                    onCheckedChange={() => handleChannelToggle("email")}
                    size="2"
                  />
                </Flex>
                <Flex justify="between" align="center">
                  <Flex gap="2" align="center">
                    <MobileIcon style={{ width: "16px", height: "16px" }} />
                    <Text size="2">SMS Notifications</Text>
                  </Flex>
                  <Switch
                    checked={localQuietHours.respectChannels?.sms ?? true}
                    onCheckedChange={() => handleChannelToggle("sms")}
                    size="2"
                  />
                </Flex>
                <Flex justify="between" align="center">
                  <Flex gap="2" align="center">
                    <BellIcon style={{ width: "16px", height: "16px" }} />
                    <Text size="2">Push Notifications</Text>
                  </Flex>
                  <Switch
                    checked={localQuietHours.respectChannels?.push ?? true}
                    onCheckedChange={() => handleChannelToggle("push")}
                    size="2"
                  />
                </Flex>
              </Flex>
              <Text size="1" color="gray">
                Choose which notification channels should respect your quiet
                hours. Important security alerts may still come through.
              </Text>
            </Flex>
          </Card>
        </>
      )}

      <Box style={{ paddingTop: "8px" }}>
        <Flex gap="2" align="start">
          <ClockIcon style={{ marginTop: "2px", flexShrink: 0 }} />
          <Text size="1" color="gray">
            During quiet hours, notifications will be queued and delivered when
            quiet hours end. Critical security alerts may still be sent
            immediately.
          </Text>
        </Flex>
      </Box>
    </Flex>
  );
};

export default QuietHoursPreferences;
