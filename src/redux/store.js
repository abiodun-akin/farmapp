import { applyMiddleware, combineReducers, createStore } from "redux";
import createSagaMiddleware from "redux-saga";
import { rootSaga } from "./sagas";
import agentReducer from "./slices/agentSlice";
import reportReducer from "./slices/reportSlice";
import userReducer from "./slices/userSlice";
import paymentReducer from "./slices/paymentSlice";
import toastReducer from "./slices/toastSlice";

const sagaMiddleware = createSagaMiddleware();

const rootReducer = combineReducers({
  user: userReducer,
  agent: agentReducer,
  report: reportReducer,
  payment: paymentReducer,
  toast: toastReducer,
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
