import { useEffect } from "react";
import { useSelector } from "react-redux";

/**
 * Hook for managing Firebase Cloud Messaging tokens
 * Automatically registers/unregisters device tokens for push notifications
 */
export const useFCMToken = () => {
  const user = useSelector((state) => state.user.user);
  const isAuthenticated = !!localStorage.getItem("token");

  useEffect(() => {
    // Skip if not authenticated or Firebase not available
    if (!isAuthenticated || !user) return;
    if (!("Notification" in window)) return;
    if (!("serviceWorker" in navigator)) return;

    const registerFCMToken = async () => {
      try {
        // Import Firebase messaging dynamically
        const { getMessaging, getToken } = await import("firebase/messaging");
        const { initializeApp } = await import("firebase/app");

        // Firebase config (would typically come from env)
        const firebaseConfig = {
          projectId: "farmconnect-faedd",
          // Add other Firebase config here
        };

        // Initialize Firebase if not already done
        const app = initializeApp(firebaseConfig);
        const messaging = getMessaging(app);

        // Request notification permission
        if (Notification.permission === "granted") {
          // Get FCM token
          const token = await getToken(messaging, {
            vapidKey: process.env.REACT_APP_FIREBASE_VAPID_KEY,
          });

          if (token) {
            // Send token to backend
            const { userApi } = await import("../api/userApi");
            await userApi.registerFCMToken(token);
            console.log("FCM token registered successfully");
          }
        } else if (Notification.permission !== "denied") {
          // Request permission
          const permission = await Notification.requestPermission();
          if (permission === "granted") {
            const token = await getToken(messaging, {
              vapidKey: process.env.REACT_APP_FIREBASE_VAPID_KEY,
            });
            if (token) {
              const { userApi } = await import("../api/userApi");
              await userApi.registerFCMToken(token);
            }
          }
        }
      } catch (error) {
        console.warn("FCM registration failed:", error);
        // Don't throw - graceful degradation if FCM not available
      }
    };

    registerFCMToken();
  }, [isAuthenticated, user]);
};

/**
 * Utility function to request notification permission
 */
export const requestNotificationPermission = async () => {
  if (!("Notification" in window)) {
    return false;
  }

  if (Notification.permission === "granted") {
    return true;
  }

  if (Notification.permission !== "denied") {
    const permission = await Notification.requestPermission();
    return permission === "granted";
  }

  return false;
};

export default useFCMToken;
