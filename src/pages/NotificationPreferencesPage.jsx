import { Box, Button, Card, Flex, Spinner, Tabs, Text } from "@radix-ui/themes";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import notificationPreferencesAPI from "../api/notificationPreferencesApi";
import ActivityNotificationPreferences from "../components/NotificationPreferences/ActivityNotificationPreferences";
import AuthNotificationPreferences from "../components/NotificationPreferences/AuthNotificationPreferences";
import ChannelPreferences from "../components/NotificationPreferences/ChannelPreferences";
import PaymentNotificationPreferences from "../components/NotificationPreferences/PaymentNotificationPreferences";
import QuietHoursPreferences from "../components/NotificationPreferences/QuietHoursPreferences";
import { addToast } from "../redux/slices/toastSlice";

const NotificationPreferencesPage = () => {
  const dispatch = useDispatch();
  const [preferences, setPreferences] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [unsavedChanges, setUnsavedChanges] = useState(false);

  // Load preferences on mount
  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      setLoading(true);
      const response = await notificationPreferencesAPI.getPreferences();
      setPreferences(response.data);
      setUnsavedChanges(false);
    } catch (error) {
      dispatch(
        addToast({
          message: "Failed to load notification preferences",
          type: "error",
        }),
      );
      console.error("Error loading preferences:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePreferenceChange = (updates) => {
    setPreferences((prev) => ({
      ...prev,
      ...updates,
    }));
    setUnsavedChanges(true);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const response =
        await notificationPreferencesAPI.updatePreferences(preferences);
      setPreferences(response.data.preferences);
      setUnsavedChanges(false);
      dispatch(
        addToast({
          message: "Notification preferences saved successfully",
          type: "success",
        }),
      );
    } catch (error) {
      dispatch(
        addToast({
          message: "Failed to save preferences",
          type: "error",
        }),
      );
      console.error("Error saving preferences:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    if (
      !window.confirm(
        "Are you sure you want to reset all preferences to defaults?",
      )
    ) {
      return;
    }

    try {
      setSaving(true);
      const response = await notificationPreferencesAPI.resetPreferences();
      setPreferences(response.data.preferences);
      setUnsavedChanges(false);
      dispatch(
        addToast({
          message: "Preferences reset to defaults",
          type: "success",
        }),
      );
    } catch (error) {
      dispatch(
        addToast({
          message: "Failed to reset preferences",
          type: "error",
        }),
      );
      console.error("Error resetting preferences:", error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Flex justify="center" align="center" minHeight="400px">
        <Spinner />
      </Flex>
    );
  }

  return (
    <Box style={{ maxWidth: "900px", margin: "0 auto" }}>
      <Flex direction="column" gap="6">
        {/* Header */}
        <Flex direction="column" gap="2">
          <Text as="h1" size="8" weight="bold">
            Notification Preferences
          </Text>
          <Text color="gray" size="3">
            Manage how and when you receive notifications from Farm Connect
          </Text>
        </Flex>

        {/* Warning Banner */}
        {unsavedChanges && (
          <Card
            style={{
              background: "#fff9e7",
              borderLeft: "4px solid #f39c12",
              padding: "16px",
              borderRadius: "6px",
            }}
          >
            <Text size="2" color="brown">
              ⚠️ You have unsaved changes
            </Text>
          </Card>
        )}

        {/* Tabs with Preference Categories */}
        <Tabs.Root defaultValue="channels">
          <Tabs.List>
            <Tabs.Trigger value="channels">Channels</Tabs.Trigger>
            <Tabs.Trigger value="auth">Authentication</Tabs.Trigger>
            <Tabs.Trigger value="payments">Payments & Billing</Tabs.Trigger>
            <Tabs.Trigger value="activity">Activity</Tabs.Trigger>
            <Tabs.Trigger value="quiet-hours">Quiet Hours</Tabs.Trigger>
          </Tabs.List>

          {/* Channels Tab */}
          <Tabs.Content value="channels">
            <ChannelPreferences
              preferences={preferences}
              onPreferenceChange={handlePreferenceChange}
            />
          </Tabs.Content>

          {/* Authentication Notifications Tab */}
          <Tabs.Content value="auth">
            <AuthNotificationPreferences
              preferences={preferences}
              onPreferenceChange={handlePreferenceChange}
            />
          </Tabs.Content>

          {/* Payment Notifications Tab */}
          <Tabs.Content value="payments">
            <PaymentNotificationPreferences
              preferences={preferences}
              onPreferenceChange={handlePreferenceChange}
            />
          </Tabs.Content>

          {/* Activity Notifications Tab */}
          <Tabs.Content value="activity">
            <ActivityNotificationPreferences
              preferences={preferences}
              onPreferenceChange={handlePreferenceChange}
            />
          </Tabs.Content>

          {/* Quiet Hours Tab */}
          <Tabs.Content value="quiet-hours">
            <QuietHoursPreferences
              preferences={preferences}
              onPreferenceChange={handlePreferenceChange}
            />
          </Tabs.Content>
        </Tabs.Root>

        {/* Action Buttons */}
        <Flex gap="3" justify="end">
          <Button
            color="gray"
            variant="outline"
            onClick={handleReset}
            disabled={saving}
          >
            Reset to Defaults
          </Button>
          <Button
            onClick={handleSave}
            disabled={!unsavedChanges || saving}
            color="green"
          >
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </Flex>
      </Flex>
    </Box>
  );
};

export default NotificationPreferencesPage;
