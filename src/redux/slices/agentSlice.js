import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  data: null,
  loading: false,
  error: null,
  applyLoading: false,
  applyError: null,
  applySuccess: false,
  withdrawalLoading: false,
  withdrawalError: null,
  withdrawalSuccess: false,
  lastFetchedAt: null,
};

const agentSlice = createSlice({
  name: "agent",
  initialState,
  reducers: {
    fetchAgentStatusRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchAgentStatusSuccess: (state, action) => {
      state.loading = false;
      state.error = null;
      state.data = action.payload;
      state.lastFetchedAt = Date.now();
    },
    fetchAgentStatusFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },

    applyAgentRequest: (state) => {
      state.applyLoading = true;
      state.applyError = null;
      state.applySuccess = false;
    },
    applyAgentSuccess: (state) => {
      state.applyLoading = false;
      state.applyError = null;
      state.applySuccess = true;
    },
    applyAgentFailure: (state, action) => {
      state.applyLoading = false;
      state.applyError = action.payload;
      state.applySuccess = false;
    },

    requestWithdrawalRequest: (state) => {
      state.withdrawalLoading = true;
      state.withdrawalError = null;
      state.withdrawalSuccess = false;
    },
    requestWithdrawalSuccess: (state) => {
      state.withdrawalLoading = false;
      state.withdrawalError = null;
      state.withdrawalSuccess = true;
    },
    requestWithdrawalFailure: (state, action) => {
      state.withdrawalLoading = false;
      state.withdrawalError = action.payload;
      state.withdrawalSuccess = false;
    },

    clearAgentActionState: (state) => {
      state.applyLoading = false;
      state.applyError = null;
      state.applySuccess = false;
      state.withdrawalLoading = false;
      state.withdrawalError = null;
      state.withdrawalSuccess = false;
    },
  },
});

export const {
  fetchAgentStatusRequest,
  fetchAgentStatusSuccess,
  fetchAgentStatusFailure,
  applyAgentRequest,
  applyAgentSuccess,
  applyAgentFailure,
  requestWithdrawalRequest,
  requestWithdrawalSuccess,
  requestWithdrawalFailure,
  clearAgentActionState,
} = agentSlice.actions;

export default agentSlice.reducer;