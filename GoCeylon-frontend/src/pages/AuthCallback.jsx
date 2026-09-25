import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { useNavigate, useSearchParams } from 'react-router-dom';
import API_BASE_URL from '../config/config';

/**
 * OAuth callback page.
 *
 * Google -> backend /api/auth/google/callback -> redirects the browser here as
 *   /auth/callback?code=<one-time-code>
 *
 * This page swaps that short-lived, single-use code for the real GoCeylon JWT by
 * calling POST /api/auth/oauth/exchange, stores the JWT exactly like the normal
 * login does, then sends the user into the app. The JWT never travels in the URL
 * (only the one-time code does), which is the whole point of the exchange design.
 */
const AuthCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [error, setError] = useState(null);

  // The one-time code can be exchanged only ONCE (the backend deletes it on first
  // use). React 18 StrictMode runs effects twice in development, so without this
  // guard the second run would try to reuse an already-consumed code and show a
  // false "invalid code" error. The ref makes the exchange run a single time.
  const exchangedRef = useRef(false);

  useEffect(() => {
    const code = searchParams.get('code');

    if (!code) {
      setError('No authorization code found. Please try signing in again.');
      return;
    }

    if (exchangedRef.current) return;
    exchangedRef.current = true;

    const exchangeCode = async () => {
      try {
        const response = await axios.post(`${API_BASE_URL}/api/auth/oauth/exchange`, { code });
        const { token } = response.data;

        // Store the session JWT the same way Login.jsx does.
        localStorage.setItem('authToken', token);

        // Strip the code from the URL so it is not left in browser history.
        window.history.replaceState({}, document.title, '/auth/callback');

        // Google sign-ins are onboarded as tourists by the backend.
        navigate('/user/', { replace: true });
      } catch (err) {
        console.error('OAuth exchange failed:', err);
        setError(err.response?.data?.message || 'Google sign-in failed. Please try again.');
      }
    };

    exchangeCode();
  }, [searchParams, navigate]);

  return (
    <div className="h-screen flex items-center justify-center lg:bg-gray-100">
      <div className="bg-white bg-opacity-80 p-10 max-w-[400px] w-full text-center lg:shadow-lg lg:rounded-lg">
        {error ? (
          <>
            <h2 className="text-xl font-semibold text-red-600 mb-3">Sign-in failed</h2>
            <p className="text-sm text-gray-600 mb-6">{error}</p>
            <button
              onClick={() => navigate('/login', { replace: true })}
              className="w-full bg-[#007a55] text-white py-3 rounded-lg"
            >
              Back to Login
            </button>
          </>
        ) : (
          <>
            <h2 className="text-xl font-semibold text-gray-800 mb-3">Signing you in…</h2>
            <p className="text-sm text-gray-500">Completing Google authentication, please wait.</p>
          </>
        )}
      </div>
    </div>
  );
};

export default AuthCallback;
