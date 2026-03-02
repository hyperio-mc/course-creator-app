/**
 * Auth Modal Component
 *
 * Modal that shows login, signup, or forgot password form.
 *
 * @module src/components/auth/AuthModal
 */

'use client';

import React, { useState } from 'react';
import { LoginForm } from './LoginForm';
import { SignupForm } from './SignupForm';
import { ForgotPasswordForm } from './ForgotPasswordForm';
import { GoogleOAuthButton } from './GoogleOAuthButton';

/**
 * Auth Modal Props
 */
interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  initialMode?: 'login' | 'signup';
}

/**
 * Auth Modal Component
 */
export function AuthModal({ isOpen, onClose, onSuccess, initialMode = 'login' }: AuthModalProps) {
  const [mode, setMode] = useState<'login' | 'signup' | 'forgot-password'>(initialMode);

  if (!isOpen) return null;

  const handleSuccess = () => {
    onClose();
    onSuccess?.();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="flex min-h-full items-center justify-center p-4">
        <div
          className="relative bg-white rounded-lg shadow-xl w-full max-w-md p-6"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            aria-label="Close"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            {mode === 'login' 
              ? 'Sign in to your account' 
              : mode === 'signup' 
                ? 'Create your account' 
                : 'Reset your password'}
          </h2>

          {/* Google OAuth (shown for login/signup) */}
          {(mode === 'login' || mode === 'signup') && (
            <>
              <GoogleOAuthButton text={mode === 'login' ? 'Sign in with Google' : 'Sign up with Google'} />
              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">Or continue with</span>
                </div>
              </div>
            </>
          )}

          {/* Form */}
          {mode === 'login' && (
            <>
              <LoginForm
                onSuccess={handleSuccess}
                onSignupClick={() => setMode('signup')}
              />
              <div className="mt-4 text-center">
                <button
                  type="button"
                  onClick={() => setMode('forgot-password')}
                  className="text-sm text-blue-600 hover:text-blue-500"
                >
                  Forgot your password?
                </button>
              </div>
            </>
          )}

          {mode === 'signup' && (
            <SignupForm
              onSuccess={handleSuccess}
              onLoginClick={() => setMode('login')}
            />
          )}

          {mode === 'forgot-password' && (
            <ForgotPasswordForm
              onBackToLogin={() => setMode('login')}
            />
          )}
        </div>
      </div>
    </div>
  );
}