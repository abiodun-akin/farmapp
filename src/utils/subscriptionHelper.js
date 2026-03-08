/**
 * Subscription Status Helper
 * Provides utility functions for subscription status checking
 */

/**
 * Determine subscription status type
 * @param {Object} subscription - Subscription object from API
 * @param {boolean} hasEverSubscribed - Whether user has ever subscribed
 * @returns {string} One of: 'active', 'expired', 'never-subscribed'
 */
export const getSubscriptionStatusType = (subscription, hasEverSubscribed) => {
  if (!subscription || !subscription.endDate) {
    return hasEverSubscribed ? 'expired' : 'never-subscribed';
  }

  const endDate = new Date(subscription.endDate);
  const now = new Date();

  if (endDate > now) {
    return 'active';
  }

  return 'expired';
};

/**
 * Check if subscription is active
 * @param {Object} subscription - Subscription object from API
 * @returns {boolean}
 */
export const isSubscriptionActive = (subscription) => {
  if (!subscription || !subscription.endDate) {
    return false;
  }

  return new Date(subscription.endDate) > new Date();
};

/**
 * Get subscription display text
 * @param {string} statusType - From getSubscriptionStatusType
 * @returns {string}
 */
export const getSubscriptionDisplayText = (statusType) => {
  switch (statusType) {
    case 'active':
      return 'Active';
    case 'expired':
      return 'Expired';
    case 'never-subscribed':
      return 'Unsubscribed';
    default:
      return 'Unknown';
  }
};

/**
 * Determine if user can access features
 * @param {string} statusType - From getSubscriptionStatusType
 * @param {string} featureType - 'core' (matches, messages, etc) or 'profile' (profile, settings)
 * @returns {boolean}
 */
export const canAccessFeature = (statusType, featureType = 'core') => {
  if (statusType === 'active') {
    return true;
  }

  if (statusType === 'expired' && featureType === 'profile') {
    return true; // Allow profile and settings access for expired users
  }

  return false;
};

export default {
  getSubscriptionStatusType,
  isSubscriptionActive,
  getSubscriptionDisplayText,
  canAccessFeature,
};
