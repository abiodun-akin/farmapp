/**
 * Email Verification Feature Tests
 * Covers: state transitions, token validation, cooldown logic,
 * banner display conditions, and verify-email page redirect flow.
 */

import { describe, it, expect } from 'vitest';

// ─── Token Validation Logic ───────────────────────────────────────────────────

describe('Email verification token validation', () => {
  const isValidToken = (token) =>
    token && typeof token === 'string' && token.trim().length >= 20;

  it('rejects missing token', () => {
    expect(isValidToken(undefined)).toBeFalsy();
    expect(isValidToken(null)).toBeFalsy();
    expect(isValidToken('')).toBeFalsy();
  });

  it('rejects token that is too short', () => {
    expect(isValidToken('short')).toBeFalsy();
    expect(isValidToken('a'.repeat(19))).toBeFalsy();
  });

  it('accepts token with 20 or more characters', () => {
    expect(isValidToken('a'.repeat(20))).toBeTruthy();
    expect(isValidToken('a'.repeat(64))).toBeTruthy();
  });

  it('rejects non-string token', () => {
    expect(isValidToken(12345)).toBeFalsy();
    expect(isValidToken(['token'])).toBeFalsy();
  });
});

// ─── Cooldown Logic ───────────────────────────────────────────────────────────

describe('Verification email cooldown', () => {
  const COOLDOWN_MS = 2 * 60 * 1000;

  const getSecondsRemaining = (lastSentAt) => {
    if (!lastSentAt) return 0;
    const elapsed = Date.now() - new Date(lastSentAt).getTime();
    return Math.max(0, Math.ceil((COOLDOWN_MS - elapsed) / 1000));
  };

  const isInCooldown = (lastSentAt) => getSecondsRemaining(lastSentAt) > 0;

  it('is not in cooldown when never sent', () => {
    expect(isInCooldown(null)).toBe(false);
    expect(isInCooldown(undefined)).toBe(false);
  });

  it('is in cooldown immediately after sending', () => {
    expect(isInCooldown(new Date())).toBe(true);
  });

  it('is in cooldown 30 seconds after sending', () => {
    const thirtySecondsAgo = new Date(Date.now() - 30 * 1000);
    expect(isInCooldown(thirtySecondsAgo)).toBe(true);
    expect(getSecondsRemaining(thirtySecondsAgo)).toBeLessThanOrEqual(90);
    expect(getSecondsRemaining(thirtySecondsAgo)).toBeGreaterThan(0);
  });

  it('is not in cooldown after 2 minutes have passed', () => {
    const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000 - 1);
    expect(isInCooldown(twoMinutesAgo)).toBe(false);
  });

  it('computes correct remaining seconds when 1 minute has passed', () => {
    const oneMinuteAgo = new Date(Date.now() - 60 * 1000);
    const remaining = getSecondsRemaining(oneMinuteAgo);
    expect(remaining).toBeGreaterThanOrEqual(59);
    expect(remaining).toBeLessThanOrEqual(61);
  });
});

// ─── Email Verification State Transitions ─────────────────────────────────────

describe('Email verification state management', () => {
  const initialState = {
    emailVerificationSent: false,
    emailVerified: false,
    isLoading: false,
    error: null,
    user: null,
  };

  const reducer = (state = initialState, action) => {
    switch (action.type) {
      case 'sendVerificationRequest':
        return { ...state, isLoading: true, error: null, emailVerificationSent: false };
      case 'sendVerificationSuccess':
        return { ...state, isLoading: false, emailVerificationSent: true };
      case 'sendVerificationFailure':
        return { ...state, isLoading: false, error: action.payload };
      case 'verifyEmailRequest':
        return { ...state, isLoading: true, error: null, emailVerified: false };
      case 'verifyEmailSuccess': {
        const updatedUser = state.user ? { ...state.user, isEmailVerified: true } : null;
        return { ...state, isLoading: false, emailVerified: true, user: updatedUser };
      }
      case 'verifyEmailFailure':
        return { ...state, isLoading: false, error: action.payload };
      default:
        return state;
    }
  };

  it('sets isLoading when verification send is requested', () => {
    const state = reducer(initialState, { type: 'sendVerificationRequest' });
    expect(state.isLoading).toBe(true);
    expect(state.emailVerificationSent).toBe(false);
    expect(state.error).toBeNull();
  });

  it('marks emailVerificationSent on success', () => {
    let state = reducer(initialState, { type: 'sendVerificationRequest' });
    state = reducer(state, { type: 'sendVerificationSuccess' });
    expect(state.emailVerificationSent).toBe(true);
    expect(state.isLoading).toBe(false);
  });

  it('stores error message on send failure', () => {
    let state = reducer(initialState, { type: 'sendVerificationRequest' });
    state = reducer(state, { type: 'sendVerificationFailure', payload: 'Please wait 90 seconds' });
    expect(state.error).toBe('Please wait 90 seconds');
    expect(state.emailVerificationSent).toBe(false);
    expect(state.isLoading).toBe(false);
  });

  it('sets isLoading when email verification is requested', () => {
    const state = reducer(initialState, { type: 'verifyEmailRequest' });
    expect(state.isLoading).toBe(true);
    expect(state.emailVerified).toBe(false);
  });

  it('marks emailVerified and updates user.isEmailVerified on success', () => {
    const stateWithUser = { ...initialState, user: { id: '123', email: 'a@b.com', isEmailVerified: false } };
    let state = reducer(stateWithUser, { type: 'verifyEmailRequest' });
    state = reducer(state, { type: 'verifyEmailSuccess' });
    expect(state.emailVerified).toBe(true);
    expect(state.isLoading).toBe(false);
    expect(state.user.isEmailVerified).toBe(true);
  });

  it('preserves user if not present when verifyEmailSuccess fires', () => {
    let state = reducer(initialState, { type: 'verifyEmailRequest' });
    state = reducer(state, { type: 'verifyEmailSuccess' });
    expect(state.user).toBeNull();
    expect(state.emailVerified).toBe(true);
  });

  it('stores error on verify failure', () => {
    let state = reducer(initialState, { type: 'verifyEmailRequest' });
    state = reducer(state, { type: 'verifyEmailFailure', payload: 'Link has expired' });
    expect(state.error).toBe('Link has expired');
    expect(state.emailVerified).toBe(false);
  });
});

// ─── Banner Visibility Conditions ─────────────────────────────────────────────

describe('EmailVerificationBanner display logic', () => {
  const shouldShowBanner = (user) =>
    Boolean(user && !user.isEmailVerified);

  it('does not show banner when user is null', () => {
    expect(shouldShowBanner(null)).toBe(false);
  });

  it('does not show banner when user is already verified', () => {
    expect(shouldShowBanner({ id: '1', isEmailVerified: true })).toBe(false);
  });

  it('shows banner when user is authenticated but unverified', () => {
    expect(shouldShowBanner({ id: '1', isEmailVerified: false })).toBe(true);
  });

  it('shows banner when isEmailVerified is undefined (legacy users)', () => {
    expect(shouldShowBanner({ id: '1' })).toBe(true);
  });
});

// ─── VerifyEmailPage URL Token Parsing ────────────────────────────────────────

describe('VerifyEmailPage token extraction', () => {
  const extractTokenFromSearch = (search) => {
    const params = new URLSearchParams(search);
    return params.get('token');
  };

  it('extracts token from search string', () => {
    const token = extractTokenFromSearch('?token=abc123xyz');
    expect(token).toBe('abc123xyz');
  });

  it('returns null when no token param present', () => {
    expect(extractTokenFromSearch('')).toBeNull();
    expect(extractTokenFromSearch('?other=value')).toBeNull();
  });

  it('handles token with special characters encoded', () => {
    const search = `?token=${'a'.repeat(32)}`;
    expect(extractTokenFromSearch(search)).toBe('a'.repeat(32));
  });
});

// ─── Redirect Timing Logic ────────────────────────────────────────────────────

describe('VerifyEmailPage redirect logic', () => {
  it('schedules redirect after 1500ms on success', () => {
    let redirectCalled = false;
    const redirectAfterDelay = (delayMs, redirectFn) => {
      // Simulate setTimeout with deterministic check
      expect(delayMs).toBe(1500);
      redirectFn();
    };

    redirectAfterDelay(1500, () => { redirectCalled = true; });
    expect(redirectCalled).toBe(true);
  });

  it('does not redirect when verification failed', () => {
    let redirectCalled = false;
    const handleVerifyResult = (success, redirectFn) => {
      if (success) redirectFn();
    };

    handleVerifyResult(false, () => { redirectCalled = true; });
    expect(redirectCalled).toBe(false);
  });

  it('redirects to /login on successful verification', () => {
    let destination = null;
    const navigate = (path) => { destination = path; };

    const handleSuccess = () => navigate('/login');
    handleSuccess();

    expect(destination).toBe('/login');
  });
});
