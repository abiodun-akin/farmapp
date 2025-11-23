import { useDispatch, useSelector } from "react-redux";
import {
  clearError,
  createReportRequest,
  deleteReportRequest,
  fetchReportRequest,
  fetchReportsRequest,
  updateReportRequest,
} from "../redux/slices/reportSlice";

export const useReport = () => {
  const dispatch = useDispatch();
  const reports = useSelector((state) => state.report.reports);
  const currentReport = useSelector((state) => state.report.currentReport);
  const loading = useSelector((state) => state.report.loading);
  const error = useSelector((state) => state.report.error);

  const fetchReports = () => {
    dispatch(fetchReportsRequest());
  };

  const fetchReport = (id) => {
    dispatch(fetchReportRequest({ id }));
  };

  const createReport = (data) => {
    dispatch(createReportRequest(data));
  };

  const updateReport = (id, data) => {
    dispatch(updateReportRequest({ id, data }));
  };

  const deleteReport = (id) => {
    dispatch(deleteReportRequest({ id }));
  };

  const handleClearError = () => {
    dispatch(clearError());
  };

  return {
    reports,
    currentReport,
    loading,
    error,
    fetchReports,
    fetchReport,
    createReport,
    updateReport,
    deleteReport,
    clearError: handleClearError,
  };
};
