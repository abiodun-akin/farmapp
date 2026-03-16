import { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { logoutRequest } from "../redux/slices/userSlice";

const DEFAULT_IDLE_TIMEOUT_MS = 15 * 60 * 1000;

const AuthSessionManager = () => {
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state) => state.user);
  const idleTimerRef = useRef(null);

  useEffect(() => {
    if (!isAuthenticated) {
      if (idleTimerRef.current) {
        window.clearTimeout(idleTimerRef.current);
        idleTimerRef.current = null;
      }
      return undefined;
    }

    const idleTimeoutMs = Number(import.meta.env.VITE_IDLE_TIMEOUT_MS || DEFAULT_IDLE_TIMEOUT_MS);
    const activityEvents = ["mousedown", "mousemove", "keydown", "scroll", "touchstart"];

    const resetIdleTimer = () => {
      if (idleTimerRef.current) {
        window.clearTimeout(idleTimerRef.current);
      }

      idleTimerRef.current = window.setTimeout(() => {
        dispatch(logoutRequest({ reason: "idle" }));
      }, idleTimeoutMs);
    };

    const handleAuthExpired = () => {
      dispatch(logoutRequest({ reason: "expired", skipApi: true }));
    };

    activityEvents.forEach((eventName) => {
      window.addEventListener(eventName, resetIdleTimer, { passive: true });
    });
    window.addEventListener("farmconnect:auth-expired", handleAuthExpired);
    document.addEventListener("visibilitychange", resetIdleTimer);

    resetIdleTimer();

    return () => {
      if (idleTimerRef.current) {
        window.clearTimeout(idleTimerRef.current);
      }

      activityEvents.forEach((eventName) => {
        window.removeEventListener(eventName, resetIdleTimer);
      });
      window.removeEventListener("farmconnect:auth-expired", handleAuthExpired);
      document.removeEventListener("visibilitychange", resetIdleTimer);
    };
  }, [dispatch, isAuthenticated]);

  return null;
};

export default AuthSessionManager;