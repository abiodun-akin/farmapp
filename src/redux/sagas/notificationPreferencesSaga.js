import { call, put, takeEvery } from "redux-saga/effects";
import notificationPreferencesAPI from "../../api/notificationPreferencesApi";
import {
  fetchPreferencesFailure,
  fetchPreferencesRequest,
  fetchPreferencesSuccess,
  resetPreferencesFailure,
  resetPreferencesRequest,
  resetPreferencesSuccess,
  updatePreferencesFailure,
  updatePreferencesRequest,
  updatePreferencesSuccess,
} from "../slices/notificationPreferencesSlice";
import { addToast } from "../slices/toastSlice";

function* fetchPreferencesSaga() {
  try {
    const response = yield call(notificationPreferencesAPI.getPreferences);
    yield put(fetchPreferencesSuccess(response.data));
  } catch (error) {
    const errorMessage =
      error?.response?.data?.message ||
      "Failed to load notification preferences";
    yield put(fetchPreferencesFailure(errorMessage));
    yield put(
      addToast({
        message: errorMessage,
        type: "error",
      }),
    );
  }
}

function* updatePreferencesSaga(action) {
  try {
    const { preferences } = action.payload;
    const response = yield call(
      notificationPreferencesAPI.updatePreferences,
      preferences,
    );
    yield put(updatePreferencesSuccess(response.data.preferences));
    yield put(
      addToast({
        message: "Notification preferences saved successfully",
        type: "success",
      }),
    );
  } catch (error) {
    const errorMessage =
      error?.response?.data?.message || "Failed to save preferences";
    yield put(updatePreferencesFailure(errorMessage));
    yield put(
      addToast({
        message: errorMessage,
        type: "error",
      }),
    );
  }
}

function* resetPreferencesSaga() {
  try {
    const response = yield call(notificationPreferencesAPI.resetPreferences);
    yield put(resetPreferencesSuccess(response.data.preferences));
    yield put(
      addToast({
        message: "Notification preferences reset to defaults",
        type: "success",
      }),
    );
  } catch (error) {
    const errorMessage =
      error?.response?.data?.message || "Failed to reset preferences";
    yield put(resetPreferencesFailure(errorMessage));
    yield put(
      addToast({
        message: errorMessage,
        type: "error",
      }),
    );
  }
}

export function* notificationPreferencesSaga() {
  yield takeEvery(fetchPreferencesRequest.type, fetchPreferencesSaga);
  yield takeEvery(updatePreferencesRequest.type, updatePreferencesSaga);
  yield takeEvery(resetPreferencesRequest.type, resetPreferencesSaga);
}
