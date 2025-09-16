'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AuthModal from '@/components/AuthModal';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'https://api.paira.live';

const STRIPE_PRICES = {
  monthly: process.env.NEXT_PUBLIC_STRIPE_PRICE_MONTHLY || 'price_0XXX',
  annual: process.env.NEXT_PUBLIC_STRIPE_PRICE_ANNUAL || 'price_1XXX'
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
        window.location.href = data.url;
      } else if (response.status === 401) {
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
      background: 'linear-gradient(135deg, #FAFAFA 0%, #F5F5F5 100%)',
      fontFamily: "'Inter', 'SF Pro Display', system-ui, sans-serif",
      color: '#0F172A'
    }}>
      {/* Header */}
      <header style={{
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid rgba(15, 23, 42, 0.1)',
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
                fontWeight: 700,
                color: '#0F172A',
                letterSpacing: '-0.025em'
              }}>Paira</h1>
              <span style={{
                marginLeft: '0.5rem',
                fontSize: '0.875rem',
                color: '#475569',
                fontWeight: 500
              }}>Bot</span>
            </div>
            <button
              onClick={isLoggedIn ? () => router.push('/dashboard') : () => setShowAuth(true)}
              style={{
                backgroundColor: 'transparent',
                border: '1px solid rgba(15, 23, 42, 0.2)',
                color: '#0F172A',
                padding: '0.5rem 1rem',
                fontSize: '0.875rem',
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'all 0.2s',
                borderRadius: '0.375rem'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(15, 23, 42, 0.05)';
                e.currentTarget.style.borderColor = 'rgba(15, 23, 42, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.borderColor = 'rgba(15, 23, 42, 0.2)';
              }}
            >
              {isLoggedIn ? 'Dashboard' : 'Get Started'}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main style={{ padding: '4rem 1rem', maxWidth: '1200px', margin: '0 auto' }}>
        {/* Hero Section - Ultra Clean */}
        <div style={{
          textAlign: 'center',
          padding: '4rem 0',
          marginBottom: '4rem'
        }}>
          <h1 style={{
            fontSize: '3.5rem',
            fontWeight: 800,
            color: '#0F172A',
            marginBottom: '1.5rem',
            lineHeight: '1.05',
            letterSpacing: '-0.025em',
            fontFamily: "'Inter', 'SF Pro Display', system-ui, sans-serif"
          }}>
            Professional Roblox Trading Automation
          </h1>
          <p style={{
            fontSize: '1.25rem',
            color: '#475569',
            marginBottom: '2.5rem',
            maxWidth: '600px',
            margin: '0 auto 2.5rem',
            lineHeight: '1.6',
            fontWeight: '400',
            fontFamily: "'Inter', 'SF Pro Text', system-ui, sans-serif"
          }}>
            Automate your Roblox trading with advanced algorithms, real-time price tracking, and secure HWID-based licensing.
          </p>
          <button
            onClick={() => handleStripeCheckout(STRIPE_PRICES.annual)}
            style={{
              backgroundColor: '#7C3AED',
              color: '#FFFFFF',
              border: 'none',
              padding: '1rem 2rem',
              fontSize: '1.125rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s',
              borderRadius: '0.5rem',
              fontFamily: "'Inter', 'SF Pro Text', system-ui, sans-serif",
              letterSpacing: '0.025em'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#6D28D9';
              e.currentTarget.style.transform = 'translateY(-1px)';
              e.currentTarget.style.boxShadow = '0 10px 25px rgba(124, 58, 237, 0.3)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#7C3AED';
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            {isLoggedIn ? 'Go to Dashboard' : 'Start Free Trial'}
          </button>
        </div>

        {/* Features - Clean Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '3rem',
          marginBottom: '4rem'
        }}>
          <div style={{ textAlign: 'center' }}>
            <h3 style={{
              fontSize: '1.25rem',
              fontWeight: 600,
              color: '#0F172A',
              marginBottom: '1rem',
              fontFamily: "'Inter', 'SF Pro Display', system-ui, sans-serif"
            }}>Advanced Trading Algorithms</h3>
            <p style={{
              color: '#475569',
              lineHeight: '1.6',
              fontFamily: "'Inter', 'SF Pro Text', system-ui, sans-serif"
            }}>
              Intelligent trade matching with RAP analysis, projected item filtering, and profit optimization.
            </p>
          </div>

          <div style={{ textAlign: 'center' }}>
            <h3 style={{
              fontSize: '1.25rem',
              fontWeight: 600,
              color: '#0F172A',
              marginBottom: '1rem',
              fontFamily: "'Inter', 'SF Pro Display', system-ui, sans-serif"
            }}>Real-Time Price Tracking</h3>
            <p style={{
              color: '#475569',
              lineHeight: '1.6',
              fontFamily: "'Inter', 'SF Pro Text', system-ui, sans-serif"
            }}>
              Live Rolimons API integration with cached pricing and automatic refresh cycles.
            </p>
          </div>

          <div style={{ textAlign: 'center' }}>
            <h3 style={{
              fontSize: '1.25rem',
              fontWeight: 600,
              color: '#0F172A',
              marginBottom: '1rem',
              fontFamily: "'Inter', 'SF Pro Display', system-ui, sans-serif"
            }}>Secure HWID Licensing</h3>
            <p style={{
              color: '#475569',
              lineHeight: '1.6',
              fontFamily: "'Inter', 'SF Pro Text', system-ui, sans-serif"
            }}>
              Device-specific licensing with automatic validation and subscription management.
            </p>
          </div>
        </div>

        {/* Pricing - Minimal */}
        <div style={{
          backgroundColor: '#F9FAFB',
          padding: '3rem 2rem',
          textAlign: 'center'
        }}>
          <h2 style={{
            fontSize: '2rem',
            fontWeight: 700,
            color: '#0F172A',
            marginBottom: '2rem',
            fontFamily: "'Inter', 'SF Pro Display', system-ui, sans-serif"
          }}>Choose Your Plan</h2>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '2rem',
            maxWidth: '700px',
            margin: '0 auto'
          }}>
            {/* Monthly Plan */}
            <div style={{
              backgroundColor: '#FFFFFF',
              padding: '2rem',
              textAlign: 'center'
            }}>
              <h3 style={{
                fontSize: '1.25rem',
                fontWeight: 600,
                color: '#0F172A',
                marginBottom: '1rem',
                fontFamily: "'Inter', 'SF Pro Display', system-ui, sans-serif"
              }}>Monthly</h3>
              <div style={{
                fontSize: '2.5rem',
                fontWeight: 700,
                color: '#7C3AED',
                marginBottom: '0.5rem',
                fontFamily: "'Inter', 'SF Pro Display', system-ui, sans-serif"
              }}>$0.60</div>
              <div style={{
                color: '#475569',
                fontSize: '0.875rem',
                marginBottom: '2rem',
                fontFamily: "'Inter', 'SF Pro Text', system-ui, sans-serif"
              }}>per month</div>
              <button
                onClick={() => handleStripeCheckout(STRIPE_PRICES.monthly)}
                style={{
                  width: '100%',
                  backgroundColor: '#7C3AED',
                  color: '#FFFFFF',
                  border: 'none',
                  padding: '1rem',
                  fontSize: '1rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  borderRadius: '0.375rem',
                  fontFamily: "'Inter', 'SF Pro Text', system-ui, sans-serif"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#6D28D9';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#7C3AED';
                }}
              >
                Select Monthly
              </button>
            </div>

            {/* Annual Plan */}
            <div style={{
              backgroundColor: '#FFFFFF',
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
                color: '#0F172A',
                marginBottom: '1rem',
                fontFamily: "'Inter', 'SF Pro Display', system-ui, sans-serif"
              }}>Annual</h3>
              <div style={{
                fontSize: '2.5rem',
                fontWeight: 700,
                color: '#7C3AED',
                marginBottom: '0.5rem',
                fontFamily: "'Inter', 'SF Pro Display', system-ui, sans-serif"
              }}>$54.99</div>
              <div style={{
                color: '#475569',
                fontSize: '0.875rem',
                marginBottom: '2rem',
                fontFamily: "'Inter', 'SF Pro Text', system-ui, sans-serif"
              }}>per year</div>
              <button
                onClick={() => handleStripeCheckout(STRIPE_PRICES.annual)}
                style={{
                  width: '100%',
                  backgroundColor: '#7C3AED',
                  color: '#FFFFFF',
                  border: 'none',
                  padding: '1rem',
                  fontSize: '1rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  borderRadius: '0.375rem',
                  fontFamily: "'Inter', 'SF Pro Text', system-ui, sans-serif"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#6D28D9';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#7C3AED';
                }}
              >
                Select Annual
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer style={{
        backgroundColor: '#F9FAFB',
        borderTop: '1px solid #E5E7EB',
        padding: '2rem 0',
        marginTop: '4rem'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0 1rem',
          textAlign: 'center'
        }}>
          <p style={{
            color: '#475569',
            fontSize: '0.875rem',
            fontFamily: "'Inter', 'SF Pro Text', system-ui, sans-serif"
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
