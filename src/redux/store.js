import { applyMiddleware, combineReducers, createStore } from "redux";
import createSagaMiddleware from "redux-saga";
import { rootSaga } from "./sagas";
import agentReducer from "./slices/agentSlice";
import apiBridgeReducer from "./slices/apiBridgeSlice";
import notificationPreferencesReducer from "./slices/notificationPreferencesSlice";
import paymentReducer from "./slices/paymentSlice";
import reportReducer from "./slices/reportSlice";
import toastReducer from "./slices/toastSlice";
import userReducer from "./slices/userSlice";

const sagaMiddleware = createSagaMiddleware();

const rootReducer = combineReducers({
  user: userReducer,
  agent: agentReducer,
  apiBridge: apiBridgeReducer,
  report: reportReducer,
  payment: paymentReducer,
  toast: toastReducer,
  notificationPreferences: notificationPreferencesReducer,
});

const appReducer = (state, action) => {
  if (action.type === "user/logout") {
    return rootReducer(undefined, action);
  }

  return rootReducer(state, action);
};

export const store = createStore(appReducer, applyMiddleware(sagaMiddleware));

sagaMiddleware.run(rootSaga);

export default store;
