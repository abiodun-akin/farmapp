import { useDispatch, useSelector } from "react-redux";
import {
  clearAuthFeedback,
  clearError,
  fetchSessionRequest,
  forgotPasswordRequest,
  loginRequest,
  logoutRequest,
  resetPasswordRequest,
  sendVerificationRequest,
  signupRequest,
  socialAuthStartRequest,
  verifyEmailRequest,
  verifyTwoFactorRequest,
} from "../redux/slices/userSlice";

export const useAuth = () => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user.user);
  const token = useSelector((state) => state.user.token);
  const loading = useSelector((state) => state.user.loading);
  const error = useSelector((state) => state.user.error);
  const statusMessage = useSelector((state) => state.user.statusMessage);
  const passwordResetRequested = useSelector(
    (state) => state.user.passwordResetRequested,
  );
  const passwordResetCompleted = useSelector(
    (state) => state.user.passwordResetCompleted,
  );
  const emailVerificationSent = useSelector(
    (state) => state.user.emailVerificationSent,
  );
  const emailVerified = useSelector((state) => state.user.emailVerified);
  const twoFactorRequired = useSelector(
    (state) => state.user.twoFactorRequired,
  );
  const twoFactorChallengeToken = useSelector(
    (state) => state.user.twoFactorChallengeToken,
  );
  const isAuthenticated = useSelector((state) => state.user.isAuthenticated);

  const signup = (name, email, password, promoCode = null) => {
    dispatch(signupRequest({ name, email, password, promoCode }));
  };

  const login = (email, password) => {
    dispatch(loginRequest({ email, password }));
  };

  const forgotPassword = (email) => {
    dispatch(forgotPasswordRequest({ email }));
  };

  const resetPassword = (token, password) => {
    dispatch(resetPasswordRequest({ token, password }));
  };

  const sendVerificationEmail = () => {
    dispatch(sendVerificationRequest());
  };

  const verifyEmail = (token) => {
    dispatch(verifyEmailRequest({ token }));
  };

  const verifyTwoFactor = (challengeToken, code) => {
    dispatch(verifyTwoFactorRequest({ challengeToken, code }));
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

  const clearFeedback = () => {
    dispatch(clearAuthFeedback());
  };

  return {
    user,
    token,
    loading,
    error,
    statusMessage,
    passwordResetRequested,
    passwordResetCompleted,
    emailVerificationSent,
    emailVerified,
    twoFactorRequired,
    twoFactorChallengeToken,
    isAuthenticated,
    signup,
    login,
    forgotPassword,
    resetPassword,
    sendVerificationEmail,
    verifyEmail,
    verifyTwoFactor,
    logout: handleLogout,
    restoreSession,
    startSocialAuth,
    clearError: handleClearError,
    clearFeedback,
  };
};
