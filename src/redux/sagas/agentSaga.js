import { call, put, takeEvery } from "redux-saga/effects";
import agentApi from "../../api/agentApi";
import { addToast } from "../slices/toastSlice";
import { logout } from "../slices/userSlice";
import {
  applyAgentFailure,
  applyAgentRequest,
  applyAgentSuccess,
  fetchAgentStatusFailure,
  fetchAgentStatusRequest,
  fetchAgentStatusSuccess,
  requestWithdrawalFailure,
  requestWithdrawalRequest,
  requestWithdrawalSuccess,
} from "../slices/agentSlice";
import { formatErrorMessage, isAuthError } from "../../utils/errorHandler";

function* fetchAgentStatusSaga() {
  try {
    const response = yield call(agentApi.getAgentStatus);
    yield put(fetchAgentStatusSuccess(response.data));
  } catch (error) {
    if (isAuthError(error)) {
      yield put(logout());
      yield put(addToast({ message: "Session expired. Please login again.", type: "error" }));
      return;
    }

    yield put(fetchAgentStatusFailure(formatErrorMessage(error)));
  }
}

function* applyAgentSaga(action) {
  try {
    const response = yield call(agentApi.applyAsAgent, action.payload);
    yield put(applyAgentSuccess());
    yield put(addToast({
      message: response.data?.message || "Agent application submitted successfully",
      type: "success",
    }));
    yield put(fetchAgentStatusRequest());
  } catch (error) {
    if (isAuthError(error)) {
      yield put(logout());
      yield put(addToast({ message: "Session expired. Please login again.", type: "error" }));
      return;
    }

    const errorMessage = formatErrorMessage(error);
    yield put(applyAgentFailure(errorMessage));
    yield put(addToast({ message: errorMessage, type: "error" }));
  }
}

function* requestWithdrawalSaga(action) {
  try {
    const response = yield call(agentApi.requestWithdrawal, action.payload);
    yield put(requestWithdrawalSuccess());
    yield put(addToast({
      message: response.data?.message || "Withdrawal request submitted",
      type: "success",
    }));
    yield put(fetchAgentStatusRequest());
  } catch (error) {
    if (isAuthError(error)) {
      yield put(logout());
      yield put(addToast({ message: "Session expired. Please login again.", type: "error" }));
      return;
    }

    const errorMessage = formatErrorMessage(error);
    yield put(requestWithdrawalFailure(errorMessage));
    yield put(addToast({ message: errorMessage, type: "error" }));
  }
}

export function* agentSaga() {
  yield takeEvery(fetchAgentStatusRequest.type, fetchAgentStatusSaga);
  yield takeEvery(applyAgentRequest.type, applyAgentSaga);
  yield takeEvery(requestWithdrawalRequest.type, requestWithdrawalSaga);
}