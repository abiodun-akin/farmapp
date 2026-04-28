import { call, put, takeEvery } from "redux-saga/effects";
import { paymentAPI } from "../../api/paymentApi";
import { formatErrorMessage, isAuthError } from "../../utils/errorHandler";
import {
  cancelSubscriptionFailure,
  cancelSubscriptionRequest,
  cancelSubscriptionSuccess,
  closePaymentFailure,
  closePaymentRequest,
  closePaymentSuccess,
  fetchSubscriptionStatusFailure,
  fetchSubscriptionStatusRequest,
  fetchSubscriptionStatusSuccess,
  initializePaymentFailure,
  initializePaymentRequest,
  initializePaymentSuccess,
  successPaymentFailure,
  successPaymentRequest,
  successPaymentSuccess,
  verifyPaymentFailure,
  verifyPaymentRequest,
  verifyPaymentSuccess,
} from "../slices/paymentSlice";
import { addToast } from "../slices/toastSlice";
import { logout } from "../slices/userSlice";

function* initializePaymentSaga(action) {
  try {
    const { plan, amount, email } = action.payload;
    const response = yield call(
      paymentAPI.initializePayment,
      plan,
      amount,
      email,
    );
    yield put(initializePaymentSuccess(response.data));
    console.log("Payment initialization successful:", response.data);
  } catch (error) {
    // Check if it's an auth error
    if (isAuthError(error)) {
      yield put(logout());
      yield put(
        addToast({
          message: "Session expired. Please login again.",
          type: "error",
        }),
      );
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
    yield put(
      fetchSubscriptionStatusRequest({
        userId: action.payload?.userId,
        force: true,
      }),
    );
    console.log("Payment verification successful:", response.data);
  } catch (error) {
    // Check if it's an auth error
    if (isAuthError(error)) {
      yield put(logout());
      yield put(
        addToast({
          message: "Session expired. Please login again.",
          type: "error",
        }),
      );
    } else {
      const errorMessage = formatErrorMessage(error);
      yield put(verifyPaymentFailure(errorMessage));
      yield put(addToast({ message: errorMessage, type: "error" }));
    }
  }
}

function* successPaymentSaga(action) {
  try {
    const { reference, plan } = action.payload;
    const response = yield call(
      paymentAPI.handlePaymentSuccess,
      reference,
      plan,
    );
    yield put(successPaymentSuccess(response.data));
    yield put(
      fetchSubscriptionStatusRequest({
        userId: action.payload?.userId,
        force: true,
      }),
    );
    console.log("Payment finalization successful:", response.data);
  } catch (error) {
    if (isAuthError(error)) {
      yield put(logout());
      yield put(
        addToast({
          message: "Session expired. Please login again.",
          type: "error",
        }),
      );
    } else {
      const errorMessage = formatErrorMessage(error);
      yield put(successPaymentFailure(errorMessage));
      yield put(addToast({ message: errorMessage, type: "error" }));
    }
  }
}

function* closePaymentSaga(action) {
  try {
    const { reference } = action.payload || {};
    const response = yield call(paymentAPI.handlePaymentClose, reference);
    yield put(closePaymentSuccess(response.data));
    yield put(
      addToast({
        message: "Payment cancelled. Your subscription remains active.",
        type: "warning",
      }),
    );
  } catch (error) {
    if (isAuthError(error)) {
      yield put(logout());
      yield put(
        addToast({
          message: "Session expired. Please login again.",
          type: "error",
        }),
      );
    } else {
      const errorMessage = formatErrorMessage(error);
      yield put(closePaymentFailure(errorMessage));
      yield put(addToast({ message: errorMessage, type: "error" }));
    }
  }
}

function* cancelSubscriptionSaga(action) {
  try {
    const { reason } = action.payload || {};
    const response = yield call(paymentAPI.cancelSubscription, reason);
    yield put(cancelSubscriptionSuccess(response.data));
    yield put(fetchSubscriptionStatusRequest({ force: true }));
    yield put(
      addToast({
        message: "Subscription cancelled successfully.",
        type: "success",
      }),
    );
  } catch (error) {
    if (isAuthError(error)) {
      yield put(logout());
      yield put(
        addToast({
          message: "Session expired. Please login again.",
          type: "error",
        }),
      );
    } else {
      const errorMessage = formatErrorMessage(error);
      yield put(cancelSubscriptionFailure(errorMessage));
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

    yield put(
      fetchSubscriptionStatusSuccess({
        subscription: hasActiveSubscription ? subscription : null,
        hasActiveSubscription,
        hasEverSubscribed,
        userId: action.payload?.userId || null,
      }),
    );
  } catch (error) {
    if (isAuthError(error)) {
      yield put(logout());
      yield put(
        addToast({
          message: "Session expired. Please login again.",
          type: "error",
        }),
      );
    } else {
      const errorMessage = formatErrorMessage(error);
      yield put(fetchSubscriptionStatusFailure(errorMessage));
    }
  }
}

export function* paymentSaga() {
  yield takeEvery(initializePaymentRequest.type, initializePaymentSaga);
  yield takeEvery(verifyPaymentRequest.type, verifyPaymentSaga);
  yield takeEvery(successPaymentRequest.type, successPaymentSaga);
  yield takeEvery(closePaymentRequest.type, closePaymentSaga);
  yield takeEvery(cancelSubscriptionRequest.type, cancelSubscriptionSaga);
  yield takeEvery(
    fetchSubscriptionStatusRequest.type,
    fetchSubscriptionStatusSaga,
  );
}
