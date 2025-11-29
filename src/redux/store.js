import { applyMiddleware, combineReducers, createStore } from "redux";
import createSagaMiddleware from "redux-saga";
import { rootSaga } from "./sagas";
import reportReducer from "./slices/reportSlice";
import userReducer from "./slices/userSlice";
import paymentReducer from "./slices/paymentSlice";
import toastReducer from "./slices/toastSlice";

const sagaMiddleware = createSagaMiddleware();

const rootReducer = combineReducers({
  user: userReducer,
  report: reportReducer,
  payment: paymentReducer,
  toast: toastReducer,
});

export const store = createStore(rootReducer, applyMiddleware(sagaMiddleware));

sagaMiddleware.run(rootSaga);

export default store;
