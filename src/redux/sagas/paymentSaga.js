import { call, put, takeEvery } from "redux-saga/effects";
import { paymentAPI } from "../../api/paymentApi";
import {
  initializePaymentRequest,
  initializePaymentSuccess,
  initializePaymentFailure,
  verifyPaymentRequest,
  verifyPaymentSuccess,
  verifyPaymentFailure,
  fetchSubscriptionStatusRequest,
  fetchSubscriptionStatusSuccess,
  fetchSubscriptionStatusFailure,
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
    const response = yield call(paymentAPI.verifyPayment, reference, plan);
    yield put(verifyPaymentSuccess(response.data));
    yield put(fetchSubscriptionStatusRequest({ userId: action.payload?.userId, force: true }));
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

function* fetchSubscriptionStatusSaga(action) {
  try {
    const response = yield call(paymentAPI.getSubscriptionStatus);
    const hasActiveSubscription = response.data?.hasActiveSubscription || false;
    const subscription = response.data?.subscription || null;
    const hasEverSubscribed = response.data?.hasEverSubscribed || false;

    yield put(fetchSubscriptionStatusSuccess({
      subscription: hasActiveSubscription ? subscription : null,
      hasActiveSubscription,
      hasEverSubscribed,
      userId: action.payload?.userId || null,
    }));
  } catch (error) {
    if (isAuthError(error)) {
      yield put(logout());
      yield put(addToast({ message: "Session expired. Please login again.", type: "error" }));
    } else {
      const errorMessage = formatErrorMessage(error);
      yield put(fetchSubscriptionStatusFailure(errorMessage));
    }
  }
}

export function* paymentSaga() {
  yield takeEvery(initializePaymentRequest.type, initializePaymentSaga);
  yield takeEvery(verifyPaymentRequest.type, verifyPaymentSaga);
  yield takeEvery(fetchSubscriptionStatusRequest.type, fetchSubscriptionStatusSaga);
}
