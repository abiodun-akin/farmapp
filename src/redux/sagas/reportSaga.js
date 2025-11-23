import { call, put, takeEvery } from "redux-saga/effects";
import { reportAPI } from "../../api/reportApi";
import {
  createReportFailure,
  createReportRequest,
  createReportSuccess,
  deleteReportFailure,
  deleteReportRequest,
  deleteReportSuccess,
  fetchReportFailure,
  fetchReportRequest,
  fetchReportsFailure,
  fetchReportsRequest,
  fetchReportsSuccess,
  fetchReportSuccess,
  updateReportFailure,
  updateReportRequest,
  updateReportSuccess,
} from "../slices/reportSlice";

// Fetch all reports saga
function* fetchReportsSaga() {
  try {
    const response = yield call(reportAPI.getAll);
    yield put(fetchReportsSuccess(response.data));
  } catch (error) {
    const errorMessage =
      error.response?.data?.error || error.message || "Failed to fetch reports";
    yield put(fetchReportsFailure(errorMessage));
  }
}

// Fetch single report saga
function* fetchReportSaga(action) {
  try {
    const { id } = action.payload;
    const response = yield call(reportAPI.getById, id);
    yield put(fetchReportSuccess(response.data));
  } catch (error) {
    const errorMessage =
      error.response?.data?.error || error.message || "Failed to fetch report";
    yield put(fetchReportFailure(errorMessage));
  }
}

// Create report saga
function* createReportSaga(action) {
  try {
    const response = yield call(reportAPI.create, action.payload);
    yield put(createReportSuccess(response.data));
  } catch (error) {
    const errorMessage =
      error.response?.data?.error || error.message || "Failed to create report";
    yield put(createReportFailure(errorMessage));
  }
}

// Update report saga
function* updateReportSaga(action) {
  try {
    const { id, data } = action.payload;
    const response = yield call(reportAPI.update, id, data);
    yield put(updateReportSuccess(response.data));
  } catch (error) {
    const errorMessage =
      error.response?.data?.error || error.message || "Failed to update report";
    yield put(updateReportFailure(errorMessage));
  }
}

// Delete report saga
function* deleteReportSaga(action) {
  try {
    const { id } = action.payload;
    yield call(reportAPI.delete, id);
    yield put(deleteReportSuccess(id));
  } catch (error) {
    const errorMessage =
      error.response?.data?.error || error.message || "Failed to delete report";
    yield put(deleteReportFailure(errorMessage));
  }
}

export function* reportSaga() {
  yield takeEvery(fetchReportsRequest.type, fetchReportsSaga);
  yield takeEvery(fetchReportRequest.type, fetchReportSaga);
  yield takeEvery(createReportRequest.type, createReportSaga);
  yield takeEvery(updateReportRequest.type, updateReportSaga);
  yield takeEvery(deleteReportRequest.type, deleteReportSaga);
}
