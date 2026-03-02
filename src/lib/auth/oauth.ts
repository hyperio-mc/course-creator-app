/**
 * Google OAuth Integration
 *
 * Handles Google OAuth 2.0 authentication flow.
 *
 * @module src/lib/auth/oauth
 */

import { dataApi } from '@/lib/hyper-micro';
import { createSession } from './session';

/** Google OAuth configuration */
export interface GoogleOAuthConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
}

/** In-memory state store for CSRF protection */
const oauthStates = new Map<string, { state: string; redirectUrl?: string; created_at: number }>();

/** State expiry time (10 minutes) */
const STATE_EXPIRY_MS = 10 * 60 * 1000;

/**
 * Result of OAuth initiation
 */
export type InitiateOAuthResult =
  | { ok: true; data: { authUrl: string; state: string } }
  | { ok: false; error: string };

/**
 * Result of OAuth callback
 */
export type OAuthCallbackResult =
  | { ok: true; data: { user: { id: string; email: string }; session: { token: string }; isNewUser: boolean } }
  | { ok: false; error: string };

/**
 * Get Google OAuth configuration from environment
 */
export function getGoogleOAuthConfig(): GoogleOAuthConfig | null {
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = process.env.NEXT_PUBLIC_GOOGLE_REDIRECT_URI;

  if (!clientId || !clientSecret || !redirectUri) {
    return null;
  }

  return { clientId, clientSecret, redirectUri };
}

/**
 * Check if Google OAuth is configured
 */
export function isGoogleOAuthConfigured(): boolean {
  return getGoogleOAuthConfig() !== null;
}

/**
 * Initiate Google OAuth flow
 */
export function initiateGoogleOAuth(redirectUrl?: string): InitiateOAuthResult {
  const config = getGoogleOAuthConfig();
  if (!config) {
    return { ok: false, error: 'Google OAuth not configured' };
  }

  const state = crypto.randomUUID();
  oauthStates.set(state, {
    state,
    redirectUrl,
    created_at: Date.now(),
  });

  cleanupExpiredStates();

  const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
  authUrl.searchParams.set('client_id', config.clientId);
  authUrl.searchParams.set('redirect_uri', config.redirectUri);
  authUrl.searchParams.set('response_type', 'code');
  authUrl.searchParams.set('scope', 'email profile');
  authUrl.searchParams.set('state', state);

  return { ok: true, data: { authUrl: authUrl.toString(), state } };
}

/**
 * Handle Google OAuth callback
 */
export async function handleGoogleOAuthCallback(
  code: string,
  state: string
): Promise<OAuthCallbackResult> {
  const config = getGoogleOAuthConfig();
  if (!config) {
    return { ok: false, error: 'Google OAuth not configured' };
  }

  const storedState = oauthStates.get(state);
  if (!storedState) {
    return { ok: false, error: 'Invalid or expired state token' };
  }

  if (Date.now() - storedState.created_at > STATE_EXPIRY_MS) {
    oauthStates.delete(state);
    return { ok: false, error: 'State token expired' };
  }

  oauthStates.delete(state);

  try {
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: config.clientId,
        client_secret: config.clientSecret,
        redirect_uri: config.redirectUri,
        grant_type: 'authorization_code',
      }),
    });

    if (!tokenResponse.ok) {
      return { ok: false, error: 'Token exchange failed' };
    }

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;

    if (!accessToken) {
      return { ok: false, error: 'No access token in response' };
    }

    const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!userInfoResponse.ok) {
      return { ok: false, error: 'Failed to fetch user info' };
    }

    const userInfo = await userInfoResponse.json();

    if (!userInfo.email) {
      return { ok: false, error: 'No email in Google account' };
    }

    const email = userInfo.email.toLowerCase().trim();
    let isNewUser = false;
    let userId: string;

    const existingUserResult = await dataApi.getDocument('users', email);

    if (existingUserResult.ok && existingUserResult.data) {
      const existingUser = existingUserResult.data as {
        id: string;
        email: string;
        google_id?: string;
      };
      userId = existingUser.id;

      await dataApi.updateDocument('users', email, {
        ...existingUser,
        google_id: userInfo.id,
        updated_at: new Date().toISOString(),
      });
    } else {
      isNewUser = true;
      userId = crypto.randomUUID();

      await dataApi.createDocument('users', email, {
        id: userId,
        email,
        google_id: userInfo.id,
        name: userInfo.name,
        email_verified: userInfo.verified_email,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        auth_provider: 'google',
      });
    }

    const sessionResult = createSession(userId);
    if (!sessionResult.ok) {
      return { ok: false, error: 'Failed to create session' };
    }

    return {
      ok: true,
      data: {
        user: { id: userId, email },
        session: { token: sessionResult.data.token },
        isNewUser,
      },
    };
  } catch (error) {
    return { ok: false, error: String(error) };
  }
}

/**
 * Clean up expired OAuth states
 */
function cleanupExpiredStates(): void {
  const now = Date.now();
  for (const [key, state] of oauthStates.entries()) {
    if (now - state.created_at > STATE_EXPIRY_MS) {
      oauthStates.delete(key);
    }
  }
}