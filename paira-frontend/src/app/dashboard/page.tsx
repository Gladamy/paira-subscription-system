'use client';

// Dashboard component for user account management
import React, { useState, useEffect, useRef } from 'react';
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
const Header = ({ onLogout }: { onLogout: () => void }) => {
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const dropdownTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnter = () => {
    if (dropdownTimeoutRef.current) {
      clearTimeout(dropdownTimeoutRef.current);
    }
    setShowProfileDropdown(true);
  };

  const handleMouseLeave = () => {
    dropdownTimeoutRef.current = setTimeout(() => {
      setShowProfileDropdown(false);
    }, 150); // 150ms delay before closing
  };

  return (
    <header style={{
      background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(246, 247, 249, 0.95) 100%)',
      backdropFilter: 'blur(20px)',
      borderBottom: '1px solid rgba(229, 231, 235, 0.3)',
      position: 'sticky',
      top: 0,
      zIndex: 50,
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)'
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
          height: '5rem'
        }}>
          {/* Logo Section */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem'
          }}>
            <div style={{
              width: '2.5rem',
              height: '2.5rem',
              background: 'linear-gradient(135deg, #9CA3AF 0%, #6B7280 100%)',
              borderRadius: '0.75rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 6px rgba(156, 163, 175, 0.2)'
            }}>
              <span style={{
                fontSize: '1.125rem',
                fontWeight: '700',
                color: '#FFFFFF'
              }}>P</span>
            </div>
            <div>
              <h1 style={{
                fontSize: '1.75rem',
                fontWeight: 400,
                color: '#9CA3AF',
                letterSpacing: '-0.025em',
                margin: 0,
                lineHeight: '1.2',
                fontFamily: "'Inter', 'SF Pro Text', system-ui, sans-serif"
              }}>paira</h1>
            </div>
          </div>

        {/* Profile Dropdown */}
        <div style={{ position: 'relative' }}>
          <button
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.5rem',
              borderRadius: '0.5rem',
              transition: 'all 0.2s',
              border: 'none',
              backgroundColor: 'transparent',
              cursor: 'pointer'
            }}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onClick={() => setShowProfileDropdown(!showProfileDropdown)}
          >
            <div style={{
              width: '2rem',
              height: '2rem',
              backgroundColor: '#E5E7EB',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '2px solid #D1D5DB'
            }}>
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#6B7280"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
            </div>
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#6B7280"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{
                transition: 'transform 0.2s',
                transform: showProfileDropdown ? 'rotate(180deg)' : 'rotate(0deg)'
              }}
            >
              <polyline points="6,9 12,15 18,9"></polyline>
            </svg>
          </button>

          {showProfileDropdown && (
            <div
              style={{
                position: 'absolute',
                right: 0,
                top: '100%',
                marginTop: '0.5rem',
                width: '12rem',
                backgroundColor: '#FFFFFF',
                borderRadius: '0.75rem',
                boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
                border: '1px solid rgba(229, 231, 235, 0.8)',
                padding: '0.5rem 0',
                zIndex: 50
              }}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            >
              <button
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  padding: '0.75rem 1rem',
                  fontSize: '0.875rem',
                  color: '#374151',
                  backgroundColor: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s',
                  fontWeight: '500'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F9FAFB'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                onClick={(e) => {
                  e.preventDefault();
                  setShowProfileDropdown(false);
                  // Could add navigation to account settings if needed
                }}
              >
                Account Settings
              </button>
              <div style={{
                height: '1px',
                backgroundColor: '#E5E7EB',
                margin: '0.25rem 0'
              }}></div>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  setShowProfileDropdown(false);
                  onLogout();
                }}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  padding: '0.75rem 1rem',
                  fontSize: '0.875rem',
                  color: '#DC2626',
                  backgroundColor: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s',
                  fontWeight: '500'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#FEF2F2'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
    </header>
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
      <Header onLogout={handleLogout} />

      <div style={{ maxWidth: '80rem', margin: '0 auto', padding: '1.5rem' }}>
        {/* Welcome Section */}
        <div style={{
          backgroundColor: 'rgba(255, 255, 255, 0.6)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(229, 231, 235, 0.3)',
          borderRadius: '1rem',
          padding: '1.5rem',
          marginBottom: '1.5rem',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)'
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
          backgroundColor: 'rgba(255, 255, 255, 0.6)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(229, 231, 235, 0.3)',
          borderRadius: '1rem',
          padding: '1.5rem',
          marginBottom: '1.5rem',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)'
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
            backgroundColor: 'rgba(255, 255, 255, 0.6)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(229, 231, 235, 0.3)',
            borderRadius: '1rem',
            padding: '2rem',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)'
          }}>
            <div style={{ marginBottom: '2rem' }}>
              <h2 style={{
                fontSize: '1.75rem',
                fontWeight: '700',
                color: '#1F2937',
                marginBottom: '0.5rem',
                fontFamily: "'Inter', 'SF Pro Display', system-ui, sans-serif"
              }}>Download Paira Bot Desktop</h2>
              <p style={{
                color: '#6B7280',
                fontSize: '1rem',
                fontFamily: "'Inter', 'SF Pro Text', system-ui, sans-serif"
              }}>Get the complete desktop application with automatic setup and standalone operation</p>
            </div>

            {/* Windows Download Card */}
            <div style={{
              backgroundColor: '#F6F7F9',
              border: '1px solid #E5E7EB',
              borderRadius: '16px',
              padding: '2rem',
              marginBottom: '2rem'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '1.5rem',
                flexWrap: 'wrap',
                gap: '1rem'
              }}>
                {/* Windows Icon */}
                <div style={{
                  width: '64px',
                  height: '64px',
                  backgroundColor: '#0078D4',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 8px 25px rgba(0, 120, 212, 0.2)'
                }}>
                  <svg
                    width="32"
                    height="32"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#FFFFFF"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
                    <line x1="8" y1="21" x2="16" y2="21"></line>
                    <line x1="12" y1="17" x2="12" y2="21"></line>
                  </svg>
                </div>

                {/* Download Info */}
                <div style={{ flex: 1, minWidth: '200px' }}>
                  <h3 style={{
                    fontSize: '1.25rem',
                    fontWeight: '700',
                    color: '#1F2937',
                    marginBottom: '0.5rem',
                    fontFamily: "'Inter', 'SF Pro Display', system-ui, sans-serif"
                  }}>Windows Installer</h3>
                  <p style={{
                    fontSize: '0.875rem',
                    color: '#6B7280',
                    marginBottom: '0.5rem',
                    fontFamily: "'Inter', 'SF Pro Text', system-ui, sans-serif"
                  }}>Complete setup with automatic folder creation</p>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    fontSize: '0.75rem',
                    color: '#6B7280'
                  }}>
                    <span>📦 45.2 MB</span>
                    <span>🖥️ Windows 10/11</span>
                    <span>🔒 HWID Protected</span>
                  </div>
                </div>

                {/* Download Button */}
                <a
                  href="https://github.com/Gladamy/paira-subscription-system/releases/download/v1.0.0/paira-bot-setup.exe"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    backgroundColor: '#6B7280',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: '12px',
                    padding: '1rem 2rem',
                    fontSize: '1rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    textDecoration: 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    fontFamily: "'Inter', 'SF Pro Text', system-ui, sans-serif",
                    letterSpacing: '0.025em',
                    transition: 'all 0.2s',
                    boxShadow: '0 4px 12px rgba(107, 114, 128, 0.2)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#4B5563';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 8px 25px rgba(107, 114, 128, 0.3)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#6B7280';
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(107, 114, 128, 0.2)';
                  }}
                >
                  <span>⬇️</span>
                  Download for Windows
                </a>
              </div>

              {/* Installation Instructions */}
              <div style={{
                backgroundColor: '#FFFFFF',
                border: '1px solid #E5E7EB',
                borderRadius: '12px',
                padding: '1.5rem'
              }}>
                <h4 style={{
                  fontSize: '1rem',
                  fontWeight: '600',
                  color: '#1F2937',
                  marginBottom: '1rem',
                  fontFamily: "'Inter', 'SF Pro Display', system-ui, sans-serif"
                }}>Installation Process:</h4>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'auto 1fr',
                  gap: '0.75rem',
                  alignItems: 'flex-start'
                }}>
                  <div style={{
                    width: '20px',
                    height: '20px',
                    backgroundColor: '#10B981',
                    color: '#FFFFFF',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.625rem',
                    fontWeight: '700'
                  }}>1</div>
                  <div>
                    <p style={{
                      fontSize: '0.75rem',
                      color: '#374151',
                      margin: 0,
                      fontWeight: '600'
                    }}>Download the installer</p>
                    <p style={{
                      fontSize: '0.625rem',
                      color: '#6B7280',
                      margin: '0.25rem 0 0 0'
                    }}>Click the download button above</p>
                  </div>

                  <div style={{
                    width: '20px',
                    height: '20px',
                    backgroundColor: '#10B981',
                    color: '#FFFFFF',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.625rem',
                    fontWeight: '700'
                  }}>2</div>
                  <div>
                    <p style={{
                      fontSize: '0.75rem',
                      color: '#374151',
                      margin: 0,
                      fontWeight: '600'
                    }}>Run the installer</p>
                    <p style={{
                      fontSize: '0.625rem',
                      color: '#6B7280',
                      margin: '0.25rem 0 0 0'
                    }}>Follow the setup wizard</p>
                  </div>

                  <div style={{
                    width: '20px',
                    height: '20px',
                    backgroundColor: '#10B981',
                    color: '#FFFFFF',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.625rem',
                    fontWeight: '700'
                  }}>3</div>
                  <div>
                    <p style={{
                      fontSize: '0.75rem',
                      color: '#374151',
                      margin: 0,
                      fontWeight: '600'
                    }}>Automatic setup</p>
                    <p style={{
                      fontSize: '0.625rem',
                      color: '#6B7280',
                      margin: '0.25rem 0 0 0'
                    }}>App creates &quot;Paira Bot&quot; folder on desktop</p>
                  </div>

                  <div style={{
                    width: '20px',
                    height: '20px',
                    backgroundColor: '#10B981',
                    color: '#FFFFFF',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.625rem',
                    fontWeight: '700'
                  }}>4</div>
                  <div>
                    <p style={{
                      fontSize: '0.75rem',
                      color: '#374151',
                      margin: 0,
                      fontWeight: '600'
                    }}>Launch and trade</p>
                    <p style={{
                      fontSize: '0.625rem',
                      color: '#6B7280',
                      margin: '0.25rem 0 0 0'
                    }}>Use the desktop shortcuts to start trading</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Other Platforms */}
            <div>
              <h3 style={{
                fontSize: '1.125rem',
                fontWeight: '600',
                color: '#1F2937',
                marginBottom: '1rem',
                fontFamily: "'Inter', 'SF Pro Display', system-ui, sans-serif"
              }}>Other Platforms</h3>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '1rem'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  padding: '1.25rem',
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #E5E7EB',
                  borderRadius: '12px',
                  opacity: 0.7
                }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    backgroundColor: '#000000',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <span style={{
                      fontSize: '1rem',
                      color: '#FFFFFF',
                      fontWeight: 'bold'
                    }}></span>
                  </div>
                  <div>
                    <p style={{
                      fontSize: '0.875rem',
                      fontWeight: '600',
                      color: '#1F2937'
                    }}>macOS</p>
                    <p style={{
                      fontSize: '0.75rem',
                      color: '#6B7280'
                    }}>Coming soon</p>
                  </div>
                </div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  padding: '1.25rem',
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #E5E7EB',
                  borderRadius: '12px',
                  opacity: 0.7
                }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    backgroundColor: '#FCC624',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <span style={{
                      fontSize: '1rem',
                      color: '#000000',
                      fontWeight: 'bold'
                    }}>🐧</span>
                  </div>
                  <div>
                    <p style={{
                      fontSize: '0.875rem',
                      fontWeight: '600',
                      color: '#1F2937'
                    }}>Linux</p>
                    <p style={{
                      fontSize: '0.75rem',
                      color: '#6B7280'
                    }}>Coming soon</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div style={{
            backgroundColor: 'rgba(255, 255, 255, 0.6)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(229, 231, 235, 0.3)',
            borderRadius: '1rem',
            padding: '1.5rem',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
            textAlign: 'center'
          }}>
            <div style={{
              width: '5rem',
              height: '5rem',
              backgroundColor: 'rgba(254, 242, 242, 0.8)',
              borderRadius: '1rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.5rem',
              border: '2px solid rgba(252, 165, 165, 0.3)'
            }}>
              <span style={{
                fontSize: '2rem',
                color: '#DC2626',
                fontWeight: 'bold'
              }}>!</span>
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
                backgroundColor: '#1F2937',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '0.5rem',
                padding: '0.75rem 2.5rem',
                fontSize: '1rem',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              Subscribe Now
            </button>
          </div>
        )}
      </div>
    </div>
  );
}