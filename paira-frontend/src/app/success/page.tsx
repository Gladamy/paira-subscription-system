'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';

export default function SuccessPage() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState<any>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const verifyPayment = async () => {
      if (!sessionId) {
        setError('No session ID provided');
        setLoading(false);
        return;
      }

      try {
        // Verify the session with your backend
        const token = localStorage.getItem('paira_auth_token');
        if (!token) {
          setError('No authentication token found. Please sign in again.');
          setLoading(false);
          return;
        }

        // Check subscription status
        const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'https://api.paira.live';
        const response = await fetch(`${API_BASE}/api/subscriptions/status`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          setSubscription(data.subscription);
        } else {
          setError('Failed to verify subscription. Please contact support.');
        }
      } catch (error) {
        setError('Network error. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    verifyPayment();
  }, [sessionId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Verifying your payment...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <div className="text-red-500 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-4">Payment Verification Failed</h1>
          <p className="text-slate-600 mb-6">{error}</p>
          <button
            onClick={() => window.location.href = '/'}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700"
          >
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-2xl w-full text-center">
        <div className="text-green-500 mb-6">
          <svg className="w-20 h-20 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>

        <h1 className="text-3xl font-bold text-slate-900 mb-4">Welcome to Paira Bot! 🎉</h1>

        <p className="text-xl text-slate-600 mb-6">
          Your payment was successful and your subscription is now active.
        </p>

        {subscription && (
          <div className="bg-slate-50 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-slate-900 mb-2">Subscription Details</h3>
            <p className="text-slate-600">
              Plan: <span className="font-medium capitalize">{subscription.plan}</span><br />
              Status: <span className="text-green-600 font-medium">{subscription.status}</span><br />
              Expires: <span className="font-medium">{new Date(subscription.current_period_end).toLocaleDateString()}</span>
            </p>
          </div>
        )}

        <div className="space-y-4">
          <h2 className="text-2xl font-semibold text-slate-900">Download Paira Bot</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <a
              href="#"
              className="bg-blue-600 text-white px-6 py-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
              <span>Download for Windows</span>
            </a>

            <a
              href="#"
              className="bg-slate-600 text-white px-6 py-4 rounded-lg font-semibold hover:bg-slate-700 transition-colors flex items-center justify-center space-x-2"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l2-2a1 1 0 11-1.414 1.414L11 8.414V12a1 1 0 11-2 0V8.414L8.707 7.293z" clipRule="evenodd" />
              </svg>
              <span>Download for macOS</span>
            </a>
          </div>

          <p className="text-sm text-slate-500 mt-4">
            After downloading, launch the app and sign in with your account to activate your license.
          </p>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-200">
          <button
            onClick={() => window.location.href = '/'}
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            ← Back to Home
          </button>
        </div>
      </div>
    </div>
  );
}