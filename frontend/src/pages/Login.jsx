import React, { useState, useEffect } from 'react';
import { auth } from '../services/auth';
import Button from '../components/common/Button';
import { getTranslation } from '../data/translations';

export default function Login({ onLogin, onRegisterClick, onForgotPasswordClick, onCancel, settings }) {
  const t = (key) => getTranslation(settings?.language, key);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Check for verified query parameter
    const params = new URLSearchParams(window.location.search);
    if (params.get('verified') === '1') {
      setSuccess(t('emailVerifiedSuccess'));
      // Clean up the URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const user = await auth.login(email, password);
      onLogin(user);
    } catch (err) {
      if (err.message === 'Please verify your email address before logging in.') {
        setError(t('verifyEmailBeforeLogin'));
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 rounded-lg bg-white p-8 shadow-md">
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
            {t('signInTitle')}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {t('or')}{' '}
            <button
              onClick={onRegisterClick}
              className="font-medium text-brand-600 hover:text-brand-500"
            >
              {t('createNewAccount')}
            </button>
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            {success && (
              <div className="rounded-md bg-green-50 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-green-800">{success}</p>
                  </div>
                </div>
              </div>
            )}
            <div>
              <label htmlFor="email-address" className="sr-only">
                Email address
              </label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="relative block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-brand-500 focus:outline-none focus:ring-brand-500 sm:text-sm shadow-sm"
                placeholder={t('placeholderEmail')}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="relative block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-brand-500 focus:outline-none focus:ring-brand-500 sm:text-sm shadow-sm"
                placeholder={t('placeholderPassword')}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          {error && (
            <div className="text-center text-sm text-red-600">
              {error}
            </div>
          )}

          <div className="flex items-center justify-between">
             {/* Forgot password can be added here */}
             <div className="text-sm">
               <button 
                type="button"
                onClick={onForgotPasswordClick}
                className="font-medium text-brand-600 hover:text-brand-500"
               >
                 {t('forgotPassword')}
               </button>
             </div>
             {onCancel && (
               <Button
                 type="button"
                 variant="ghost"
                 onClick={onCancel}
               >
                 {t('cancel')}
               </Button>
             )}
          </div>

          <div>
            <Button
              type="submit"
              disabled={loading}
              className="w-full"
            >
              {loading ? t('signingIn') : t('signIn')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
