/**
 * Token utility functions for JWT handling
 */

/**
 * Get token from storage (sessionStorage preferred, fallback to localStorage)
 * @returns {string|null} - Token or null if not found
 */
export const getToken = () => {
  // Prefer sessionStorage (expires on tab close)
  let token = sessionStorage.getItem("token");

  // Fallback to localStorage for backward compatibility
  if (!token) {
    token = localStorage.getItem("token");
  }

  return token;
};

/**
 * Set token in sessionStorage (more secure - auto-expires on tab close)
 * Also stores in localStorage for offline capability (optional)
 * @param {string} token - JWT token
 * @param {boolean} alsoPersist - Whether to also store in localStorage (default: false)
 */
export const setToken = (token, alsoPersist = false) => {
  if (token) {
    sessionStorage.setItem("token", token);
    if (alsoPersist) {
      localStorage.setItem("token", token);
    }
  }
};

/**
 * Remove token from storage
 */
export const removeToken = () => {
  sessionStorage.removeItem("token");
  localStorage.removeItem("token");
};

/**
 * Decode JWT token and extract payload
 * @param {string} token - JWT token
 * @returns {object|null} - Decoded payload or null if invalid
 */
export const decodeToken = (token) => {
  if (!token || typeof token !== "string") return null;

  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;

    const payload = JSON.parse(atob(parts[1]));
    return payload;
  } catch (error) {
    console.warn("[Token Utils] Failed to decode token:", error.message);
    return null;
  }
};

/**
 * Check if JWT token has expired
 * @param {string} token - JWT token
 * @param {number} bufferSeconds - Buffer time in seconds (default: 0)
 * @returns {boolean} - true if token is expired, false if valid
 */
export const isTokenExpired = (token, bufferSeconds = 0) => {
  if (!token) return true;

  const payload = decodeToken(token);
  if (!payload) return true;

  // exp is in seconds since epoch
  if (typeof payload.exp !== "number") return true;

  const expiryTimeMs = payload.exp * 1000;
  const bufferMs = bufferSeconds * 1000;
  const now = Date.now();

  return now >= expiryTimeMs - bufferMs;
};

/**
 * Get token expiry time in milliseconds from now
 * @param {string} token - JWT token
 * @returns {number} - Time until expiry in ms, or 0 if expired/invalid
 */
export const getTokenExpiresIn = (token) => {
  if (!token) return 0;

  const payload = decodeToken(token);
  if (!payload || typeof payload.exp !== "number") return 0;

  const expiryTimeMs = payload.exp * 1000;
  const timeRemaining = expiryTimeMs - Date.now();

  return Math.max(0, timeRemaining);
};

/**
 * Clear all authentication data from storage
 */
export const clearAuthStorage = () => {
  // Clear sessionStorage
  sessionStorage.removeItem("token");
  sessionStorage.removeItem("user");
  sessionStorage.removeItem("profile");
  sessionStorage.removeItem("subscription");

  // Clear localStorage
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  localStorage.removeItem("profile");
  localStorage.removeItem("subscription");

  // Clear all other keys except theme
  Object.keys(localStorage).forEach((key) => {
    if (key !== "theme") {
      localStorage.removeItem(key);
    }
  });

  Object.keys(sessionStorage).forEach((key) => {
    if (key !== "theme") {
      sessionStorage.removeItem(key);
    }
  });
};
