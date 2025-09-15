'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'https://api.paira.live';

interface User {
  id: string;
  email: string;
  created_at?: string;
}

interface Subscription {
  id: string;
  plan: string;
  status: string;
  current_period_start: string;
  current_period_end: string;
}

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('paira_auth_token');
    if (!token) {
      router.push('/');
      return;
    }

    fetchUserData();
  }, [router]);

  const fetchUserData = async () => {
    const token = localStorage.getItem('paira_auth_token');
    if (!token) return;

    try {
      // Fetch user profile
      const profileResponse = await fetch(`${API_BASE}/api/user/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (profileResponse.ok) {
        const profileData = await profileResponse.json();
        setUser(profileData.user);
      }

      // Fetch subscription status
      const subResponse = await fetch(`${API_BASE}/api/subscriptions/status`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (subResponse.ok) {
        const subData = await subResponse.json();
        setSubscription(subData.subscription);
      }
    } catch (err) {
      setError('Failed to load dashboard data');
      console.error('Dashboard fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('paira_auth_token');
    router.push('/');
  };

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: '#FFFFFF',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: "'Inter', 'SF Pro', sans-serif"
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '3rem',
            height: '3rem',
            border: '2px solid #E5E7EB',
            borderTop: '2px solid #6366F1',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 1rem'
          }}></div>
          <p style={{ color: '#6B7280' }}>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: '#FFFFFF',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: "'Inter', 'SF Pro', sans-serif",
        padding: '1rem'
      }}>
        <div style={{
          backgroundColor: '#FEF2F2',
          border: '1px solid #FECACA',
          padding: '2rem',
          borderRadius: '6px',
          textAlign: 'center',
          maxWidth: '28rem'
        }}>
          <h2 style={{ color: '#DC2626', fontWeight: 600, marginBottom: '0.5rem' }}>Error</h2>
          <p style={{ color: '#B91C1C', marginBottom: '1rem' }}>{error}</p>
          <button
            onClick={() => router.push('/')}
            style={{
              backgroundColor: '#DC2626',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '6px',
              padding: '0.5rem 1rem',
              fontSize: '0.875rem',
              fontWeight: 500,
              cursor: 'pointer'
            }}
          >
            Return to Home
          </button>
        </div>
      </div>
    );
  }

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
              }}>Dashboard</span>
            </div>
            <button
              onClick={handleLogout}
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
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main style={{ padding: '2rem 1rem', maxWidth: '80rem', margin: '0 auto' }}>
        {/* Welcome Section */}
        <div style={{
          backgroundColor: '#F9FAFB',
          border: '1px solid #F3F4F6',
          padding: '2rem',
          borderRadius: '8px',
          marginBottom: '2rem'
        }}>
          <h2 style={{
            fontSize: '1.875rem',
            fontWeight: 700,
            color: '#111827',
            marginBottom: '0.5rem'
          }}>
            Welcome back, {user?.email}!
          </h2>
          <p style={{ color: '#6B7280' }}>
            Manage your subscription and download the latest version of Paira Bot.
          </p>
        </div>

        {/* Subscription Status */}
        <div style={{
          backgroundColor: '#FFFFFF',
          border: '1px solid #E5E7EB',
          padding: '2rem',
          borderRadius: '8px',
          marginBottom: '2rem'
        }}>
          <h3 style={{
            fontSize: '1.25rem',
            fontWeight: 600,
            color: '#111827',
            marginBottom: '1rem'
          }}>
            Subscription Status
          </h3>

          {subscription ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
              <div>
                <p style={{ fontSize: '0.875rem', color: '#6B7280', marginBottom: '0.25rem' }}>Plan</p>
                <p style={{ fontWeight: 600, color: '#111827' }}>{subscription.plan}</p>
              </div>
              <div>
                <p style={{ fontSize: '0.875rem', color: '#6B7280', marginBottom: '0.25rem' }}>Status</p>
                <span style={{
                  padding: '0.25rem 0.5rem',
                  borderRadius: '4px',
                  fontSize: '0.75rem',
                  fontWeight: 500,
                  backgroundColor: subscription.status === 'active' ? '#D1FAE5' : '#FEF3C7',
                  color: subscription.status === 'active' ? '#065F46' : '#92400E'
                }}>
                  {subscription.status}
                </span>
              </div>
              <div>
                <p style={{ fontSize: '0.875rem', color: '#6B7280', marginBottom: '0.25rem' }}>Expires</p>
                <p style={{ fontWeight: 600, color: '#111827' }}>
                  {new Date(subscription.current_period_end).toLocaleDateString()}
                </p>
              </div>
            </div>
          ) : (
            <div style={{
              backgroundColor: '#FEF2F2',
              border: '1px solid #FECACA',
              padding: '1rem',
              borderRadius: '6px'
            }}>
              <p style={{ color: '#B91C1C', marginBottom: '1rem' }}>
                No active subscription found.
              </p>
              <button
                onClick={() => router.push('/#pricing')}
                style={{
                  backgroundColor: '#DC2626',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '0.5rem 1rem',
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  cursor: 'pointer'
                }}
              >
                Subscribe Now
              </button>
            </div>
          )}
        </div>

        {/* Download Section */}
        {subscription?.status === 'active' && (
          <div style={{
            backgroundColor: '#FFFFFF',
            border: '1px solid #E5E7EB',
            padding: '2rem',
            borderRadius: '8px'
          }}>
            <h3 style={{
              fontSize: '1.25rem',
              fontWeight: 600,
              color: '#111827',
              marginBottom: '1rem'
            }}>
              Download Paira Bot
            </h3>
            <p style={{ color: '#6B7280', marginBottom: '1.5rem' }}>
              Get the latest version of Paira Bot Desktop App.
            </p>

            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <a
                href="/paira-bot-setup.msi"
                download="paira-bot-setup.msi"
                style={{
                  backgroundColor: '#0284C7',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '1rem 2rem',
                  fontSize: '1rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#0369A1';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#0284C7';
                }}
              >
                <span>⬇️</span>
                Download for Windows
              </a>
              <button
                onClick={() => window.open('https://paira.live/download', '_blank')}
                style={{
                  backgroundColor: '#FFFFFF',
                  color: '#374151',
                  border: '1px solid #D1D5DB',
                  borderRadius: '6px',
                  padding: '1rem 2rem',
                  fontSize: '1rem',
                  fontWeight: 600,
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
                Other Platforms
              </button>
            </div>

            <p style={{
              fontSize: '0.875rem',
              color: '#6B7280',
              marginTop: '1rem'
            }}>
              Windows 10/11 • MSI Installer • ~50MB download
            </p>
          </div>
        )}
      </main>
    </div>
  );
}