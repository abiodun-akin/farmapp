import { fork } from "redux-saga/effects";
import { reportSaga } from "./reportSaga";
import { userSaga } from "./userSaga";
import { paymentSaga } from "./paymentSaga";

export function* rootSaga() {
  yield fork(userSaga);
  yield fork(reportSaga);
  yield fork(paymentSaga);
}
