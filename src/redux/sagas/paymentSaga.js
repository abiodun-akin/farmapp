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
import { logout } from "../slices/userSlice";
import { formatErrorMessage, isAuthError } from "../../utils/errorHandler";

function* initializePaymentSaga(action) {
  try {
    const { plan, amount, email } = action.payload;
    const response = yield call(paymentAPI.initializePayment, plan, amount, email);
    yield put(initializePaymentSuccess(response.data));
    console.log("Payment initialization successful:", response.data);
  } catch (error) {
    // Check if it's an auth error
    if (isAuthError(error)) {
      yield put(logout());
      yield put(addToast({ message: "Session expired. Please login again.", type: "error" }));
    } else {
      const errorMessage = formatErrorMessage(error);
      yield put(initializePaymentFailure(errorMessage));
      yield put(addToast({ message: errorMessage, type: "error" }));
    }
  }
}

function* verifyPaymentSaga(action) {
  try {
    const { reference, plan } = action.payload;
    const response = yield call(paymentAPI.verifyPayment, reference);
    yield put(verifyPaymentSuccess(response.data));
    console.log("Payment verification successful:", response.data);
  } catch (error) {
    // Check if it's an auth error
    if (isAuthError(error)) {
      yield put(logout());
      yield put(addToast({ message: "Session expired. Please login again.", type: "error" }));
    } else {
      const errorMessage = formatErrorMessage(error);
      yield put(verifyPaymentFailure(errorMessage));
      yield put(addToast({ message: errorMessage, type: "error" }));
    }
  }
}

export function* paymentSaga() {
  yield takeEvery(initializePaymentRequest.type, initializePaymentSaga);
  yield takeEvery(verifyPaymentRequest.type, verifyPaymentSaga);
}
