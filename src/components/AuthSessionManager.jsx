import { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { logoutRequest } from "../redux/slices/userSlice";
import { getToken, isTokenExpired } from "../utils/tokenUtils";

const DEFAULT_IDLE_TIMEOUT_MS = 15 * 60 * 1000;
const PAGE_HIDDEN_CHECK_INTERVAL_MS = 5 * 60 * 1000; // Check every 5 minutes
const MAX_BACKGROUND_TIME_MS = 2 * 60 * 60 * 1000; // 2 hours (matches token expiration)

const AuthSessionManager = () => {
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state) => state.user);
  const idleTimerRef = useRef(null);
  const pageHiddenTimerRef = useRef(null);
  const pageHiddenAtRef = useRef(null);

  useEffect(() => {
    if (!isAuthenticated) {
      if (idleTimerRef.current) {
        window.clearTimeout(idleTimerRef.current);
        idleTimerRef.current = null;
      }
      if (pageHiddenTimerRef.current) {
        window.clearInterval(pageHiddenTimerRef.current);
        pageHiddenTimerRef.current = null;
      }
      pageHiddenAtRef.current = null;
      return undefined;
    }

    const idleTimeoutMs = Number(
      import.meta.env.VITE_IDLE_TIMEOUT_MS || DEFAULT_IDLE_TIMEOUT_MS,
    );
    const activityEvents = [
      "mousedown",
      "mousemove",
      "keydown",
      "scroll",
      "touchstart",
    ];

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

    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Page is hidden - record when it was hidden
        pageHiddenAtRef.current = Date.now();
        console.log(
          "[Auth] Page hidden, recording timestamp for extended absence check",
        );
      } else {
        // Page is visible again
        if (pageHiddenAtRef.current) {
          const hiddenDurationMs = Date.now() - pageHiddenAtRef.current;
          console.log(
            `[Auth] Page visible again after ${hiddenDurationMs}ms hidden`,
          );

          // Check if token has expired or page was hidden for too long
          const token = getToken();
          if (isTokenExpired(token)) {
            console.warn(
              "[Auth] Token expired while page was hidden, logging out",
            );
            dispatch(logoutRequest({ reason: "expired", skipApi: true }));
          } else if (hiddenDurationMs > MAX_BACKGROUND_TIME_MS) {
            console.warn(
              `[Auth] Page was hidden for ${hiddenDurationMs}ms (>2hrs), forcing logout for security`,
            );
            dispatch(
              logoutRequest({ reason: "extended-absence", skipApi: true }),
            );
          }
        }
        pageHiddenAtRef.current = null;
      }
    };

    // Check periodically if token has expired while page is hidden
    pageHiddenTimerRef.current = window.setInterval(() => {
      if (document.hidden && pageHiddenAtRef.current) {
        const token = getToken();
        if (isTokenExpired(token)) {
          console.warn(
            "[Auth] Token expired while page was hidden in background check",
          );
          dispatch(logoutRequest({ reason: "expired", skipApi: true }));
        }
      }
    }, PAGE_HIDDEN_CHECK_INTERVAL_MS);

    activityEvents.forEach((eventName) => {
      window.addEventListener(eventName, resetIdleTimer, { passive: true });
    });
    window.addEventListener("farmconnect:auth-expired", handleAuthExpired);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    resetIdleTimer();

    return () => {
      if (idleTimerRef.current) {
        window.clearTimeout(idleTimerRef.current);
      }
      if (pageHiddenTimerRef.current) {
        window.clearInterval(pageHiddenTimerRef.current);
      }

      activityEvents.forEach((eventName) => {
        window.removeEventListener(eventName, resetIdleTimer);
      });
      window.removeEventListener("farmconnect:auth-expired", handleAuthExpired);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [dispatch, isAuthenticated]);

  return null;
};

export default AuthSessionManager;
