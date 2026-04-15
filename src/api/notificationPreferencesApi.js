import api from "../config/api";

/**
 * Notification Preferences API Client
 */
export const notificationPreferencesAPI = {
  /**
   * GET /api/notification-preferences
   * Fetch user's notification preferences
   */
  getPreferences: () => api.get("/notification-preferences"),

  /**
   * PUT /api/notification-preferences
   * Update notification preferences (partial or full)
   */
  updatePreferences: (data) => api.put("/notification-preferences", data),

  /**
   * PUT /api/notification-preferences/channel/:channel
   * Toggle a specific channel (email, sms, push)
   */
  toggleChannel: (channel, enabled) =>
    api.put(`/notification-preferences/channel/${channel}`, { enabled }),

  /**
   * PUT /api/notification-preferences/event/:category/:event
   * Toggle a specific event notification
   */
  toggleEvent: (category, event, enabled) =>
    api.put(`/notification-preferences/event/${category}/${event}`, {
      enabled,
    }),

  /**
   * PUT /api/notification-preferences/quiet-hours
   * Update quiet hours settings
   */
  updateQuietHours: (quietHoursData) =>
    api.put("/notification-preferences/quiet-hours", quietHoursData),

  /**
   * PUT /api/notification-preferences/reset
   * Reset preferences to defaults
   */
  resetPreferences: () => api.put("/notification-preferences/reset"),
};

export default notificationPreferencesAPI;
