import { call, put, takeEvery } from "redux-saga/effects";
import { userAPI } from "../../api/userApi";
import {
  loginFailure,
  loginRequest,
  loginSuccess,
  signupFailure,
  signupRequest,
  signupSuccess,
} from "../slices/userSlice";
import { addToast } from "../slices/toastSlice";

function* signupSaga(action) {
  try {
    const { name, email, password } = action.payload;
    const response = yield call(userAPI.signup, name, email, password);
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

export function* userSaga() {
  yield takeEvery(signupRequest.type, signupSaga);
  yield takeEvery(loginRequest.type, loginSaga);
}
