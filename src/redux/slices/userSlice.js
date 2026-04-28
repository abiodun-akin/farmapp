import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  user: sessionStorage.getItem("user")
    ? JSON.parse(sessionStorage.getItem("user"))
    : null,
  token: sessionStorage.getItem("token") || null,
  loading: false,
  error: null,
  statusMessage: null,
  passwordResetRequested: false,
  passwordResetCompleted: false,
  emailVerificationSent: false,
  emailVerified: false,
  twoFactorRequired: false,
  twoFactorChallengeToken: null,
  isAuthenticated: !!(
    sessionStorage.getItem("token") && sessionStorage.getItem("user")
  ),
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    // Signup actions
    signupRequest: (state) => {
      state.loading = true;
      state.error = null;
      state.statusMessage = null;
      state.isAuthenticated = false;
    },
    signupSuccess: (state, action) => {
      const { user, token } = action.payload;
      state.loading = false;
      state.user = user;
      state.token = token;
      state.isAuthenticated = true;
      sessionStorage.setItem("token", token);
      sessionStorage.setItem("user", JSON.stringify(user));
    },
    signupFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
      state.statusMessage = null;
      state.isAuthenticated = false;
      state.user = null;
      state.token = null;
      sessionStorage.removeItem("token");
      sessionStorage.removeItem("user");
    },

    // Login actions
    loginRequest: (state) => {
      state.loading = true;
      state.error = null;
      state.statusMessage = null;
      state.twoFactorRequired = false;
      state.twoFactorChallengeToken = null;
    },
    loginSuccess: (state, action) => {
      const { user, token } = action.payload;
      state.loading = false;
      state.user = user;
      state.token = token;
      state.isAuthenticated = true;
      state.twoFactorRequired = false;
      state.twoFactorChallengeToken = null;
      sessionStorage.setItem("token", token);
      sessionStorage.setItem("user", JSON.stringify(user));
    },
    loginTwoFactorRequired: (state, action) => {
      const { challengeToken, message } = action.payload;
      state.loading = false;
      state.error = null;
      state.statusMessage = message || "Two-factor authentication required";
      state.isAuthenticated = false;
      state.user = null;
      state.token = null;
      state.twoFactorRequired = true;
      state.twoFactorChallengeToken = challengeToken;
      sessionStorage.removeItem("token");
      sessionStorage.removeItem("user");
    },
    loginFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
      state.statusMessage = null;
      state.isAuthenticated = false;
      state.user = null;
      state.token = null;
      state.twoFactorRequired = false;
      state.twoFactorChallengeToken = null;
      sessionStorage.removeItem("token");
      sessionStorage.removeItem("user");
    },

    verifyTwoFactorRequest: (state) => {
      state.loading = true;
      state.error = null;
      state.statusMessage = null;
    },
    verifyTwoFactorSuccess: (state, action) => {
      const { user, token, message } = action.payload;
      state.loading = false;
      state.error = null;
      state.statusMessage = message || null;
      state.user = user;
      state.token = token;
      state.isAuthenticated = true;
      state.twoFactorRequired = false;
      state.twoFactorChallengeToken = null;
      sessionStorage.setItem("token", token);
      sessionStorage.setItem("user", JSON.stringify(user));
    },
    verifyTwoFactorFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },

    getRecoveryCodesRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    getRecoveryCodesSuccess: (state, action) => {
      state.loading = false;
      state.error = null;
      state.recoveryCodeStatus = action.payload;
    },
    getRecoveryCodesFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },

    regenerateRecoveryCodesRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    regenerateRecoveryCodesSuccess: (state, action) => {
      state.loading = false;
      state.error = null;
      state.newRecoveryCodes = action.payload;
      state.statusMessage = "Recovery codes generated. Save them securely!";
    },
    regenerateRecoveryCodesFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
      state.newRecoveryCodes = null;
    },

    fetchSessionRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchSessionSuccess: (state, action) => {
      const { user, token } = action.payload;
      state.loading = false;
      state.error = null;
      state.user = user;
      state.token = token;
      state.isAuthenticated = true;
      sessionStorage.setItem("token", token);
      sessionStorage.setItem("user", JSON.stringify(user));
    },
    fetchSessionFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      sessionStorage.removeItem("token");
      sessionStorage.removeItem("user");
    },

    socialAuthStartRequest: (state) => {
      state.error = null;
    },

    forgotPasswordRequest: (state) => {
      state.loading = true;
      state.error = null;
      state.statusMessage = null;
      state.passwordResetRequested = false;
    },
    forgotPasswordSuccess: (state, action) => {
      state.loading = false;
      state.error = null;
      state.statusMessage = action.payload;
      state.passwordResetRequested = true;
    },
    forgotPasswordFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
      state.statusMessage = null;
      state.passwordResetRequested = false;
    },

    resetPasswordRequest: (state) => {
      state.loading = true;
      state.error = null;
      state.statusMessage = null;
      state.passwordResetCompleted = false;
    },
    resetPasswordSuccess: (state, action) => {
      state.loading = false;
      state.error = null;
      state.statusMessage = action.payload;
      state.passwordResetCompleted = true;
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      sessionStorage.clear();
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("profile");
      localStorage.removeItem("subscription");
      Object.keys(localStorage).forEach((key) => {
        if (key !== "theme") {
          localStorage.removeItem(key);
        }
      });
    },
    resetPasswordFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
      state.statusMessage = null;
      state.passwordResetCompleted = false;
    },

    sendVerificationRequest: (state) => {
      state.loading = true;
      state.error = null;
      state.statusMessage = null;
      state.emailVerificationSent = false;
    },
    sendVerificationSuccess: (state, action) => {
      state.loading = false;
      state.error = null;
      state.statusMessage = action.payload;
      state.emailVerificationSent = true;
    },
    sendVerificationFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
      state.statusMessage = null;
      state.emailVerificationSent = false;
    },

    verifyEmailRequest: (state) => {
      state.loading = true;
      state.error = null;
      state.statusMessage = null;
      state.emailVerified = false;
      state.twoFactorRequired = false;
      state.twoFactorChallengeToken = null;
    },
    verifyEmailSuccess: (state, action) => {
      state.loading = false;
      state.error = null;
      state.statusMessage = action.payload;
      state.emailVerified = true;
      if (state.user) {
        state.user = { ...state.user, isEmailVerified: true };
        sessionStorage.setItem("user", JSON.stringify(state.user));
      }
    },
    verifyEmailFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
      state.statusMessage = null;
      state.emailVerified = false;
    },

    logoutRequest: (state) => {
      state.loading = true;
      state.error = null;
    },

    // Logout
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.loading = false;
      state.error = null;
      state.statusMessage = null;
      state.passwordResetRequested = false;
      state.passwordResetCompleted = false;
      // Clear sessionStorage
      sessionStorage.clear();
      // Clear all auth-related localStorage
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("profile");
      localStorage.removeItem("subscription");
      // Clear all localStorage to prevent data leakage
      Object.keys(localStorage).forEach((key) => {
        if (key !== "theme") {
          // Keep theme preference
          localStorage.removeItem(key);
        }
      });
    },

    // Profile actions
    setProfile: (state, action) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
        sessionStorage.setItem("user", JSON.stringify(state.user));
      }
    },

    updateProfileSuccess: (state, action) => {
      state.loading = false;
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
        sessionStorage.setItem("user", JSON.stringify(state.user));
      }
    },

    // Clear error
    clearError: (state) => {
      state.error = null;
    },

    clearEmailVerificationSent: (state) => {
      state.emailVerificationSent = false;
    },

    clearAuthFeedback: (state) => {
      state.error = null;
      state.statusMessage = null;
      state.passwordResetRequested = false;
      state.passwordResetCompleted = false;
      state.emailVerificationSent = false;
      state.emailVerified = false;
    },
  },
});

export const {
  signupRequest,
  signupSuccess,
  signupFailure,
  loginRequest,
  loginSuccess,
  loginTwoFactorRequired,
  loginFailure,
  verifyTwoFactorRequest,
  verifyTwoFactorSuccess,
  verifyTwoFactorFailure,
  getRecoveryCodesRequest,
  getRecoveryCodesSuccess,
  getRecoveryCodesFailure,
  regenerateRecoveryCodesRequest,
  regenerateRecoveryCodesSuccess,
  regenerateRecoveryCodesFailure,
  fetchSessionRequest,
  fetchSessionSuccess,
  fetchSessionFailure,
  socialAuthStartRequest,
  forgotPasswordRequest,
  forgotPasswordSuccess,
  forgotPasswordFailure,
  resetPasswordRequest,
  resetPasswordSuccess,
  resetPasswordFailure,
  sendVerificationRequest,
  sendVerificationSuccess,
  sendVerificationFailure,
  verifyEmailRequest,
  verifyEmailSuccess,
  verifyEmailFailure,
  logoutRequest,
  logout,
  clearError,
  clearEmailVerificationSent,
  clearAuthFeedback,
  setProfile,
  updateProfileSuccess,
} = userSlice.actions;

export default userSlice.reducer;
