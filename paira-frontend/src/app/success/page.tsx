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
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-600 mx-auto mb-3"></div>
          <p className="text-sm text-custom opacity-70">Verifying payment...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center surface p-4">
        <div className="border border-custom rounded-neumorphism p-6 shadow-neumorphism surface max-w-sm w-full text-center">
          <div className="text-red-500 mb-3">
            <svg className="w-10 h-10 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-lg font-semibold text-custom mb-3">Verification Failed</h1>
          <p className="text-sm text-custom opacity-70 mb-4">{error}</p>
          <button
            onClick={() => window.location.href = '/'}
            className="accent text-white border border-custom rounded-neumorphism px-4 py-2 font-medium text-sm transition-all hover:shadow-lg"
          >
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center surface p-4">
      <div className="border border-custom rounded-neumorphism p-6 shadow-neumorphism surface max-w-lg w-full text-center">
        <div className="text-green-500 mb-4">
          <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>

        <h1 className="text-xl font-semibold text-custom mb-3">Payment Successful</h1>

        <p className="text-sm text-custom opacity-70 mb-4">
          Your subscription is now active and ready to use.
        </p>

        {subscription && (
          <div className="text-xs text-custom opacity-60 mb-4 space-y-1">
            <div>Plan: <span className="font-medium">{subscription.plan}</span></div>
            <div>Status: <span className="text-green-600">{subscription.status}</span></div>
            <div>Expires: <span className="font-medium">{new Date(subscription.current_period_end).toLocaleDateString()}</span></div>
          </div>
        )}

        <div className="space-y-3">
          <h2 className="text-lg font-medium text-custom">Download Paira Bot</h2>

          <div className="grid grid-cols-1 gap-3">
            <a
              href="#"
              className="accent text-white border border-custom rounded-neumorphism px-4 py-3 font-medium text-sm transition-all hover:shadow-lg flex items-center justify-center space-x-2"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
              <span>Download for Windows</span>
            </a>

            <a
              href="#"
              className="surface text-custom border border-custom rounded-neumorphism px-4 py-3 font-medium text-sm transition-all hover:accent hover:text-white flex items-center justify-center space-x-2"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l2-2a1 1 0 11-1.414 1.414L11 8.414V12a1 1 0 11-2 0V8.414L8.707 7.293z" clipRule="evenodd" />
              </svg>
              <span>Download for macOS</span>
            </a>
          </div>

          <p className="text-xs text-custom opacity-50 mt-3">
            Launch the app and sign in to activate your license.
          </p>
        </div>

        <div className="mt-6 pt-4 border-t border-custom">
          <button
            onClick={() => window.location.href = '/'}
            className="text-xs text-custom opacity-60 hover:text-custom"
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