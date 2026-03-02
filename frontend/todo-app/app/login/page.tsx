'use client';

import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formErrors, setFormErrors] = useState<{ email?: string; password?: string }>({});
  const { login, error: authError, clearError, isLoading } = useAuth();

  const validate = () => {
    const errors: typeof formErrors = {};
    if (!email) errors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(email)) errors.email = 'Invalid email format';
    if (!password) errors.password = 'Password is required';
    else if (password.length < 6) errors.password = 'Password must be at least 6 characters';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    if (!validate()) return;
    try {
      await login({ email, password });
    } catch {
      // error handled in context
    }
  };

  return (
    <div className="min-h-screen bg-[#FCFAEF] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Logo / Icon */}
        <div className="flex justify-center">
          <div className="h-16 w-16 bg-white rounded-full flex items-center justify-center border-2 border-[#DBD0BD] shadow-md">
            <svg className="h-8 w-8 text-[#0C5446]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
        </div>

        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-[#0C5446]">Welcome back</h2>
          <p className="mt-2 text-sm text-[#0C5446]/70">
            Sign in to your account to continue
          </p>
        </div>

        <div className="bg-white border border-[#DBD0BD] rounded-xl shadow-lg p-8">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              {/* Email Field */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-[#0C5446] mb-1">
                  Email address
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (formErrors.email) setFormErrors({ ...formErrors, email: undefined });
                  }}
                  className={`w-full px-3 py-2 bg-[#FCFAEF] border ${
                    formErrors.email ? 'border-red-400' : 'border-[#DBD0BD]'
                  } rounded-lg text-[#0C5446] placeholder-[#0C5446]/40 focus:outline-none focus:ring-2 focus:ring-[#FF6700] focus:border-transparent transition-all`}
                  placeholder="you@example.com"
                />
                {formErrors.email && (
                  <p className="mt-1 text-sm text-red-500">{formErrors.email}</p>
                )}
              </div>

              {/* Password Field */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-[#0C5446] mb-1">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (formErrors.password) setFormErrors({ ...formErrors, password: undefined });
                  }}
                  className={`w-full px-3 py-2 bg-[#FCFAEF] border ${
                    formErrors.password ? 'border-red-400' : 'border-[#DBD0BD]'
                  } rounded-lg text-[#0C5446] placeholder-[#0C5446]/40 focus:outline-none focus:ring-2 focus:ring-[#FF6700] focus:border-transparent transition-all`}
                  placeholder="••••••••"
                />
                {formErrors.password && (
                  <p className="mt-1 text-sm text-red-500">{formErrors.password}</p>
                )}
              </div>
            </div>

            {/* Auth Error */}
            {authError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{authError}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-lg text-sm font-medium text-white bg-[#FF6700] hover:bg-[#e55c00] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white focus:ring-[#FF6700] transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  Signing in...
                </div>
              ) : (
                'Sign in'
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-[#0C5446]/70">
              Don't have an account?{' '}
              <Link
                href="/signup"
                className="font-medium text-[#FF6700] hover:text-[#e55c00] hover:underline focus:outline-none focus:ring-2 focus:ring-[#FF6700] rounded"
              >
                Create one now
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}