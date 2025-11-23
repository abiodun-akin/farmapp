import { fork } from "redux-saga/effects";
import { reportSaga } from "./reportSaga";
import { userSaga } from "./userSaga";

export function* rootSaga() {
  yield fork(userSaga);
  yield fork(reportSaga);
}
