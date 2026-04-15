import { fork } from "redux-saga/effects";
import { agentSaga } from "./agentSaga";
import { apiBridgeSaga } from "./apiBridgeSaga";
import { notificationPreferencesSaga } from "./notificationPreferencesSaga";
import { paymentSaga } from "./paymentSaga";
import { reportSaga } from "./reportSaga";
import { userSaga } from "./userSaga";

export function* rootSaga() {
  yield fork(userSaga);
  yield fork(agentSaga);
  yield fork(apiBridgeSaga);
  yield fork(reportSaga);
  yield fork(paymentSaga);
  yield fork(notificationPreferencesSaga);
}
