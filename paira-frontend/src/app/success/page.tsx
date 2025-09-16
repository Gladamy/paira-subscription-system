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
            onClick={() => window.location.href = '/dashboard'}
            className="accent text-white border border-custom rounded-neumorphism px-4 py-2 font-medium text-sm transition-all hover:shadow-lg"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #F8FAFC 0%, #F1F5F9 50%, #E2E8F0 100%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '3rem 1.5rem',
      fontFamily: "'Inter', 'SF Pro', sans-serif",
      color: '#111827'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '28rem',
        margin: '0 auto',
        textAlign: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.6)',
        backdropFilter: 'blur(12px)',
        border: '1px solid rgba(229, 231, 235, 0.3)',
        borderRadius: '1rem',
        padding: '2rem',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)'
      }}>

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
        <div style={{ marginTop: '2rem' }}>
          <h2 style={{
            fontSize: '1.25rem',
            fontWeight: '600',
            color: '#111827',
            marginBottom: '1.5rem',
            fontFamily: "'Inter', 'SF Pro', sans-serif"
          }}>
            Download Paira Bot
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <a
              href="/paira-bot-setup.msi"
              download="paira-bot-setup.msi"
              style={{
                width: '100%',
                backgroundColor: 'rgba(37, 99, 235, 0.8)',
                backdropFilter: 'blur(8px)',
                color: '#FFFFFF',
                border: '1px solid rgba(37, 99, 235, 0.3)',
                borderRadius: '0.5rem',
                padding: '1rem 1.5rem',
                fontSize: '1rem',
                fontWeight: '500',
                cursor: 'pointer',
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.75rem',
                transition: 'all 0.2s',
                fontFamily: "'Inter', 'SF Pro', sans-serif",
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(29, 78, 216, 0.8)';
                e.currentTarget.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(37, 99, 235, 0.8)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <span style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>↓</span>
              <span>Download for Windows</span>
            </a>

            <button
              style={{
                width: '100%',
                backgroundColor: 'rgba(107, 114, 128, 0.6)',
                backdropFilter: 'blur(8px)',
                color: '#FFFFFF',
                border: '1px solid rgba(107, 114, 128, 0.3)',
                borderRadius: '0.5rem',
                padding: '1rem 1.5rem',
                fontSize: '1rem',
                fontWeight: '500',
                cursor: 'not-allowed',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.75rem',
                fontFamily: "'Inter', 'SF Pro', sans-serif",
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
                opacity: 0.6
              }}
            >
              <span style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>M</span>
              <span>Download for macOS</span>
            </button>
          </div>

          <p className="text-sm text-gray-500 mt-6" style={{ fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif' }}>
            Launch the app and sign in to activate your license.
          </p>
        </div>

        {/* Clean Back Link */}
        <div style={{ marginTop: '3rem' }}>
          <button
            onClick={() => window.location.href = '/dashboard'}
            style={{
              fontSize: '0.875rem',
              color: '#6B7280',
              backgroundColor: 'transparent',
              border: 'none',
              cursor: 'pointer',
              transition: 'color 0.2s',
              fontFamily: "'Inter', 'SF Pro', sans-serif",
              padding: '0.5rem 1rem',
              borderRadius: '0.5rem'
            }}
            onMouseEnter={(e) => e.currentTarget.style.color = '#374151'}
            onMouseLeave={(e) => e.currentTarget.style.color = '#6B7280'}
          >
            ← Go to Dashboard
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