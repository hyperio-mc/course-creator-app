/**
 * Update Password Flow
 *
 * Handles password changes for logged-in users.
 *
 * @module src/lib/auth/update-password
 */

import { verifyPassword, hashPassword } from './password';
import { dataApi } from '@/lib/hyper-micro';
import { validatePassword } from './signup';

/**
 * Result of password update
 */
export type UpdatePasswordResult =
  | { ok: true; data: { message: string } }
  | { ok: false; error: string };

/**
 * Update password for a logged-in user (uses email as key)
 */
export async function updatePassword(
  email: string,
  currentPassword: string,
  newPassword: string,
  invalidateSessions: boolean = true
): Promise<UpdatePasswordResult> {
  return updatePasswordByEmail(email, currentPassword, newPassword, invalidateSessions);
}

/**
 * Change password using email instead of user ID
 */
export async function updatePasswordByEmail(
  email: string,
  currentPassword: string,
  newPassword: string,
  _invalidateSessions: boolean = true
): Promise<UpdatePasswordResult> {
  const normalizedEmail = email.toLowerCase().trim();

  const passwordValidation = validatePassword(newPassword);
  if (!passwordValidation.valid) {
    return { ok: false, error: passwordValidation.error || 'Invalid password' };
  }

  if (currentPassword === newPassword) {
    return { ok: false, error: 'New password must be different from current password' };
  }

  try {
    const userResult = await dataApi.getDocument('users', normalizedEmail);
    if (!userResult.ok || !userResult.data) {
      return { ok: false, error: 'User not found' };
    }

    const user = userResult.data as {
      id: string;
      email: string;
      password_hash: string;
    };

    const isValid = await verifyPassword(currentPassword, user.password_hash);
    if (!isValid) {
      return { ok: false, error: 'Current password is incorrect' };
    }

    const newPasswordHash = await hashPassword(newPassword);
    await dataApi.updateDocument('users', normalizedEmail, {
      ...user,
      password_hash: newPasswordHash,
      updated_at: new Date().toISOString(),
    });

    return { ok: true, data: { message: 'Password updated successfully' } };
  } catch (error) {
    return { ok: false, error: String(error) };
  }
}