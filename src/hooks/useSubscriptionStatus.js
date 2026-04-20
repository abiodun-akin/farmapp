import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchSubscriptionStatusRequest } from "../redux/slices/paymentSlice";
import {
  getSubscriptionDisplayText,
  getSubscriptionStatusType,
} from "../utils/subscriptionHelper";

export const useSubscriptionStatus = ({
  fetchOnMount = true,
  forceRefresh = false,
} = {}) => {
  const dispatch = useDispatch();
  const { user, isAuthenticated } = useSelector((state) => state.user);
  const userId = user?._id || user?.id;
  const {
    subscription,
    hasActiveSubscription,
    hasEverSubscribed,
    subscriptionLoading,
    subscriptionError,
    subscriptionLastFetchedAt,
    subscriptionUserId,
  } = useSelector((state) => state.payment);

  useEffect(() => {
    if (!fetchOnMount || !isAuthenticated || !userId) {
      return;
    }

    const isDifferentUser = subscriptionUserId !== userId;
    const shouldFetch =
      forceRefresh ||
      isDifferentUser ||
      (!subscriptionLoading && !subscriptionLastFetchedAt);

    if (shouldFetch) {
      dispatch(fetchSubscriptionStatusRequest({ userId, force: forceRefresh }));
    }
  }, [
    dispatch,
    fetchOnMount,
    forceRefresh,
    isAuthenticated,
    userId,
    subscriptionUserId,
    subscriptionLoading,
    subscriptionLastFetchedAt,
  ]);

  // Prefer backend active flag when available to avoid stale/incomplete payload edge cases.
  const statusType = hasActiveSubscription
    ? "active"
    : getSubscriptionStatusType(subscription, hasEverSubscribed);
  const statusDisplay = getSubscriptionDisplayText(statusType);

  const refreshSubscription = () => {
    if (!userId) {
      return;
    }

    dispatch(fetchSubscriptionStatusRequest({ userId, force: true }));
  };

  return {
    subscription,
    hasActiveSubscription,
    hasEverSubscribed,
    subscriptionLoading,
    subscriptionError,
    statusType,
    statusDisplay,
    refreshSubscription,
  };
};

export default useSubscriptionStatus;
