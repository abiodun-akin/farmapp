import { Box, Button, Card, Flex, Spinner, Tabs, Text } from "@radix-ui/themes";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import ErrorDisplay from "../components/ErrorDisplay";
import ActivityNotificationPreferences from "../components/NotificationPreferences/ActivityNotificationPreferences";
import AuthNotificationPreferences from "../components/NotificationPreferences/AuthNotificationPreferences";
import ChannelPreferences from "../components/NotificationPreferences/ChannelPreferences";
import PaymentNotificationPreferences from "../components/NotificationPreferences/PaymentNotificationPreferences";
import QuietHoursPreferences from "../components/NotificationPreferences/QuietHoursPreferences";
import {
  clearError,
  fetchPreferencesRequest,
  resetPreferencesRequest,
  updatePreferencesLocally,
  updatePreferencesRequest,
} from "../redux/slices/notificationPreferencesSlice";

const NotificationPreferencesPage = () => {
  const dispatch = useDispatch();
  const { preferences, loading, saving, resetting, error, unsavedChanges } =
    useSelector((state) => state.notificationPreferences);

  // Load preferences on mount
  useEffect(() => {
    dispatch(fetchPreferencesRequest());
  }, [dispatch]);

  const handlePreferenceChange = (updates) => {
    dispatch(updatePreferencesLocally(updates));
  };

  const handleSave = () => {
    dispatch(updatePreferencesRequest({ preferences }));
  };

  const handleReset = () => {
    if (
      !window.confirm(
        "Are you sure you want to reset all preferences to defaults?",
      )
    ) {
      return;
    }
    dispatch(resetPreferencesRequest());
  };

  const handleRetry = () => {
    dispatch(clearError());
    dispatch(fetchPreferencesRequest());
  };

  if (loading) {
    return (
      <Flex justify="center" align="center" minHeight="400px">
        <Spinner />
      </Flex>
    );
  }

  if (error || !preferences) {
    return (
      <Box style={{ maxWidth: "900px", margin: "0 auto", padding: "24px" }}>
        <Flex direction="column" gap="4" align="center">
          <Text as="h1" size="6" weight="bold" color="red">
            Unable to Load Preferences
          </Text>
          <ErrorDisplay
            error={error || "Failed to load your notification preferences"}
            onRetry={handleRetry}
            showDismiss={false}
          />
        </Flex>
      </Box>
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
            disabled={saving || resetting}
          >
            {resetting ? "Resetting..." : "Reset to Defaults"}
          </Button>
          <Button
            onClick={handleSave}
            disabled={!unsavedChanges || saving || resetting}
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
