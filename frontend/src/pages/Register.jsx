import React, { useState, useEffect } from 'react';
import { auth } from '../services/auth';
import Button from '../components/common/Button';

export default function Register({ onRegister, onLoginClick, onCancel }) {
  const [step, setStep] = useState('register'); // 'register' | 'otp'
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  
  const [otp, setOtp] = useState('');
  
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    let timer;
    if (step === 'otp' && countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [step, countdown]);

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    
    if (password !== passwordConfirmation) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      const response = await auth.register(name, email, password, passwordConfirmation);
      setMessage(response.message);
      setStep('otp');
      setCountdown(60); // Start 60s timer
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setError('');
    setMessage('');
    setLoading(true);
    try {
      // Re-use register to resend OTP (it updates the cache)
      const response = await auth.register(name, email, password, passwordConfirmation);
      setMessage("New OTP sent! " + response.message);
      setCountdown(60); // Reset timer
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const user = await auth.verifyOtp(email, otp);
      onRegister(user, "Registration successful!");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 rounded-lg bg-white p-8 shadow-md">
        
        {step === 'register' ? (
          <>
            <div>
              <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
                Create a new account
              </h2>
              <p className="mt-2 text-center text-sm text-gray-600">
                Or{' '}
                <button
                  onClick={onLoginClick}
                  className="font-medium text-brand-600 hover:text-brand-500"
                >
                  sign in to your existing account
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
                    placeholder="Full Name"
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
                    placeholder="Email address"
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
                    placeholder="Password"
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
                    placeholder="Confirm Password"
                    value={passwordConfirmation}
                    onChange={(e) => setPasswordConfirmation(e.target.value)}
                  />
                </div>
              </div>

              {error && <div className="text-center text-sm text-red-600">{error}</div>}

              <div className="flex items-center justify-end gap-2">
                {onCancel && (
                   <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button>
                )}
                <Button type="submit" disabled={loading} className="w-full">
                  {loading ? 'Sending OTP...' : 'Next'}
                </Button>
              </div>
            </form>
          </>
        ) : (
          <>
            <div>
              <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
                Verify Email
              </h2>
              <p className="mt-2 text-center text-sm text-gray-600">
                We sent a 6-digit code to <strong>{email}</strong>
              </p>
              {message && <p className="mt-2 text-center text-xs text-green-600">{message}</p>}
            </div>
            <form className="mt-8 space-y-6" onSubmit={handleVerify}>
              <div>
                <label htmlFor="otp" className="sr-only">OTP Code</label>
                <input
                  id="otp"
                  name="otp"
                  type="text"
                  required
                  maxLength={6}
                  className="relative block w-full rounded-md border border-gray-300 px-3 py-2 text-center text-2xl tracking-[0.5em] text-gray-900 placeholder-gray-400 focus:z-10 focus:border-brand-500 focus:outline-none focus:ring-brand-500 sm:text-sm shadow-sm"
                  placeholder="000000"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                />
              </div>

              {error && <div className="text-center text-sm text-red-600">{error}</div>}

              <div className="flex flex-col gap-3">
                 <div className="flex items-center justify-between gap-2">
                    <Button type="button" variant="ghost" onClick={() => setStep('register')}>Back</Button>
                    <Button type="submit" disabled={loading || otp.length !== 6} className="w-full">
                      {loading ? 'Verifying...' : 'Verify & Create Account'}
                    </Button>
                 </div>
                 
                 <div className="text-center">
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="sm"
                      onClick={handleResendOtp}
                      disabled={loading || countdown > 0}
                      className="text-xs text-gray-500 hover:text-gray-700"
                    >
                      {countdown > 0 ? `Resend OTP in ${countdown}s` : 'Resend OTP'}
                    </Button>
                 </div>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
