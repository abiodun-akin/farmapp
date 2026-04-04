import { call, put, takeEvery } from "redux-saga/effects";
import { userAPI } from "../../api/userApi";
import { addToast } from "../slices/toastSlice";
import {
  fetchSessionFailure,
  fetchSessionRequest,
  fetchSessionSuccess,
  forgotPasswordFailure,
  forgotPasswordRequest,
  forgotPasswordSuccess,
  getRecoveryCodesFailure,
  getRecoveryCodesRequest,
  getRecoveryCodesSuccess,
  loginFailure,
  loginRequest,
  loginSuccess,
  loginTwoFactorRequired,
  logout,
  logoutRequest,
  regenerateRecoveryCodesFailure,
  regenerateRecoveryCodesRequest,
  regenerateRecoveryCodesSuccess,
  resetPasswordFailure,
  resetPasswordRequest,
  resetPasswordSuccess,
  sendVerificationFailure,
  sendVerificationRequest,
  sendVerificationSuccess,
  signupFailure,
  signupRequest,
  signupSuccess,
  socialAuthStartRequest,
  verifyEmailFailure,
  verifyEmailRequest,
  verifyEmailSuccess,
  verifyTwoFactorFailure,
  verifyTwoFactorRequest,
  verifyTwoFactorSuccess,
} from "../slices/userSlice";

function* signupSaga(action) {
  try {
    const { name, email, password, promoCode } = action.payload;
    const response = yield call(
      userAPI.signup,
      name,
      email,
      password,
      promoCode,
    );
    const { user, token } = response.data;
    yield put(signupSuccess({ user, token }));
    yield put(
      addToast({ message: "Account created successfully!", type: "success" }),
    );
  } catch (error) {
    const errorMessage =
      error.response?.data?.error || error.message || "Signup failed";
    yield put(signupFailure(errorMessage));
    yield put(addToast({ message: errorMessage, type: "error" }));
  }
}

function* loginSaga(action) {
  try {
    const { email, password } = action.payload;
    const response = yield call(userAPI.login, email, password);

    if (response.data?.requiresTwoFactor) {
      yield put(
        loginTwoFactorRequired({
          challengeToken: response.data.challengeToken,
          message: response.data.message,
        }),
      );
      yield put(
        addToast({
          message: "Enter the 2FA code sent to your email",
          type: "info",
        }),
      );
      return;
    }

    const { user, token } = response.data;
    yield put(loginSuccess({ user, token }));
    yield put(addToast({ message: "Login successful!", type: "success" }));
  } catch (error) {
    const errorMessage =
      error.response?.data?.error || error.message || "Login failed";
    yield put(loginFailure(errorMessage));
    yield put(addToast({ message: errorMessage, type: "error" }));
  }
}

function* verifyTwoFactorSaga(action) {
  try {
    const { challengeToken, code } = action.payload;
    const response = yield call(userAPI.verifyTwoFactor, challengeToken, code);
    const { user, token, message } = response.data;
    yield put(verifyTwoFactorSuccess({ user, token, message }));
    yield put(
      addToast({
        message: "Two-factor verification successful",
        type: "success",
      }),
    );
  } catch (error) {
    const errorMessage =
      error.response?.data?.error ||
      error.message ||
      "Two-factor verification failed";
    yield put(verifyTwoFactorFailure(errorMessage));
    yield put(addToast({ message: errorMessage, type: "error" }));
  }
}

function* getRecoveryCodesSaga() {
  try {
    yield put(getRecoveryCodesRequest());
    const response = yield call(userAPI.getRecoveryCodes);
    const { recoveryCodes, message } = response.data;
    yield put(getRecoveryCodesSuccess(recoveryCodes));
    yield put(addToast({ message, type: "success" }));
  } catch (error) {
    const errorMessage =
      error.response?.data?.error ||
      error.message ||
      "Unable to fetch recovery codes";
    yield put(getRecoveryCodesFailure(errorMessage));
    yield put(addToast({ message: errorMessage, type: "error" }));
  }
}

function* regenerateRecoveryCodesSaga() {
  try {
    yield put(regenerateRecoveryCodesRequest());
    const response = yield call(userAPI.regenerateRecoveryCodes);
    const { recoveryCodes, message } = response.data;
    yield put(regenerateRecoveryCodesSuccess(recoveryCodes));
    yield put(addToast({ message, type: "success" }));
  } catch (error) {
    const errorMessage =
      error.response?.data?.error ||
      error.message ||
      "Unable to regenerate recovery codes";
    yield put(regenerateRecoveryCodesFailure(errorMessage));
    yield put(addToast({ message: errorMessage, type: "error" }));
  }
}

function* fetchSessionSaga() {
  try {
    const response = yield call(userAPI.getSession);
    const { user, token } = response.data;
    yield put(fetchSessionSuccess({ user, token }));
  } catch (error) {
    const errorMessage =
      error.response?.data?.error ||
      error.message ||
      "Unable to restore session";
    yield put(fetchSessionFailure(errorMessage));
  }
}

function* logoutSaga(action) {
  const { reason = "manual", skipApi = false } = action.payload || {};

  if (!skipApi) {
    try {
      yield call(userAPI.logout);
    } catch {
      // Ignore logout API failures during forced sign out.
    }
  }

  yield put(logout());

  if (reason === "idle") {
    yield put(
      addToast({
        message: "You were signed out after being idle for security.",
        type: "warning",
      }),
    );
    return;
  }

  if (reason === "expired") {
    yield put(
      addToast({
        message: "Session expired. Please sign in again.",
        type: "warning",
      }),
    );
  }
}

function* socialAuthStartSaga(action) {
  const { provider, mode = "login" } = action.payload || {};
  const redirectUrl = userAPI.getSocialAuthUrl(provider, mode);
  yield call([window.location, "assign"], redirectUrl);
}

function* forgotPasswordSaga(action) {
  try {
    const { email } = action.payload;
    const response = yield call(userAPI.forgotPassword, email);
    yield put(forgotPasswordSuccess(response.data.message));
    yield put(addToast({ message: response.data.message, type: "success" }));
  } catch (error) {
    const errorMessage =
      error.response?.data?.error ||
      error.message ||
      "Unable to request password reset";
    yield put(forgotPasswordFailure(errorMessage));
    yield put(addToast({ message: errorMessage, type: "error" }));
  }
}

function* resetPasswordSaga(action) {
  try {
    const { token, password } = action.payload;
    const response = yield call(userAPI.resetPassword, token, password);
    yield put(resetPasswordSuccess(response.data.message));
    yield put(addToast({ message: response.data.message, type: "success" }));
  } catch (error) {
    const errorMessage =
      error.response?.data?.error ||
      error.message ||
      "Unable to reset password";
    yield put(resetPasswordFailure(errorMessage));
    yield put(addToast({ message: errorMessage, type: "error" }));
  }
}

function* sendVerificationSaga() {
  try {
    const response = yield call(userAPI.sendVerificationEmail);
    yield put(sendVerificationSuccess(response.data.message));
    yield put(fetchSessionRequest());
    yield put(addToast({ message: response.data.message, type: "success" }));
  } catch (error) {
    const errorMessage =
      error.response?.data?.error ||
      error.message ||
      "Unable to send verification email";
    yield put(sendVerificationFailure(errorMessage));
    yield put(addToast({ message: errorMessage, type: "error" }));
  }
}

function* verifyEmailSaga(action) {
  try {
    const { token } = action.payload;
    const response = yield call(userAPI.verifyEmail, token);
    yield put(verifyEmailSuccess(response.data.message));
    yield put(addToast({ message: response.data.message, type: "success" }));
  } catch (error) {
    const errorMessage =
      error.response?.data?.error ||
      error.message ||
      "Email verification failed";
    yield put(verifyEmailFailure(errorMessage));
    yield put(addToast({ message: errorMessage, type: "error" }));
  }
}

export function* userSaga() {
  yield takeEvery(signupRequest.type, signupSaga);
  yield takeEvery(loginRequest.type, loginSaga);
  yield takeEvery(fetchSessionRequest.type, fetchSessionSaga);
  yield takeEvery(forgotPasswordRequest.type, forgotPasswordSaga);
  yield takeEvery(resetPasswordRequest.type, resetPasswordSaga);
  yield takeEvery(sendVerificationRequest.type, sendVerificationSaga);
  yield takeEvery(verifyEmailRequest.type, verifyEmailSaga);
  yield takeEvery(verifyTwoFactorRequest.type, verifyTwoFactorSaga);
  yield takeEvery(getRecoveryCodesRequest.type, getRecoveryCodesSaga);
  yield takeEvery(
    regenerateRecoveryCodesRequest.type,
    regenerateRecoveryCodesSaga,
  );
  yield takeEvery(logoutRequest.type, logoutSaga);
  yield takeEvery(socialAuthStartRequest.type, socialAuthStartSaga);
}
