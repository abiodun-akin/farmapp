import { fork } from "redux-saga/effects";
import { agentSaga } from "./agentSaga";
import { apiBridgeSaga } from "./apiBridgeSaga";
import { reportSaga } from "./reportSaga";
import { userSaga } from "./userSaga";
import { paymentSaga } from "./paymentSaga";

export function* rootSaga() {
  yield fork(userSaga);
  yield fork(agentSaga);
  yield fork(apiBridgeSaga);
  yield fork(reportSaga);
  yield fork(paymentSaga);
}
