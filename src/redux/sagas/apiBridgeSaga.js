import { call, put, takeEvery } from "redux-saga/effects";
import { userApi } from "../../api/userApi";
import { adminApi } from "../../api/adminApi";
import { agentApi } from "../../api/agentApi";
import { paymentAPI } from "../../api/paymentApi";
import { reportAPI } from "../../api/reportApi";
import {
  apiBridgeFailure,
  apiBridgeRequest,
  apiBridgeSuccess,
} from "../slices/apiBridgeSlice";

const apiServices = {
  userApi,
  adminApi,
  agentApi,
  paymentAPI,
  reportAPI,
};

function* apiBridgeRequestSaga(action) {
  const {
    service,
    method,
    args = [],
    resolve,
    reject,
  } = action.payload || {};

  try {
    const serviceObj = apiServices[service];
    if (!serviceObj || typeof serviceObj[method] !== "function") {
      throw new Error(`Unsupported API request: ${service}.${method}`);
    }

    const response = yield call(serviceObj[method], ...args);
    yield put(apiBridgeSuccess());
    if (typeof resolve === "function") {
      resolve(response);
    }
  } catch (error) {
    yield put(apiBridgeFailure(error?.response?.data?.error || error?.message));
    if (typeof reject === "function") {
      reject(error);
    }
  }
}

export function* apiBridgeSaga() {
  yield takeEvery(apiBridgeRequest.type, apiBridgeRequestSaga);
}