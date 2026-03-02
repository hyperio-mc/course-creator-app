'use client';

import React, { useState } from 'react';
import { requestPasswordReset } from '@/lib/auth/reset-password';

interface ForgotPasswordFormProps {
  onBackToLogin?: () => void;
}

export function ForgotPasswordForm({ onBackToLogin }: ForgotPasswordFormProps) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (!email) {
      setError('Email is required');
      setLoading(false);
      return;
    }

    const result = await requestPasswordReset(email);
    setLoading(false);

    if (result.ok) {
      setSuccess(true);
    } else {
      setError(result.error || 'Failed to send reset email');
    }
  };

  if (success) {
    return (
      <div className="space-y-4">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
            <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900">Check your email</h3>
          <p className="mt-2 text-sm text-gray-500">
            If an account exists with {email}, we&apos;ve sent password reset instructions.
          </p>
        </div>
        {onBackToLogin && (
          <button
            type="button"
            onClick={onBackToLogin}
            className="w-full py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            Back to login
          </button>
        )}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="text-center mb-4">
        <h3 className="text-lg font-medium text-gray-900">Forgot password?</h3>
        <p className="text-sm text-gray-500">Enter your email to reset your password.</p>
      </div>

      <div>
        <label htmlFor="forgot-email" className="block text-sm font-medium text-gray-700 mb-1">
          Email
        </label>
        <input
          id="forgot-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={loading}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
          placeholder="you@example.com"
          autoComplete="email"
        />
      </div>

      {error && (
        <div className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-md">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Sending...' : 'Send reset link'}
      </button>

      {onBackToLogin && (
        <div className="text-center text-sm">
          <span className="text-gray-600">Remember your password? </span>
          <button
            type="button"
            onClick={onBackToLogin}
            className="text-blue-600 hover:text-blue-500 font-medium"
          >
            Sign in
          </button>
        </div>
      )}
    </form>
  );
}