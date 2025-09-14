'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

function SuccessPageContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState<{
    id: string;
    plan: string;
    status: string;
    current_period_start: string;
    current_period_end: string;
  } | null>(null);
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
      } catch {
        setError('Network error. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    verifyPayment();
  }, [sessionId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center surface">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-600 mx-auto mb-4"></div>
          <p className="text-custom opacity-75">Verifying your payment...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center surface p-4">
        <div className="border border-custom rounded-neumorphism p-8 shadow-neumorphism surface max-w-md w-full text-center">
          <div className="text-red-500 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-custom mb-4">Payment Verification Failed</h1>
          <p className="text-custom opacity-75 mb-6">{error}</p>
          <button
            onClick={() => window.location.href = '/'}
            className="accent text-white border border-custom rounded-neumorphism px-6 py-3 font-medium transition-all hover:shadow-lg"
          >
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center surface p-4">
      <div className="border border-custom rounded-neumorphism p-8 shadow-neumorphism surface max-w-2xl w-full text-center">
        <div className="text-green-500 mb-6">
          <svg className="w-20 h-20 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>

        <h1 className="text-3xl font-bold text-custom mb-4">Welcome to Paira Bot! 🎉</h1>

        <p className="text-xl text-custom opacity-75 mb-6">
          Your payment was successful and your subscription is now active.
        </p>

        {subscription && (
          <div className="border border-custom rounded-neumorphism p-4 mb-6 shadow-neumorphism-sm surface">
            <h3 className="font-semibold text-custom mb-2">Subscription Details</h3>
            <p className="text-custom opacity-75">
              Plan: <span className="font-medium capitalize">{subscription.plan}</span><br />
              Status: <span className="text-green-600 font-medium">{subscription.status}</span><br />
              Expires: <span className="font-medium">{new Date(subscription.current_period_end).toLocaleDateString()}</span>
            </p>
          </div>
        )}

        <div className="space-y-4">
          <h2 className="text-2xl font-semibold text-custom">Download Paira Bot</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <a
              href="#"
              className="accent text-white border border-custom rounded-neumorphism px-6 py-4 font-medium transition-all hover:shadow-lg flex items-center justify-center space-x-2"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
              <span>Download for Windows</span>
            </a>

            <a
              href="#"
              className="surface text-custom border border-custom rounded-neumorphism px-6 py-4 font-medium transition-all hover:accent hover:text-white flex items-center justify-center space-x-2"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l2-2a1 1 0 11-1.414 1.414L11 8.414V12a1 1 0 11-2 0V8.414L8.707 7.293z" clipRule="evenodd" />
              </svg>
              <span>Download for macOS</span>
            </a>
          </div>

          <p className="text-sm text-custom opacity-50 mt-4">
            After downloading, launch the app and sign in with your account to activate your license.
          </p>
        </div>

        <div className="mt-8 pt-6 border-t border-custom">
          <button
            onClick={() => window.location.href = '/'}
            className="text-custom opacity-75 hover:text-custom font-medium"
          >
            ← Back to Home
          </button>
        </div>
      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center surface">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-600 mx-auto mb-4"></div>
          <p className="text-custom opacity-75">Loading...</p>
        </div>
      </div>
    }>
      <SuccessPageContent />
    </Suspense>
  );
}