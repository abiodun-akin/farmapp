import { call, put, takeEvery } from "redux-saga/effects";
import { userAPI } from "../../api/userApi";
import {
  fetchSessionFailure,
  fetchSessionRequest,
  fetchSessionSuccess,
  loginFailure,
  loginRequest,
  loginSuccess,
  logout,
  logoutRequest,
  socialAuthStartRequest,
  signupFailure,
  signupRequest,
  signupSuccess,
} from "../slices/userSlice";
import { addToast } from "../slices/toastSlice";

function* signupSaga(action) {
  try {
    const {
      name, email, password, promoCode,
    } = action.payload;
    const response = yield call(userAPI.signup, name, email, password, promoCode);
    const { user, token } = response.data;
    yield put(signupSuccess({ user, token }));
    yield put(addToast({ message: "Account created successfully!", type: "success" }));
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

function* fetchSessionSaga() {
  try {
    const response = yield call(userAPI.getSession);
    const { user, token } = response.data;
    yield put(fetchSessionSuccess({ user, token }));
  } catch (error) {
    const errorMessage =
      error.response?.data?.error || error.message || "Unable to restore session";
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
    yield put(addToast({ message: "You were signed out after being idle for security.", type: "warning" }));
    return;
  }

  if (reason === "expired") {
    yield put(addToast({ message: "Session expired. Please sign in again.", type: "warning" }));
  }
}

function* socialAuthStartSaga(action) {
  const { provider, mode = "login" } = action.payload || {};
  const redirectUrl = userAPI.getSocialAuthUrl(provider, mode);
  yield call([window.location, "assign"], redirectUrl);
}

export function* userSaga() {
  yield takeEvery(signupRequest.type, signupSaga);
  yield takeEvery(loginRequest.type, loginSaga);
  yield takeEvery(fetchSessionRequest.type, fetchSessionSaga);
  yield takeEvery(logoutRequest.type, logoutSaga);
  yield takeEvery(socialAuthStartRequest.type, socialAuthStartSaga);
}
