import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  preferences: null,
  loading: false,
  saving: false,
  resetting: false,
  error: null,
  unsavedChanges: false,
};

const notificationPreferencesSlice = createSlice({
  name: "notificationPreferences",
  initialState,
  reducers: {
    // Fetch preferences
    fetchPreferencesRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchPreferencesSuccess: (state, action) => {
      state.loading = false;
      state.preferences = action.payload;
      state.unsavedChanges = false;
      state.error = null;
    },
    fetchPreferencesFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },

    // Update preferences
    updatePreferencesRequest: (state) => {
      state.saving = true;
      state.error = null;
    },
    updatePreferencesSuccess: (state, action) => {
      state.saving = false;
      state.preferences = action.payload;
      state.unsavedChanges = false;
      state.error = null;
    },
    updatePreferencesFailure: (state, action) => {
      state.saving = false;
      state.error = action.payload;
    },

    // Reset preferences
    resetPreferencesRequest: (state) => {
      state.resetting = true;
      state.error = null;
    },
    resetPreferencesSuccess: (state, action) => {
      state.resetting = false;
      state.preferences = action.payload;
      state.unsavedChanges = false;
      state.error = null;
    },
    resetPreferencesFailure: (state, action) => {
      state.resetting = false;
      state.error = action.payload;
    },

    // Track unsaved changes
    updatePreferencesLocally: (state, action) => {
      state.preferences = {
        ...state.preferences,
        ...action.payload,
      };
      state.unsavedChanges = true;
    },

    // Clear error
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const {
  fetchPreferencesRequest,
  fetchPreferencesSuccess,
  fetchPreferencesFailure,
  updatePreferencesRequest,
  updatePreferencesSuccess,
  updatePreferencesFailure,
  resetPreferencesRequest,
  resetPreferencesSuccess,
  resetPreferencesFailure,
  updatePreferencesLocally,
  clearError,
} = notificationPreferencesSlice.actions;

export default notificationPreferencesSlice.reducer;
