import { useDispatch, useSelector } from "react-redux";
import {
  clearError,
  fetchSessionRequest,
  loginRequest,
  logoutRequest,
  socialAuthStartRequest,
  signupRequest,
} from "../redux/slices/userSlice";

export const useAuth = () => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user.user);
  const token = useSelector((state) => state.user.token);
  const loading = useSelector((state) => state.user.loading);
  const error = useSelector((state) => state.user.error);
  const isAuthenticated = useSelector((state) => state.user.isAuthenticated);

  const signup = (name, email, password, promoCode = null) => {
    dispatch(signupRequest({ name, email, password, promoCode }));
  };

  const login = (email, password) => {
    dispatch(loginRequest({ email, password }));
  };

  const handleLogout = (reason = "manual") => {
    dispatch(logoutRequest({ reason }));
  };

  const restoreSession = () => {
    dispatch(fetchSessionRequest());
  };

  const startSocialAuth = (provider, mode = "login") => {
    dispatch(socialAuthStartRequest({ provider, mode }));
  };

  const handleClearError = () => {
    dispatch(clearError());
  };

  return {
    user,
    token,
    loading,
    error,
    isAuthenticated,
    signup,
    login,
    logout: handleLogout,
    restoreSession,
    startSocialAuth,
    clearError: handleClearError,
  };
};
