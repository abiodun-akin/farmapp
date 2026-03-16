import { useCallback } from "react";
import { useDispatch } from "react-redux";
import { apiBridgeRequest } from "../redux/slices/apiBridgeSlice";

export const useSagaApi = () => {
  const dispatch = useDispatch();

  return useCallback(({ service, method, args = [] }) => new Promise((resolve, reject) => {
    dispatch(apiBridgeRequest({ service, method, args, resolve, reject }));
  }), [dispatch]);
};

export default useSagaApi;