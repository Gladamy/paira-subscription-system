'use client';

import { useState } from 'react';
import AuthModal from '@/components/AuthModal';

export default function Home() {
  const [showAuth, setShowAuth] = useState(false);

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
        borderBottom: '1px solid #F3F4F6',
        position: 'sticky',
        top: 0,
        zIndex: 50
      }}>
        <div style={{
          maxWidth: '80rem',
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
                color: '#111827',
                lineHeight: '2rem'
              }}>Paira</h1>
              <span style={{
                marginLeft: '0.5rem',
                fontSize: '0.875rem',
                color: '#6B7280'
              }}>Bot</span>
            </div>
            <button
              onClick={() => setShowAuth(true)}
              style={{
                backgroundColor: '#F9FAFB',
                border: '1px solid #E5E7EB',
                color: '#374151',
                borderRadius: '6px',
                padding: '0.5rem 1rem',
                fontSize: '0.875rem',
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#F3F4F6';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#F9FAFB';
              }}
            >
              Get Started
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main style={{ padding: '4rem 1rem', maxWidth: '80rem', margin: '0 auto' }}>
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
            onClick={() => setShowAuth(true)}
            style={{
              backgroundColor: '#6366F1',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '6px',
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
            Start Free Trial
          </button>
        </div>

        {/* Features Section */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '2rem',
          marginBottom: '4rem'
        }}>
          <div style={{
            padding: '2rem',
            backgroundColor: '#F9FAFB',
            border: '1px solid #F3F4F6'
          }}>
            <h3 style={{
              fontSize: '1.25rem',
              fontWeight: 600,
              color: '#111827',
              marginBottom: '1rem'
            }}>Advanced Trading Algorithms</h3>
            <p style={{ color: '#6B7280', lineHeight: '1.6' }}>
              Intelligent trade matching with RAP analysis, projected item filtering, and profit optimization.
            </p>
          </div>

          <div style={{
            padding: '2rem',
            backgroundColor: '#F9FAFB',
            border: '1px solid #F3F4F6'
          }}>
            <h3 style={{
              fontSize: '1.25rem',
              fontWeight: 600,
              color: '#111827',
              marginBottom: '1rem'
            }}>Real-Time Price Tracking</h3>
            <p style={{ color: '#6B7280', lineHeight: '1.6' }}>
              Live Rolimons API integration with cached pricing and automatic refresh cycles.
            </p>
          </div>

          <div style={{
            padding: '2rem',
            backgroundColor: '#F9FAFB',
            border: '1px solid #F3F4F6'
          }}>
            <h3 style={{
              fontSize: '1.25rem',
              fontWeight: 600,
              color: '#111827',
              marginBottom: '1rem'
            }}>Secure HWID Licensing</h3>
            <p style={{ color: '#6B7280', lineHeight: '1.6' }}>
              Device-specific licensing with automatic validation and subscription management.
            </p>
          </div>
        </div>

        {/* Pricing Section */}
        <div style={{
          backgroundColor: '#F9FAFB',
          border: '1px solid #F3F4F6',
          padding: '3rem 2rem',
          textAlign: 'center'
        }}>
          <h2 style={{
            fontSize: '2.25rem',
            fontWeight: 700,
            color: '#111827',
            marginBottom: '3rem'
          }}>Choose Your Plan</h2>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '2rem',
            marginBottom: '3rem',
            maxWidth: '800px',
            margin: '0 auto 3rem'
          }}>
            {/* Monthly Plan */}
            <div style={{
              backgroundColor: '#FFFFFF',
              border: '1px solid #E5E7EB',
              padding: '2rem',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#6366F1';
              e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#E5E7EB';
              e.currentTarget.style.boxShadow = 'none';
            }}
            onClick={() => setShowAuth(true)}
            >
              <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
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
                  fontSize: '0.875rem'
                }}>per month</div>
              </div>
              <ul style={{
                textAlign: 'left',
                listStyle: 'none',
                padding: 0,
                fontSize: '0.875rem',
                color: '#374151'
              }}>
                <li style={{ marginBottom: '0.5rem' }}>✓ Full bot functionality</li>
                <li style={{ marginBottom: '0.5rem' }}>✓ HWID-based licensing</li>
                <li style={{ marginBottom: '0.5rem' }}>✓ Priority support</li>
                <li>✓ Cancel anytime</li>
              </ul>
            </div>

            {/* Annual Plan */}
            <div style={{
              backgroundColor: '#FFFFFF',
              border: '2px solid #6366F1',
              padding: '2rem',
              position: 'relative',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = 'none';
            }}
            onClick={() => setShowAuth(true)}
            >
              <div style={{
                position: 'absolute',
                top: '-12px',
                left: '50%',
                transform: 'translateX(-50%)',
                backgroundColor: '#6366F1',
                color: '#FFFFFF',
                padding: '4px 12px',
                borderRadius: '12px',
                fontSize: '0.75rem',
                fontWeight: 600
              }}>Save 25%</div>
              <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
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
                  fontSize: '0.875rem'
                }}>per year</div>
              </div>
              <ul style={{
                textAlign: 'left',
                listStyle: 'none',
                padding: 0,
                fontSize: '0.875rem',
                color: '#374151'
              }}>
                <li style={{ marginBottom: '0.5rem' }}>✓ All Monthly features</li>
                <li style={{ marginBottom: '0.5rem' }}>✓ 2 months free</li>
                <li style={{ marginBottom: '0.5rem' }}>✓ Exclusive beta access</li>
                <li>✓ Premium support</li>
              </ul>
            </div>
          </div>

          <div style={{ textAlign: 'center' }}>
            <button
              onClick={() => setShowAuth(true)}
              style={{
                backgroundColor: '#6366F1',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '6px',
                padding: '0.875rem 2rem',
                fontSize: '1rem',
                fontWeight: 600,
                cursor: 'pointer',
                marginRight: '1rem',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#5855EB';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#6366F1';
              }}
            >
              Get Started
            </button>

            <button
              onClick={() => setShowAuth(true)}
              style={{
                backgroundColor: '#FFFFFF',
                color: '#374151',
                border: '1px solid #E5E7EB',
                borderRadius: '6px',
                padding: '0.875rem 2rem',
                fontSize: '1rem',
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#F9FAFB';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#FFFFFF';
              }}
            >
              Check Subscription Status
            </button>

            <p style={{
              fontSize: '0.875rem',
              color: '#6B7280',
              marginTop: '2rem'
            }}>
              Secure payment powered by Stripe • 30-day money-back guarantee
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer style={{
        backgroundColor: '#F9FAFB',
        borderTop: '1px solid #F3F4F6',
        padding: '3rem 0',
        marginTop: '4rem'
      }}>
        <div style={{
          maxWidth: '80rem',
          margin: '0 auto',
          padding: '0 1rem',
          textAlign: 'center'
        }}>
          <h3 style={{
            fontSize: '1.25rem',
            fontWeight: 600,
            color: '#111827',
            marginBottom: '1rem'
          }}>Ready to automate your trading?</h3>
          <p style={{
            color: '#6B7280',
            marginBottom: '2rem'
          }}>Join thousands of traders using Paira Bot</p>
          <button
            onClick={() => setShowAuth(true)}
            style={{
              backgroundColor: '#6366F1',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '6px',
              padding: '0.875rem 2rem',
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
            Start Free Trial
          </button>
          <div style={{
            marginTop: '2rem',
            paddingTop: '2rem',
            borderTop: '1px solid #E5E7EB',
            color: '#6B7280'
          }}>
            <p>&copy; 2025 Paira Bot. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Auth Modal */}
      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
    </div>
  );
}
