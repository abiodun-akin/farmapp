/**
 * Token utility functions for JWT handling
 */

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
 * Clear all authentication data from localStorage
 */
export const clearAuthStorage = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  localStorage.removeItem("profile");
  localStorage.removeItem("subscription");

  Object.keys(localStorage).forEach((key) => {
    if (key !== "theme") {
      localStorage.removeItem(key);
    }
  });
};
