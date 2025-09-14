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
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6 py-12">
      <div className="w-full max-w-md mx-auto text-center">

        {/* Success Checkmark */}
        <div className="mb-8">
          <svg className="w-20 h-20 mx-auto text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>

        {/* Main Title */}
        <h1 className="text-3xl font-bold text-gray-900 mb-3" style={{ fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif' }}>
          Payment Successful
        </h1>

        {/* Subtitle */}
        <p className="text-lg text-gray-600 mb-8 leading-relaxed" style={{ fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif' }}>
          Your subscription is now active and ready to use.
        </p>

        {/* Clean Subscription Details - No UI Container */}
        {subscription && (
          <div className="mb-10 space-y-2" style={{ fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif' }}>
            <div className="text-sm text-gray-500">
              Plan: <span className="font-semibold text-gray-800">{subscription.plan}</span>
            </div>
            <div className="text-sm text-gray-500">
              Status: <span className="font-semibold text-green-600">{subscription.status}</span>
            </div>
            <div className="text-sm text-gray-500">
              Expires: <span className="font-semibold text-gray-800">{new Date(subscription.current_period_end).toLocaleDateString()}</span>
            </div>
          </div>
        )}

        {/* Download Section */}
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-gray-900" style={{ fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif' }}>
            Download Paira Bot
          </h2>

          <div className="space-y-3">
            <a
              href="/paira-bot-setup.exe"
              download="paira-bot-setup.exe"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-4 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-3 shadow-sm"
              style={{ fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif' }}
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
              <span>Download for Windows</span>
            </a>

            <a
              href="#"
              className="w-full bg-gray-600 hover:bg-gray-700 text-white font-medium py-4 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-3 shadow-sm"
              style={{ fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif' }}
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l2-2a1 1 0 11-1.414 1.414L11 8.414V12a1 1 0 11-2 0V8.414L8.707 7.293z" clipRule="evenodd" />
              </svg>
              <span>Download for macOS</span>
            </a>
          </div>

          <p className="text-sm text-gray-500 mt-6" style={{ fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif' }}>
            Launch the app and sign in to activate your license.
          </p>
        </div>

        {/* Clean Back Link */}
        <div className="mt-12">
          <button
            onClick={() => window.location.href = '/'}
            className="text-sm text-gray-400 hover:text-gray-600 transition-colors duration-200"
            style={{ fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif' }}
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