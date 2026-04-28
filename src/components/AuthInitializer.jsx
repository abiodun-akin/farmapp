import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { logoutRequest } from "../redux/slices/userSlice";
import { clearAuthStorage, isTokenExpired } from "../utils/tokenUtils";

/**
 * AuthInitializer - Validates token at app startup
 * Runs once on app mount to clear stale/expired tokens
 * This prevents the "logged in but redirected" issue
 */
const AuthInitializer = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    // Check token validity at app startup
    const token = localStorage.getItem("token");

    // If token exists but is expired, clear auth state immediately
    if (token && isTokenExpired(token)) {
      console.warn("[Auth] Expired token detected at startup, clearing auth");
      clearAuthStorage();

      // Dispatch logout to update Redux state
      dispatch(logoutRequest({ reason: "expired", skipApi: true }));
    }
  }, [dispatch]);

  // Component renders nothing, only runs effect
  return null;
};

export default AuthInitializer;
