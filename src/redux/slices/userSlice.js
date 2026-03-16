import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  user: localStorage.getItem("user")
    ? JSON.parse(localStorage.getItem("user"))
    : null,
  token: localStorage.getItem("token") || null,
  loading: false,
  error: null,
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
  logoutRequest,
  logout,
  clearError,
  setProfile,
  updateProfileSuccess,
} = userSlice.actions;

export default userSlice.reducer;
