import React, { useState } from 'react';
import { auth } from '../services/auth';
import Button from '../components/common/Button';
import { getTranslation } from '../data/translations';

export default function Register({ onRegister, onLoginClick, onCancel, settings }) {
  const t = (key) => getTranslation(settings?.language, key);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    
    if (password !== passwordConfirmation) {
      setError(t('passwordsDoNotMatch'));
      return;
    }

    setLoading(true);

    try {
      const response = await auth.register(name, email, password, passwordConfirmation);
      setSuccess(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
        <div className="w-full max-w-md space-y-8 rounded-lg bg-white p-8 shadow-md text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
            <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="mt-6 text-3xl font-bold tracking-tight text-gray-900">
            {t('checkEmailTitle')}
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            <span dangerouslySetInnerHTML={{ __html: t('verificationSent').replace('{email}', `<strong>${email}</strong>`) }} />
            <br/>
            {t('verifyAccountLink')}
          </p>
          <div className="mt-6">
            <Button onClick={onLoginClick} className="w-full">
              {t('backToSignIn')}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 rounded-lg bg-white p-8 shadow-md">
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
            {t('createAccountTitle')}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {t('or')}{' '}
            <button
              onClick={onLoginClick}
              className="font-medium text-brand-600 hover:text-brand-500"
            >
              {t('signInExisting')}
            </button>
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleRegister}>
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="sr-only">Full Name</label>
              <input
                id="name"
                name="name"
                type="text"
                required
                className="relative block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-brand-500 focus:outline-none focus:ring-brand-500 sm:text-sm shadow-sm"
                placeholder={t('placeholderName')}
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="email-address" className="sr-only">Email address</label>
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
              <label htmlFor="password" className="sr-only">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="relative block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-brand-500 focus:outline-none focus:ring-brand-500 sm:text-sm shadow-sm"
                placeholder={t('placeholderPassword')}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password-confirmation" className="sr-only">Confirm Password</label>
              <input
                id="password-confirmation"
                name="password_confirmation"
                type="password"
                required
                className="relative block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-brand-500 focus:outline-none focus:ring-brand-500 sm:text-sm shadow-sm"
                placeholder={t('confirmPassword')}
                value={passwordConfirmation}
                onChange={(e) => setPasswordConfirmation(e.target.value)}
              />
            </div>
          </div>

          {error && <div className="text-center text-sm text-red-600">{error}</div>}

          <div className="flex items-center justify-end gap-2">
            {onCancel && (
                <Button type="button" variant="ghost" onClick={onCancel}>{t('cancel')}</Button>
            )}
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? t('creatingAccount') : t('register')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
