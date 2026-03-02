/**
 * Password Reset Flow
 *
 * Handles password reset requests with token generation.
 *
 * @module src/lib/auth/reset-password
 */

import { dataApi } from '@/lib/hyper-micro';
import { hashPassword } from './password';
import { validatePassword } from './signup';

/** Password reset token expiry time (1 hour) */
const RESET_TOKEN_EXPIRY_MS = 60 * 60 * 1000;

/**
 * Result of password reset request
 */
export type ResetRequestResult =
  | { ok: true; data: { token: string; expiresAt: string } }
  | { ok: false; error: string };

/**
 * Result of password reset confirmation
 */
export type ResetConfirmResult =
  | { ok: true; data: { email: string } }
  | { ok: false; error: string };

/**
 * Request a password reset for an email
 */
export async function requestPasswordReset(email: string): Promise<ResetRequestResult> {
  const normalizedEmail = email.toLowerCase().trim();

  try {
    const userResult = await dataApi.getDocument('users', normalizedEmail);
    if (!userResult.ok || !userResult.data) {
      return {
        ok: true,
        data: {
          token: crypto.randomUUID(),
          expiresAt: new Date(Date.now() + RESET_TOKEN_EXPIRY_MS).toISOString(),
        },
      };
    }

    const token = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + RESET_TOKEN_EXPIRY_MS).toISOString();

    const resetRecord = {
      email: normalizedEmail,
      token,
      created_at: new Date().toISOString(),
      expires_at: expiresAt,
      used: false,
    };

    await dataApi.createDocument('password_resets', token, resetRecord);

    return { ok: true, data: { token, expiresAt } };
  } catch (error) {
    return { ok: false, error: String(error) };
  }
}

/**
 * Confirm password reset with token and new password
 */
export async function confirmPasswordReset(
  token: string,
  newPassword: string
): Promise<ResetConfirmResult> {
  const passwordValidation = validatePassword(newPassword);
  if (!passwordValidation.valid) {
    return { ok: false, error: passwordValidation.error || 'Invalid password' };
  }

  try {
    const resetResult = await dataApi.getDocument('password_resets', token);
    if (!resetResult.ok || !resetResult.data) {
      return { ok: false, error: 'Invalid or expired reset token' };
    }

    const resetRecord = resetResult.data as {
      email: string;
      token: string;
      expires_at: string;
      used: boolean;
    };

    if (resetRecord.used) {
      return { ok: false, error: 'Reset token already used' };
    }

    const expiresAt = new Date(resetRecord.expires_at);
    if (expiresAt < new Date()) {
      return { ok: false, error: 'Reset token has expired' };
    }

    const passwordHash = await hashPassword(newPassword);

    const userResult = await dataApi.getDocument('users', resetRecord.email);
    if (!userResult.ok || !userResult.data) {
      return { ok: false, error: 'User not found' };
    }

    const user = userResult.data as { id: string; email: string; password_hash: string };

    await dataApi.updateDocument('users', resetRecord.email, {
      ...user,
      password_hash: passwordHash,
      updated_at: new Date().toISOString(),
    });

    await dataApi.updateDocument('password_resets', token, {
      ...resetRecord,
      used: true,
    });

    return { ok: true, data: { email: resetRecord.email } };
  } catch (error) {
    return { ok: false, error: String(error) };
  }
}

/**
 * Validate a reset token without consuming it
 */
export async function validateResetToken(
  token: string
): Promise<{ ok: true; data: { email: string } } | { ok: false; error: string }> {
  try {
    const resetResult = await dataApi.getDocument('password_resets', token);
    if (!resetResult.ok || !resetResult.data) {
      return { ok: false, error: 'Invalid reset token' };
    }

    const resetRecord = resetResult.data as {
      email: string;
      expires_at: string;
      used: boolean;
    };

    if (resetRecord.used) {
      return { ok: false, error: 'Reset token already used' };
    }

    const expiresAt = new Date(resetRecord.expires_at);
    if (expiresAt < new Date()) {
      return { ok: false, error: 'Reset token has expired' };
    }

    return { ok: true, data: { email: resetRecord.email } };
  } catch (error) {
    return { ok: false, error: String(error) };
  }
}