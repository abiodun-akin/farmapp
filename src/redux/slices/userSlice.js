import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  user: localStorage.getItem("user")
    ? JSON.parse(localStorage.getItem("user"))
    : null,
  token: localStorage.getItem("token") || null,
  loading: false,
  error: null,
  statusMessage: null,
  passwordResetRequested: false,
  passwordResetCompleted: false,
  emailVerificationSent: false,
  emailVerified: false,
  isAuthenticated: !!(
    localStorage.getItem("token") && localStorage.getItem("user")
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
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
    },
    signupFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
      state.statusMessage = null;
      state.isAuthenticated = false;
      state.user = null;
      state.token = null;
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    },

    // Login actions
    loginRequest: (state) => {
      state.loading = true;
      state.error = null;
      state.statusMessage = null;
    },
    loginSuccess: (state, action) => {
      const { user, token } = action.payload;
      state.loading = false;
      state.user = user;
      state.token = token;
      state.isAuthenticated = true;
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
    },
    loginFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
      state.statusMessage = null;
      state.isAuthenticated = false;
      state.user = null;
      state.token = null;
      localStorage.removeItem("token");
      localStorage.removeItem("user");
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
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
    },
    fetchSessionFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      localStorage.removeItem("token");
      localStorage.removeItem("user");
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
    },
    verifyEmailSuccess: (state, action) => {
      state.loading = false;
      state.error = null;
      state.statusMessage = action.payload;
      state.emailVerified = true;
      if (state.user) {
        state.user = { ...state.user, isEmailVerified: true };
        localStorage.setItem("user", JSON.stringify(state.user));
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
      sessionStorage.clear();
      // Clear all auth-related localStorage
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("profile");
      localStorage.removeItem("subscription");
      // Clear all localStorage to prevent data leakage
      Object.keys(localStorage).forEach(key => {
        if (key !== 'theme') { // Keep theme preference
          localStorage.removeItem(key);
        }
      });
    },

    // Profile actions
    setProfile: (state, action) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
        localStorage.setItem("user", JSON.stringify(state.user));
      }
    },
    
    updateProfileSuccess: (state, action) => {
      state.loading = false;
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
        localStorage.setItem("user", JSON.stringify(state.user));
      }
    },

    // Clear error
    clearError: (state) => {
      state.error = null;
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
  loginFailure,
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
  clearAuthFeedback,
  setProfile,
  updateProfileSuccess,
} = userSlice.actions;

export default userSlice.reducer;
