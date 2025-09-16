'use client';

// Dashboard component for user account management
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'https://api.paira.live';

interface UserProfile {
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

// Header Component
const Header = ({ user, onLogout }: { user: UserProfile | null; onLogout: () => void }) => {
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);

  return (
    <div style={{
      backgroundColor: 'rgba(255, 255, 255, 0.8)',
      backdropFilter: 'blur(8px)',
      borderBottom: '1px solid rgba(229, 231, 235, 0.6)',
      padding: '1.25rem 2rem',
      position: 'sticky',
      top: 0,
      zIndex: 50
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        maxWidth: '80rem',
        margin: '0 auto'
      }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div style={{
            width: '2.25rem',
            height: '2.25rem',
            backgroundColor: '#2563EB',
            borderRadius: '0.75rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: '1rem',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
          }}>
            <span style={{ color: '#FFFFFF', fontWeight: 'bold', fontSize: '0.875rem' }}>P</span>
          </div>
          <span style={{
            fontSize: '1.25rem',
            fontWeight: 'bold',
            color: '#111827',
            letterSpacing: '-0.025em'
          }}>Paira Bot</span>
        </div>

        {/* Profile Dropdown */}
        <div style={{ position: 'relative' }}>
          <button
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              padding: '0.75rem',
              borderRadius: '0.75rem',
              transition: 'all 0.2s',
              border: 'none',
              backgroundColor: 'transparent',
              cursor: 'pointer'
            }}
            onMouseEnter={() => setShowProfileDropdown(true)}
            onMouseLeave={() => setShowProfileDropdown(false)}
            onClick={() => setShowProfileDropdown(!showProfileDropdown)}
          >
            <div style={{
              width: '2.25rem',
              height: '2.25rem',
              backgroundColor: '#F3F4F6',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <span style={{ fontSize: '1.125rem' }}>👤</span>
            </div>
            <span style={{
              fontSize: '0.875rem',
              fontWeight: '600',
              color: '#374151'
            }}>{user?.email}</span>
            <span style={{
              fontSize: '0.75rem',
              color: '#9CA3AF',
              transition: 'transform 0.2s'
            }}>▼</span>
          </button>

          {showProfileDropdown && (
            <div
              style={{
                position: 'absolute',
                right: 0,
                top: '100%',
                marginTop: '0.75rem',
                width: '16rem',
                backgroundColor: '#FFFFFF',
                borderRadius: '1rem',
                boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
                border: '1px solid rgba(229, 231, 235, 0.6)',
                padding: '0.75rem 0',
                zIndex: 50
              }}
              onMouseEnter={() => setShowProfileDropdown(true)}
              onMouseLeave={() => setShowProfileDropdown(false)}
            >
              <div style={{
                padding: '0.75rem 1.25rem',
                borderBottom: '1px solid #F3F4F6'
              }}>
                <p style={{
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  color: '#111827'
                }}>{user?.email}</p>
                <p style={{
                  fontSize: '0.75rem',
                  color: '#6B7280',
                  fontWeight: '500'
                }}>Monthly Plan</p>
              </div>
              <button
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  padding: '0.75rem 1.25rem',
                  fontSize: '0.875rem',
                  color: '#374151',
                  backgroundColor: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F9FAFB'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <span style={{ marginRight: '0.75rem' }}>⚙️</span>
                Account Settings
              </button>
              <button
                onClick={onLogout}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  padding: '0.75rem 1.25rem',
                  fontSize: '0.875rem',
                  color: '#DC2626',
                  backgroundColor: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#FEF2F2'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <span style={{ marginRight: '0.75rem' }}>🚪</span>
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Main Dashboard Component
export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
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
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-3"></div>
          <p className="text-sm text-slate-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="border border-red-200 rounded-xl p-6 shadow-sm bg-white max-w-sm w-full text-center">
          <div className="text-red-500 mb-3">
            <svg className="w-10 h-10 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-lg font-semibold text-slate-900 mb-3">Error</h1>
          <p className="text-sm text-slate-600 mb-4">{error}</p>
          <button
            onClick={() => router.push('/')}
            className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
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
      backgroundColor: '#F8FAFC',
      fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      <Header user={user} onLogout={handleLogout} />

      <div style={{ maxWidth: '80rem', margin: '0 auto', padding: '2rem' }}>
        {/* Welcome Section */}
        <div style={{
          backgroundColor: 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(8px)',
          border: '1px solid rgba(229, 231, 235, 0.6)',
          borderRadius: '1rem',
          padding: '2rem',
          marginBottom: '2rem',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start'
          }}>
            <div>
              <h1 style={{
                fontSize: '1.875rem',
                fontWeight: '600',
                color: '#1F2937',
                marginBottom: '0.5rem'
              }}>
                Welcome back!
              </h1>
              <p style={{
                fontSize: '1.125rem',
                color: '#6B7280',
                marginBottom: '1rem'
              }}>{user?.email}</p>
              <p style={{
                color: '#6B7280',
                maxWidth: '32rem',
                lineHeight: '1.6'
              }}>
                Manage your subscription and download the latest version of Paira Bot.
              </p>
            </div>
          </div>
        </div>

        {/* Subscription Status */}
        <div style={{
          backgroundColor: 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(8px)',
          border: '1px solid rgba(229, 231, 235, 0.6)',
          borderRadius: '1rem',
          padding: '2rem',
          marginBottom: '2rem',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)'
        }}>
          <h2 style={{
            fontSize: '1.5rem',
            fontWeight: '600',
            color: '#1F2937',
            marginBottom: '1.5rem'
          }}>Subscription Status</h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1.5rem'
          }}>
            <div>
              <p style={{
                fontSize: '0.875rem',
                color: '#6B7280',
                marginBottom: '0.5rem'
              }}>Status</p>
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                padding: '0.25rem 0.75rem',
                borderRadius: '0.5rem',
                fontSize: '0.75rem',
                fontWeight: '600',
                backgroundColor: subscription?.status === 'active' ? '#D1FAE5' : '#FEF3C7',
                color: subscription?.status === 'active' ? '#065F46' : '#92400E'
              }}>
                <span style={{ marginRight: '0.25rem' }}>✓</span>
                {subscription?.status === 'active' ? 'Active' : 'Inactive'}
              </span>
            </div>
            <div>
              <p style={{
                fontSize: '0.875rem',
                color: '#6B7280',
                marginBottom: '0.5rem'
              }}>Current Plan</p>
              <p style={{
                fontSize: '1.125rem',
                fontWeight: '600',
                color: '#1F2937'
              }}>{subscription?.plan || 'N/A'}</p>
            </div>
            <div>
              <p style={{
                fontSize: '0.875rem',
                color: '#6B7280',
                marginBottom: '0.5rem'
              }}>Expires On</p>
              <p style={{
                fontSize: '1.125rem',
                fontWeight: '600',
                color: '#1F2937'
              }}>
                {subscription?.current_period_end
                  ? new Date(subscription.current_period_end).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })
                  : 'N/A'
                }
              </p>
            </div>
          </div>
        </div>

        {/* Download Section */}
        {subscription?.status === 'active' ? (
          <div style={{
            backgroundColor: 'rgba(255, 255, 255, 0.8)',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(229, 231, 235, 0.6)',
            borderRadius: '1rem',
            padding: '2rem',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)'
          }}>
            <div style={{ marginBottom: '1.5rem' }}>
              <h2 style={{
                fontSize: '1.5rem',
                fontWeight: '600',
                color: '#1F2937',
                marginBottom: '0.5rem'
              }}>Download Paira Bot</h2>
              <p style={{ color: '#6B7280' }}>Get the latest version of Paira Bot Desktop App.</p>
            </div>

            {/* Windows Download */}
            <div style={{
              background: 'linear-gradient(135deg, #F8FAFC 0%, #F1F5F9 100%)',
              border: '1px solid #E2E8F0',
              borderRadius: '0.75rem',
              padding: '1.5rem',
              marginBottom: '1.5rem'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{
                    width: '3rem',
                    height: '3rem',
                    backgroundColor: '#2563EB',
                    borderRadius: '0.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <span style={{ fontSize: '1.25rem', color: '#FFFFFF' }}>🪟</span>
                  </div>
                  <div>
                    <h3 style={{
                      fontSize: '1.125rem',
                      fontWeight: '600',
                      color: '#1F2937'
                    }}>Download for Windows</h3>
                    <p style={{
                      fontSize: '0.875rem',
                      color: '#6B7280'
                    }}>Windows 10/11</p>
                    <p style={{
                      fontSize: '0.75rem',
                      color: '#9CA3AF',
                      marginTop: '0.25rem'
                    }}>MSI Installer • ~70MB download</p>
                  </div>
                </div>
                <a
                  href="/paira-bot-setup.msi"
                  download="paira-bot-setup.msi"
                  style={{
                    backgroundColor: '#2563EB',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: '0.5rem',
                    padding: '0.75rem 1.5rem',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    textDecoration: 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    transition: 'background-color 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#1D4ED8'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#2563EB'}
                >
                  <span>⬇️</span>
                  Download Now
                </a>
              </div>
            </div>

            {/* Other Platforms */}
            <div>
              <h3 style={{
                fontSize: '1.125rem',
                fontWeight: '500',
                color: '#1F2937',
                marginBottom: '1rem'
              }}>Other Platforms</h3>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                gap: '1rem'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '1rem',
                  background: 'linear-gradient(135deg, #F8FAFC 0%, #F1F5F9 100%)',
                  border: '1px solid #E2E8F0',
                  borderRadius: '0.5rem',
                  opacity: 0.6
                }}>
                  <span style={{ fontSize: '1.25rem' }}>📱</span>
                  <div>
                    <p style={{
                      fontSize: '0.875rem',
                      fontWeight: '500',
                      color: '#1F2937'
                    }}>macOS, Linux, Mobile</p>
                    <p style={{
                      fontSize: '0.75rem',
                      color: '#6B7280'
                    }}>Coming soon</p>
                  </div>
                </div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '1rem'
                }}>
                  <button
                    style={{
                      backgroundColor: '#F3F4F6',
                      color: '#6B7280',
                      border: '1px solid #D1D5DB',
                      borderRadius: '0.5rem',
                      padding: '0.75rem 1.5rem',
                      fontSize: '0.875rem',
                      fontWeight: '600',
                      cursor: 'not-allowed',
                      opacity: 0.6
                    }}
                    disabled
                  >
                    View Options
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div style={{
            backgroundColor: 'rgba(255, 255, 255, 0.8)',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(229, 231, 235, 0.6)',
            borderRadius: '1rem',
            padding: '2rem',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
            textAlign: 'center'
          }}>
            <div style={{
              width: '5rem',
              height: '5rem',
              backgroundColor: '#FEF2F2',
              borderRadius: '1rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.5rem'
            }}>
              <span style={{ fontSize: '2rem' }}>⚠️</span>
            </div>
            <h2 style={{
              fontSize: '1.5rem',
              fontWeight: 'bold',
              color: '#1F2937',
              marginBottom: '0.75rem'
            }}>No Active Subscription</h2>
            <p style={{
              color: '#6B7280',
              marginBottom: '2rem',
              maxWidth: '28rem',
              margin: '0 auto 2rem',
              lineHeight: '1.6'
            }}>You need an active subscription to download Paira Bot.</p>
            <button
              onClick={() => router.push('/')}
              style={{
                backgroundColor: '#2563EB',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '0.5rem',
                padding: '0.75rem 2.5rem',
                fontSize: '1rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'background-color 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#1D4ED8'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#2563EB'}
            >
              Subscribe Now
            </button>
          </div>
        )}
      </div>
    </div>
  );
}