import { useDispatch, useSelector } from "react-redux";
import {
  clearError,
  loginRequest,
  logout,
  signupRequest,
} from "../redux/slices/userSlice";

export const useAuth = () => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user.user);
  const token = useSelector((state) => state.user.token);
  const loading = useSelector((state) => state.user.loading);
  const error = useSelector((state) => state.user.error);
  const isAuthenticated = useSelector((state) => state.user.isAuthenticated);

  const signup = (name, email, password) => {
    dispatch(signupRequest({ name, email, password }));
  };

  const login = (email, password) => {
    dispatch(loginRequest({ email, password }));
  };

  const handleLogout = () => {
    dispatch(logout());
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
    clearError: handleClearError,
  };
};
