import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  reports: [],
  currentReport: null,
  loading: false,
  error: null,
};

const reportSlice = createSlice({
  name: "report",
  initialState,
  reducers: {
    // Fetch all reports
    fetchReportsRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchReportsSuccess: (state, action) => {
      state.loading = false;
      state.reports = action.payload;
    },
    fetchReportsFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },

    // Fetch single report
    fetchReportRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchReportSuccess: (state, action) => {
      state.loading = false;
      state.currentReport = action.payload;
    },
    fetchReportFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },

    // Create report
    createReportRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    createReportSuccess: (state, action) => {
      state.loading = false;
      state.reports.push(action.payload);
    },
    createReportFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },

    // Update report
    updateReportRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    updateReportSuccess: (state, action) => {
      state.loading = false;
      const index = state.reports.findIndex(
        (r) => r._id === action.payload._id
      );
      if (index !== -1) {
        state.reports[index] = action.payload;
      }
      state.currentReport = action.payload;
    },
    updateReportFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },

    // Delete report
    deleteReportRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    deleteReportSuccess: (state, action) => {
      state.loading = false;
      state.reports = state.reports.filter((r) => r._id !== action.payload);
      state.currentReport = null;
    },
    deleteReportFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },

    // Clear error
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const {
  fetchReportsRequest,
  fetchReportsSuccess,
  fetchReportsFailure,
  fetchReportRequest,
  fetchReportSuccess,
  fetchReportFailure,
  createReportRequest,
  createReportSuccess,
  createReportFailure,
  updateReportRequest,
  updateReportSuccess,
  updateReportFailure,
  deleteReportRequest,
  deleteReportSuccess,
  deleteReportFailure,
  clearError,
} = reportSlice.actions;

export default reportSlice.reducer;
