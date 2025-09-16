'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AuthModal from '@/components/AuthModal';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'https://api.paira.live';

// Stripe Price IDs - Update these with your actual Stripe price IDs
const STRIPE_PRICES = {
  monthly: process.env.NEXT_PUBLIC_STRIPE_PRICE_MONTHLY || 'price_0XXX', // Replace with your monthly price ID
  annual: process.env.NEXT_PUBLIC_STRIPE_PRICE_ANNUAL || 'price_1XXX'    // Replace with your annual price ID
};

export default function Home() {
  const router = useRouter();
  const [showAuth, setShowAuth] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('paira_auth_token');
    setIsLoggedIn(!!token);
  }, []);

  const handleStripeCheckout = async (priceId: string) => {
    try {
      const token = localStorage.getItem('paira_auth_token');
      if (!token) {
        setShowAuth(true);
        return;
      }

      const response = await fetch(`${API_BASE}/api/subscriptions/create-checkout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ priceId })
      });

      if (response.ok) {
        const data = await response.json();
        // Redirect to Stripe checkout
        window.location.href = data.url;
      } else if (response.status === 401) {
        // Token expired or invalid, show auth modal
        setShowAuth(true);
      } else {
        console.error('Failed to create checkout session');
        alert('Failed to start checkout process. Please try again.');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      alert('Network error. Please try again.');
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#FFFFFF',
      fontFamily: "'Inter', 'SF Pro', sans-serif",
      color: '#111827'
    }}>
      {/* Header */}
      <header style={{
        backgroundColor: '#FFFFFF',
        borderBottom: '1px solid #E5E7EB',
        position: 'sticky',
        top: 0,
        zIndex: 50
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0 1rem'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            height: '4rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <h1 style={{
                fontSize: '1.5rem',
                fontWeight: 600,
                color: '#111827'
              }}>Paira</h1>
              <span style={{
                marginLeft: '0.5rem',
                fontSize: '0.875rem',
                color: '#6B7280'
              }}>Bot</span>
            </div>
            <button
              onClick={isLoggedIn ? () => router.push('/dashboard') : () => setShowAuth(true)}
              style={{
                backgroundColor: 'transparent',
                border: '1px solid #E5E7EB',
                color: '#374151',
                padding: '0.5rem 1rem',
                fontSize: '0.875rem',
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#F9FAFB';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              {isLoggedIn ? 'Dashboard' : 'Get Started'}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main style={{ padding: '4rem 1rem', maxWidth: '1200px', margin: '0 auto' }}>
        {/* Hero Section */}
        <div style={{
          textAlign: 'center',
          padding: '4rem 0',
          marginBottom: '4rem'
        }}>
          <h1 style={{
            fontSize: '3.5rem',
            fontWeight: 700,
            color: '#111827',
            marginBottom: '1.5rem',
            lineHeight: '1.1'
          }}>
            Professional Roblox Trading Automation
          </h1>
          <p style={{
            fontSize: '1.25rem',
            color: '#6B7280',
            marginBottom: '2.5rem',
            maxWidth: '600px',
            margin: '0 auto 2.5rem',
            lineHeight: '1.6'
          }}>
            Automate your Roblox trading with advanced algorithms, real-time price tracking, and secure HWID-based licensing.
          </p>
          <button
            onClick={() => handleStripeCheckout(STRIPE_PRICES.annual)}
            style={{
              backgroundColor: '#6366F1',
              color: '#FFFFFF',
              border: 'none',
              padding: '1rem 2rem',
              fontSize: '1.125rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#5855EB';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#6366F1';
            }}
          >
            {isLoggedIn ? 'Go to Dashboard' : 'Start Free Trial'}
          </button>
        </div>

        {/* Features Section */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '2rem',
          marginBottom: '4rem'
        }}>
          <div style={{
            padding: '2rem',
            textAlign: 'center'
          }}>
            <h3 style={{
              fontSize: '1.25rem',
              fontWeight: 600,
              color: '#111827',
              marginBottom: '1rem'
            }}>Advanced Trading Algorithms</h3>
            <p style={{
              color: '#6B7280',
              lineHeight: '1.6'
            }}>
              Intelligent trade matching with RAP analysis, projected item filtering, and profit optimization.
            </p>
          </div>

          <div style={{
            padding: '2rem',
            textAlign: 'center'
          }}>
            <h3 style={{
              fontSize: '1.25rem',
              fontWeight: 600,
              color: '#111827',
              marginBottom: '1rem'
            }}>Real-Time Price Tracking</h3>
            <p style={{
              color: '#6B7280',
              lineHeight: '1.6'
            }}>
              Live Rolimons API integration with cached pricing and automatic refresh cycles.
            </p>
          </div>

          <div style={{
            padding: '2rem',
            textAlign: 'center'
          }}>
            <h3 style={{
              fontSize: '1.25rem',
              fontWeight: 600,
              color: '#111827',
              marginBottom: '1rem'
            }}>Secure HWID Licensing</h3>
            <p style={{
              color: '#6B7280',
              lineHeight: '1.6'
            }}>
              Device-specific licensing with automatic validation and subscription management.
            </p>
          </div>
        </div>

        {/* Pricing Section */}
        <div style={{
          backgroundColor: '#F9FAFB',
          border: '1px solid #E5E7EB',
          padding: '3rem 2rem',
          marginBottom: '4rem'
        }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h2 style={{
              fontSize: '2.25rem',
              fontWeight: 700,
              color: '#111827',
              marginBottom: '1rem'
            }}>Choose Your Plan</h2>
            <p style={{
              fontSize: '1rem',
              color: '#6B7280'
            }}>
              Start free, upgrade when you're ready
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '2rem',
            maxWidth: '800px',
            margin: '0 auto'
          }}>
            {/* Monthly Plan */}
            <div style={{
              backgroundColor: '#FFFFFF',
              border: '1px solid #E5E7EB',
              padding: '2rem',
              textAlign: 'center'
            }}>
              <h3 style={{
                fontSize: '1.25rem',
                fontWeight: 600,
                color: '#111827',
                marginBottom: '1rem'
              }}>Monthly</h3>
              <div style={{
                fontSize: '2.5rem',
                fontWeight: 700,
                color: '#6366F1',
                marginBottom: '0.5rem'
              }}>$0.60</div>
              <div style={{
                color: '#6B7280',
                fontSize: '0.875rem',
                marginBottom: '2rem'
              }}>per month</div>
              <ul style={{
                textAlign: 'left',
                listStyle: 'none',
                padding: 0,
                marginBottom: '2rem',
                fontSize: '0.875rem',
                color: '#374151'
              }}>
                <li style={{ marginBottom: '0.5rem' }}>✓ Full bot functionality</li>
                <li style={{ marginBottom: '0.5rem' }}>✓ HWID-based licensing</li>
                <li style={{ marginBottom: '0.5rem' }}>✓ Priority support</li>
                <li>✓ Cancel anytime</li>
              </ul>
              <button
                onClick={() => handleStripeCheckout(STRIPE_PRICES.monthly)}
                style={{
                  width: '100%',
                  backgroundColor: '#6366F1',
                  color: '#FFFFFF',
                  border: 'none',
                  padding: '1rem',
                  fontSize: '1rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#5855EB';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#6366F1';
                }}
              >
                Select Monthly
              </button>
            </div>

            {/* Annual Plan */}
            <div style={{
              backgroundColor: '#FFFFFF',
              border: '2px solid #6366F1',
              padding: '2rem',
              textAlign: 'center',
              position: 'relative'
            }}>
              <div style={{
                position: 'absolute',
                top: '-10px',
                left: '50%',
                transform: 'translateX(-50%)',
                backgroundColor: '#10B981',
                color: '#FFFFFF',
                padding: '2px 8px',
                fontSize: '0.75rem',
                fontWeight: 600
              }}>Save 25%</div>
              <h3 style={{
                fontSize: '1.25rem',
                fontWeight: 600,
                color: '#111827',
                marginBottom: '1rem'
              }}>Annual</h3>
              <div style={{
                fontSize: '2.5rem',
                fontWeight: 700,
                color: '#6366F1',
                marginBottom: '0.5rem'
              }}>$54.99</div>
              <div style={{
                color: '#6B7280',
                fontSize: '0.875rem',
                marginBottom: '2rem'
              }}>per year</div>
              <ul style={{
                textAlign: 'left',
                listStyle: 'none',
                padding: 0,
                marginBottom: '2rem',
                fontSize: '0.875rem',
                color: '#374151'
              }}>
                <li style={{ marginBottom: '0.5rem' }}>✓ All Monthly features</li>
                <li style={{ marginBottom: '0.5rem' }}>✓ 2 months free</li>
                <li style={{ marginBottom: '0.5rem' }}>✓ Exclusive beta access</li>
                <li>✓ Premium support</li>
              </ul>
              <button
                onClick={() => handleStripeCheckout(STRIPE_PRICES.annual)}
                style={{
                  width: '100%',
                  backgroundColor: '#6366F1',
                  color: '#FFFFFF',
                  border: 'none',
                  padding: '1rem',
                  fontSize: '1rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#5855EB';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#6366F1';
                }}
              >
                Select Annual
              </button>
            </div>
          </div>

          <div style={{
            textAlign: 'center',
            marginTop: '3rem',
            paddingTop: '2rem',
            borderTop: '1px solid #E5E7EB'
          }}>
            <p style={{
              fontSize: '0.875rem',
              color: '#6B7280'
            }}>
              Secure payments powered by Stripe • 30-day money-back guarantee
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer style={{
        backgroundColor: '#F9FAFB',
        borderTop: '1px solid #E5E7EB',
        padding: '2rem 0'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0 1rem',
          textAlign: 'center'
        }}>
          <p style={{
            color: '#6B7280',
            fontSize: '0.875rem'
          }}>
            © 2025 Paira Bot. All rights reserved.
          </p>
        </div>
      </footer>

      {/* Auth Modal */}
      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
    </div>
  );
}
