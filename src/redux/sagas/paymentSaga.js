import { call, put, takeEvery } from "redux-saga/effects";
import { paymentAPI } from "../../api/paymentApi";
import {
  initializePaymentRequest,
  initializePaymentSuccess,
  initializePaymentFailure,
  verifyPaymentRequest,
  verifyPaymentSuccess,
  verifyPaymentFailure,
} from "../slices/paymentSlice";

function* initializePaymentSaga(action) {
  try {
    const { plan, amount, email } = action.payload;
    const response = yield call(paymentAPI.initializePayment, plan, amount, email);
    yield put(initializePaymentSuccess(response.data));
  } catch (error) {
    const errorMessage =
      error.response?.data?.error || error.message || "Payment initialization failed";
    yield put(initializePaymentFailure(errorMessage));
  }
}

function* verifyPaymentSaga(action) {
  try {
    const { reference } = action.payload;
    const response = yield call(paymentAPI.verifyPayment, reference);
    yield put(verifyPaymentSuccess(response.data));
  } catch (error) {
    const errorMessage =
      error.response?.data?.error || error.message || "Payment verification failed";
    yield put(verifyPaymentFailure(errorMessage));
  }
}

export function* paymentSaga() {
  yield takeEvery(initializePaymentRequest.type, initializePaymentSaga);
  yield takeEvery(verifyPaymentRequest.type, verifyPaymentSaga);
}