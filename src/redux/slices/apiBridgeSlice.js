import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  loading: false,
  error: null,
};

const apiBridgeSlice = createSlice({
  name: "apiBridge",
  initialState,
  reducers: {
    apiBridgeRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    apiBridgeSuccess: (state) => {
      state.loading = false;
      state.error = null;
    },
    apiBridgeFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload || "Request failed";
    },
  },
});

export const {
  apiBridgeRequest,
  apiBridgeSuccess,
  apiBridgeFailure,
} = apiBridgeSlice.actions;

export default apiBridgeSlice.reducer;