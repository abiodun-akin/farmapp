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
import { addToast } from "../slices/toastSlice";

function* initializePaymentSaga(action) {
  try {
    const { plan, amount, email } = action.payload;
    const response = yield call(paymentAPI.initializePayment, plan, amount, email);
    yield put(initializePaymentSuccess(response.data));
    yield put(addToast({ message: "Payment initialized", type: "info" }));
  } catch (error) {
    const errorMessage =
      error.response?.data?.error || error.message || "Payment initialization failed";
    yield put(initializePaymentFailure(errorMessage));
    yield put(addToast({ message: errorMessage, type: "error" }));
  }
}

function* verifyPaymentSaga(action) {
  try {
    const { reference } = action.payload;
    const response = yield call(paymentAPI.verifyPayment, reference);
    yield put(verifyPaymentSuccess(response.data));
    yield put(addToast({ message: "Payment verified successfully!", type: "success" }));
  } catch (error) {
    const errorMessage =
      error.response?.data?.error || error.message || "Payment verification failed";
    yield put(verifyPaymentFailure(errorMessage));
    yield put(addToast({ message: errorMessage, type: "error" }));
  }
}

export function* paymentSaga() {
  yield takeEvery(initializePaymentRequest.type, initializePaymentSaga);
  yield takeEvery(verifyPaymentRequest.type, verifyPaymentSaga);
}
