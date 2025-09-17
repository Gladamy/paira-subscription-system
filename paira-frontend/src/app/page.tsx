'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'https://api.paira.live';

const STRIPE_PRICES = {
  monthly: process.env.NEXT_PUBLIC_STRIPE_PRICE_MONTHLY || 'price_0XXX',
  annual: process.env.NEXT_PUBLIC_STRIPE_PRICE_ANNUAL || 'price_1XXX'
};

export default function Home() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('paira_auth_token');
    setIsLoggedIn(!!token);
  }, []);

  const handleStripeCheckout = async (priceId: string) => {
    try {
      const token = localStorage.getItem('paira_auth_token');
      if (!token) {
        router.push('/auth/signin');
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
        router.push('/auth/signin');
      } else {
        console.error('Failed to create checkout session');
        alert('Failed to start checkout process. Please try again.');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      alert('Network error. Please try again.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('paira_auth_token');
    setIsLoggedIn(false);
    router.push('/');
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #FAFAFA 0%, #F5F5F5 100%)',
      fontFamily: "'Inter', 'SF Pro Display', system-ui, sans-serif",
      color: '#111827'
    }}>
      {/* Header */}
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

            {/* Navigation */}
            <nav style={{
              display: 'flex',
              alignItems: 'center',
              gap: '2rem'
            }}>
              <a
                href="#features"
                style={{
                  color: '#6B7280',
                  textDecoration: 'none',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  transition: 'color 0.2s',
                  padding: '0.5rem 0',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = '#111827';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = '#6B7280';
                }}
                onClick={(e) => {
                  e.preventDefault();
                  const featuresSection = document.querySelector('#features-section');
                  if (featuresSection) {
                    featuresSection.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
              >
                Features
              </a>
              <a
                href="#pricing"
                style={{
                  color: '#6B7280',
                  textDecoration: 'none',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  transition: 'color 0.2s',
                  padding: '0.5rem 0',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = '#111827';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = '#6B7280';
                }}
                onClick={(e) => {
                  e.preventDefault();
                  const pricingSection = document.querySelector('#pricing-section');
                  if (pricingSection) {
                    pricingSection.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
              >
                Pricing
              </a>

              {/* Profile Dropdown or Get Started Button */}
              {isLoggedIn ? (
                <div style={{ position: 'relative' }}>
                  <button
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      padding: '0.5rem',
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
                      width: '2rem',
                      height: '2rem',
                      backgroundColor: 'rgba(243, 244, 246, 0.8)',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: '1px solid rgba(229, 231, 235, 0.5)'
                    }}>
                      <span style={{
                        fontSize: '0.875rem',
                        color: '#6B7280',
                        fontWeight: 'bold'
                      }}>U</span>
                    </div>
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
                        width: '14rem',
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
                        onClick={() => router.push('/dashboard')}
                      >
                        <span style={{
                          marginRight: '0.75rem',
                          fontSize: '1rem',
                          color: '#6B7280'
                        }}>📊</span>
                        Dashboard
                      </button>
                      <button
                        onClick={handleLogout}
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
                        <span style={{
                          marginRight: '0.75rem',
                          fontSize: '1rem',
                          color: '#DC2626'
                        }}>→</span>
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => router.push('/auth/signin')}
                  style={{
                    background: 'linear-gradient(135deg, #9CA3AF 0%, #6B7280 100%)',
                    color: '#FFFFFF',
                    border: 'none',
                    padding: '0.75rem 1.5rem',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    borderRadius: '0.75rem',
                    boxShadow: '0 4px 6px rgba(156, 163, 175, 0.2)',
                    letterSpacing: '0.025em'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-1px)';
                    e.currentTarget.style.boxShadow = '0 6px 12px rgba(156, 163, 175, 0.3)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 6px rgba(156, 163, 175, 0.2)';
                  }}
                >
                  Get Started
                </button>
              )}
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main style={{ padding: '4rem 1rem', maxWidth: '1200px', margin: '0 auto' }}>
        {/* Hero Section - Ultra Clean */}
        <div style={{
          backgroundColor: '#F6F7F9',
          textAlign: 'center',
          padding: '4rem 2rem',
          marginBottom: '4rem'
        }}>
          <h1 style={{
            fontSize: '3.5rem',
            fontWeight: 800,
            color: '#111827',
            marginBottom: '1.5rem',
            lineHeight: '1.05',
            letterSpacing: '-0.025em',
            fontFamily: "'Inter', 'SF Pro Display', system-ui, sans-serif"
          }}>
            Professional Roblox Trading Automation
          </h1>
          <p style={{
            fontSize: '1.25rem',
            color: '#6B7280',
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
            onClick={isLoggedIn ? () => router.push('/dashboard') : () => router.push('/auth/signup')}
            style={{
              backgroundColor: '#6B7280',
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
              e.currentTarget.style.backgroundColor = '#4B5563';
              e.currentTarget.style.transform = 'translateY(-1px)';
              e.currentTarget.style.boxShadow = '0 10px 25px rgba(107, 114, 128, 0.3)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#6B7280';
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            {isLoggedIn ? 'Go to Dashboard' : 'Start Free Trial'}
          </button>
        </div>

        {/* Features - Clean Grid */}
        <div id="features-section" style={{
          backgroundColor: '#F6F7F9',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '3rem',
          padding: '4rem 2rem',
          marginBottom: '4rem'
        }}>
          <div style={{ textAlign: 'center' }}>
            <h3 style={{
              fontSize: '1.25rem',
              fontWeight: 600,
              color: '#111827',
              marginBottom: '1rem',
              fontFamily: "'Inter', 'SF Pro Display', system-ui, sans-serif"
            }}>Advanced Trading Algorithms</h3>
            <p style={{
              color: '#6B7280',
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
              color: '#111827',
              marginBottom: '1rem',
              fontFamily: "'Inter', 'SF Pro Display', system-ui, sans-serif"
            }}>Real-Time Price Tracking</h3>
            <p style={{
              color: '#6B7280',
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
              color: '#111827',
              marginBottom: '1rem',
              fontFamily: "'Inter', 'SF Pro Display', system-ui, sans-serif"
            }}>Secure HWID Licensing</h3>
            <p style={{
              color: '#6B7280',
              lineHeight: '1.6',
              fontFamily: "'Inter', 'SF Pro Text', system-ui, sans-serif"
            }}>
              Device-specific licensing with automatic validation and subscription management.
            </p>
          </div>
        </div>

        {/* App Preview Section - Show Desktop App UI */}
        <div style={{
          backgroundColor: '#F6F7F9',
          padding: '4rem 2rem',
          textAlign: 'center'
        }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <h2 style={{
              fontSize: '2.5rem',
              fontWeight: 800,
              color: '#111827',
              marginBottom: '1rem',
              letterSpacing: '-0.025em',
              fontFamily: "'Inter', 'SF Pro Display', system-ui, sans-serif"
            }}>See Paira Bot in Action</h2>
            <p style={{
              fontSize: '1.125rem',
              color: '#6B7280',
              marginBottom: '3rem',
              fontFamily: "'Inter', 'SF Pro Text', system-ui, sans-serif"
            }}>Experience the professional desktop interface you&apos;ll use to automate your Roblox trading</p>

            {/* Mock Desktop App UI */}
            <div style={{
              backgroundColor: '#FFFFFF',
              border: '1px solid #E5E7EB',
              borderRadius: '12px',
              boxShadow: '0 1px 2px rgba(16,24,40,0.06), 0 0 0 1px rgba(16,24,40,0.04)',
              margin: '0 auto',
              maxWidth: '1000px',
              overflow: 'hidden'
            }}>
              {/* Custom Title Bar */}
              <div style={{
                backgroundColor: '#F6F7F9',
                padding: '0.75rem 1rem',
                borderBottom: '1px solid rgba(15, 23, 42, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  flex: 1,
                  cursor: 'move'
                }}>
                  <span style={{
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    color: '#111827'
                  }}>Paira Bot</span>
                </div>
                <div style={{ display: 'flex', gap: '0.25rem' }}>
                  <button style={{
                    width: '12px',
                    height: '12px',
                    borderRadius: '50%',
                    backgroundColor: '#E5E7EB',
                    border: 'none',
                    cursor: 'pointer'
                  }}></button>
                  <button style={{
                    width: '12px',
                    height: '12px',
                    borderRadius: '50%',
                    backgroundColor: '#E5E7EB',
                    border: 'none',
                    cursor: 'pointer'
                  }}></button>
                  <button style={{
                    width: '12px',
                    height: '12px',
                    borderRadius: '50%',
                    backgroundColor: '#EF4444',
                    border: 'none',
                    cursor: 'pointer'
                  }}></button>
                </div>
              </div>

              {/* Main App Layout */}
              <div style={{ display: 'flex', height: '500px' }}>
                {/* Sidebar */}
                <div style={{
                  width: '200px',
                  backgroundColor: '#F6F7F9',
                  borderRight: '1px solid rgba(15, 23, 42, 0.1)',
                  display: 'flex',
                  flexDirection: 'column'
                }}>
                  {/* Header */}
                  <div style={{
                    padding: '1rem',
                    borderBottom: '1px solid rgba(15, 23, 42, 0.1)'
                  }}>
                    <h3 style={{
                      fontSize: '1rem',
                      fontWeight: '600',
                      color: '#111827',
                      marginBottom: '0.5rem'
                    }}>Bot</h3>
                  </div>

                  {/* Status */}
                  <div style={{
                    padding: '0.75rem 1rem',
                    borderBottom: '1px solid rgba(15, 23, 42, 0.1)'
                  }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}>
                      <div style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        backgroundColor: '#10B981'
                      }}></div>
                      <span style={{
                        fontSize: '0.75rem',
                        color: '#111827',
                        fontWeight: '500'
                      }}>Running</span>
                    </div>
                  </div>

                  {/* Navigation */}
                  <div style={{ padding: '0.5rem' }}>
                    <button style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      padding: '0.75rem',
                      backgroundColor: '#6B7280',
                      color: '#FFFFFF',
                      border: 'none',
                      borderRadius: '12px',
                      fontSize: '0.875rem',
                      fontWeight: '600',
                      cursor: 'pointer',
                      marginBottom: '0.25rem'
                    }}>
                      <span>📊</span>
                      Dashboard
                    </button>
                    <button style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      padding: '0.75rem',
                      backgroundColor: 'transparent',
                      color: '#111827',
                      border: '1px solid #E5E7EB',
                      borderRadius: '12px',
                      fontSize: '0.875rem',
                      fontWeight: '600',
                      cursor: 'pointer',
                      marginBottom: '0.25rem'
                    }}>
                      <span>⚙️</span>
                      Settings
                    </button>
                    <button style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      padding: '0.75rem',
                      backgroundColor: 'transparent',
                      color: '#111827',
                      border: '1px solid #E5E7EB',
                      borderRadius: '12px',
                      fontSize: '0.875rem',
                      fontWeight: '600',
                      cursor: 'pointer'
                    }}>
                      <span>⬇️</span>
                      Updates
                    </button>
                  </div>

                  {/* Spacer */}
                  <div style={{ flex: 1 }}></div>

                  {/* Profile Section */}
                  <div style={{
                    padding: '1rem',
                    borderTop: '1px solid rgba(15, 23, 42, 0.1)',
                    backgroundColor: '#FFFFFF'
                  }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      marginBottom: '0.5rem'
                    }}>
                      <div style={{
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        backgroundColor: '#E5E7EB',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.75rem',
                        fontWeight: '600',
                        color: '#6B7280'
                      }}>U</div>
                      <div>
                        <div style={{
                          fontSize: '0.75rem',
                          fontWeight: '600',
                          color: '#111827'
                        }}>user@email.com</div>
                        <div style={{
                          fontSize: '0.625rem',
                          color: '#10B981',
                          fontWeight: '500'
                        }}>Monthly Active</div>
                      </div>
                    </div>
                    <button style={{
                      width: '100%',
                      padding: '0.5rem',
                      backgroundColor: 'transparent',
                      color: '#DC2626',
                      border: '1px solid rgba(220, 38, 38, 0.2)',
                      borderRadius: '4px',
                      fontSize: '0.75rem',
                      fontWeight: '600',
                      cursor: 'pointer'
                    }}>
                      Sign Out
                    </button>
                  </div>
                </div>

                {/* Main Content */}
                <div style={{
                  flex: 1,
                  padding: '1.5rem',
                  display: 'flex',
                  flexDirection: 'column'
                }}>
                  {/* Header */}
                  <div style={{ marginBottom: '1.5rem' }}>
                    <h1 style={{
                      fontSize: '1.5rem',
                      fontWeight: '600',
                      color: '#111827',
                      marginBottom: '0.25rem'
                    }}>Dashboard</h1>
                    <p style={{
                      fontSize: '0.875rem',
                      color: '#6B7280'
                    }}>Your license expires in 15 days</p>
                  </div>

                  {/* Stats Cards */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                    gap: '1rem',
                    marginBottom: '1.5rem'
                  }}>
                    <div style={{
                      backgroundColor: '#F6F7F9',
                      padding: '1rem',
                      borderRadius: '8px',
                      border: '1px solid #E5E7EB'
                    }}>
                      <h3 style={{
                        fontSize: '0.875rem',
                        fontWeight: '600',
                        color: '#111827',
                        marginBottom: '0.5rem'
                      }}>Bot Status</h3>
                      <p style={{
                        fontSize: '1rem',
                        fontWeight: '600',
                        color: '#10B981'
                      }}>Running</p>
                    </div>
                    <div style={{
                      backgroundColor: '#F6F7F9',
                      padding: '1rem',
                      borderRadius: '8px',
                      border: '1px solid #E5E7EB'
                    }}>
                      <h3 style={{
                        fontSize: '0.875rem',
                        fontWeight: '600',
                        color: '#111827',
                        marginBottom: '0.5rem'
                      }}>Trades Sent</h3>
                      <p style={{
                        fontSize: '1rem',
                        fontWeight: '600',
                        color: '#111827'
                      }}>247</p>
                    </div>
                  </div>

                  {/* Control Buttons */}
                  <div style={{
                    display: 'flex',
                    gap: '1rem',
                    marginBottom: '1.5rem'
                  }}>
                    <button style={{
                      backgroundColor: '#6B7280',
                      color: '#FFFFFF',
                      border: 'none',
                      padding: '0.75rem 1.5rem',
                      borderRadius: '12px',
                      fontSize: '0.875rem',
                      fontWeight: '600',
                      cursor: 'pointer'
                    }}>
                      Start Bot
                    </button>
                    <button style={{
                      backgroundColor: '#FFFFFF',
                      color: '#111827',
                      border: '1px solid #E5E7EB',
                      padding: '0.75rem 1.5rem',
                      borderRadius: '12px',
                      fontSize: '0.875rem',
                      fontWeight: '600',
                      cursor: 'pointer'
                    }}>
                      Stop Bot
                    </button>
                  </div>

                  {/* Activity Logs */}
                  <div style={{
                    flex: 1,
                    backgroundColor: '#F6F7F9',
                    border: '1px solid #E5E7EB',
                    borderRadius: '8px',
                    display: 'flex',
                    flexDirection: 'column'
                  }}>
                    <div style={{
                      padding: '0.75rem 1rem',
                      borderBottom: '1px solid rgba(15, 23, 42, 0.1)'
                    }}>
                      <h3 style={{
                        fontSize: '0.875rem',
                        fontWeight: '600',
                        color: '#111827'
                      }}>Activity Logs</h3>
                    </div>
                    <div style={{
                      flex: 1,
                      padding: '1rem',
                      fontSize: '0.75rem',
                      color: '#6B7280',
                      fontFamily: 'monospace'
                    }}>
                      [2025-01-16 10:30:15] Bot started successfully<br/>
                      [2025-01-16 10:30:16] Connected to Roblox API<br/>
                      [2025-01-16 10:31:22] Trade executed: +R$ 1,250<br/>
                      [2025-01-16 10:32:45] Trade executed: +R$ 850<br/>
                      [2025-01-16 10:33:12] Trade executed: +R$ 2,100<br/>
                      [2025-01-16 10:34:33] Daily profit: $4,200<br/>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div style={{ marginTop: '2rem' }}>
              <button
                onClick={isLoggedIn ? () => router.push('/dashboard') : () => router.push('/auth/signup')}
                style={{
                  backgroundColor: '#6B7280',
                  color: '#FFFFFF',
                  border: 'none',
                  padding: '1rem 2rem',
                  fontSize: '1.125rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  borderRadius: '0.5rem',
                  fontFamily: "'Inter', 'SF Pro Text', system-ui, sans-serif",
                  letterSpacing: '0.025em'
                }}
              >
                {isLoggedIn ? 'Go to Dashboard' : 'Get Started Now'}
              </button>
            </div>
          </div>
        </div>

        {/* Pricing - Enhanced Professional */}
        <div id="pricing-section" style={{
          backgroundColor: '#F6F7F9',
          padding: '4rem 2rem',
          textAlign: 'center'
        }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <h2 style={{
              fontSize: '2.5rem',
              fontWeight: 800,
              color: '#111827',
              marginBottom: '1rem',
              letterSpacing: '-0.025em',
              fontFamily: "'Inter', 'SF Pro Display', system-ui, sans-serif"
            }}>Choose Your Plan</h2>
            <p style={{
              fontSize: '1.125rem',
              color: '#6B7280',
              marginBottom: '3rem',
              fontFamily: "'Inter', 'SF Pro Text', system-ui, sans-serif"
            }}>Start free, upgrade when you&apos;re ready</p>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '2rem',
              maxWidth: '900px',
              margin: '0 auto'
            }}>
            {/* Monthly Plan */}
            <div style={{
              backgroundColor: '#FFFFFF',
              border: '1px solid #E5E7EB',
              borderRadius: '20px',
              padding: '2.5rem',
              textAlign: 'center',
              boxShadow: '0 1px 2px rgba(16,24,40,0.06), 0 0 0 1px rgba(16,24,40,0.04)',
              transition: 'all 0.3s ease',
              position: 'relative'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(0, 0, 0, 0.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
            }}>
              <h3 style={{
                fontSize: '1.5rem',
                fontWeight: 700,
                color: '#111827',
                marginBottom: '1.5rem',
                fontFamily: "'Inter', 'SF Pro Display', system-ui, sans-serif"
              }}>Monthly</h3>

              <div style={{
                display: 'flex',
                alignItems: 'baseline',
                justifyContent: 'center',
                marginBottom: '1rem'
              }}>
                <span style={{
                  fontSize: '3rem',
                  fontWeight: 800,
                  color: '#1F2937',
                  fontFamily: "'Inter', 'SF Pro Display', system-ui, sans-serif"
                }}>$0.60</span>
                <span style={{
                  fontSize: '1rem',
                  color: '#64748B',
                  marginLeft: '0.5rem',
                  fontFamily: "'Inter', 'SF Pro Text', system-ui, sans-serif"
                }}>per month</span>
              </div>

              <ul style={{
                listStyle: 'none',
                padding: 0,
                margin: '2rem 0',
                textAlign: 'left'
              }}>
                <li style={{
                  display: 'flex',
                  alignItems: 'center',
                  marginBottom: '0.75rem',
                  fontSize: '0.875rem',
                  color: '#6B7280',
                  fontFamily: "'Inter', 'SF Pro Text', system-ui, sans-serif"
                }}>
                  <span style={{
                    color: '#10B981',
                    fontWeight: 600,
                    marginRight: '0.5rem',
                    fontSize: '1rem'
                  }}>✓</span>
                  Full bot functionality
                </li>
                <li style={{
                  display: 'flex',
                  alignItems: 'center',
                  marginBottom: '0.75rem',
                  fontSize: '0.875rem',
                  color: '#6B7280',
                  fontFamily: "'Inter', 'SF Pro Text', system-ui, sans-serif"
                }}>
                  <span style={{
                    color: '#10B981',
                    fontWeight: 600,
                    marginRight: '0.5rem',
                    fontSize: '1rem'
                  }}>✓</span>
                  HWID-based licensing
                </li>
                <li style={{
                  display: 'flex',
                  alignItems: 'center',
                  marginBottom: '0.75rem',
                  fontSize: '0.875rem',
                  color: '#6B7280',
                  fontFamily: "'Inter', 'SF Pro Text', system-ui, sans-serif"
                }}>
                  <span style={{
                    color: '#10B981',
                    fontWeight: 600,
                    marginRight: '0.5rem',
                    fontSize: '1rem'
                  }}>✓</span>
                  Priority support
                </li>
                <li style={{
                  display: 'flex',
                  alignItems: 'center',
                  fontSize: '0.875rem',
                  color: '#6B7280',
                  fontFamily: "'Inter', 'SF Pro Text', system-ui, sans-serif"
                }}>
                  <span style={{
                    color: '#10B981',
                    fontWeight: 600,
                    marginRight: '0.5rem',
                    fontSize: '1rem'
                  }}>✓</span>
                  Cancel anytime
                </li>
              </ul>

              <button
                onClick={() => handleStripeCheckout(STRIPE_PRICES.monthly)}
                style={{
                  width: '100%',
                  backgroundColor: '#FFFFFF',
                  color: '#1F2937',
                  border: 'none',
                  padding: '1rem 2rem',
                  fontSize: '1rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  borderRadius: '12px',
                  fontFamily: "'Inter', 'SF Pro Text', system-ui, sans-serif",
                  letterSpacing: '0.025em'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.9)';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                  e.currentTarget.style.boxShadow = '0 10px 25px rgba(0, 0, 0, 0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#FFFFFF';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                Select Monthly
              </button>
            </div>

            {/* Annual Plan - Premium */}
            <div style={{
              backgroundColor: '#FFFFFF',
              border: '1px solid #E5E7EB',
              borderRadius: '20px',
              padding: '2.5rem',
              textAlign: 'center',
              boxShadow: '0 1px 2px rgba(16,24,40,0.06), 0 0 0 1px rgba(16,24,40,0.04)',
              transition: 'all 0.3s ease',
              position: 'relative'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(0, 0, 0, 0.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
            }}>
              <div style={{
                position: 'absolute',
                top: '-12px',
                left: '50%',
                transform: 'translateX(-50%)',
                backgroundColor: '#10B981',
                color: '#FFFFFF',
                padding: '6px 16px',
                borderRadius: '20px',
                fontSize: '0.75rem',
                fontWeight: 700,
                letterSpacing: '0.025em',
                boxShadow: '0 1px 2px rgba(16,24,40,0.06), 0 0 0 1px rgba(16,24,40,0.04)',
                fontFamily: "'Inter', 'SF Pro Text', system-ui, sans-serif"
              }}>Save 25%</div>

              <h3 style={{
                fontSize: '1.5rem',
                fontWeight: 700,
                color: '#111827',
                marginBottom: '1.5rem',
                fontFamily: "'Inter', 'SF Pro Display', system-ui, sans-serif"
              }}>Annual</h3>

              <div style={{
                display: 'flex',
                alignItems: 'baseline',
                justifyContent: 'center',
                marginBottom: '1rem'
              }}>
                <span style={{
                  fontSize: '3rem',
                  fontWeight: 800,
                  color: '#1F2937',
                  fontFamily: "'Inter', 'SF Pro Display', system-ui, sans-serif"
                }}>$54.99</span>
                <span style={{
                  fontSize: '1rem',
                  color: '#64748B',
                  marginLeft: '0.5rem',
                  fontFamily: "'Inter', 'SF Pro Text', system-ui, sans-serif"
                }}>per year</span>
              </div>

              <div style={{
                fontSize: '0.875rem',
                color: '#6B7280',
                marginBottom: '2rem',
                fontFamily: "'Inter', 'SF Pro Text', system-ui, sans-serif"
              }}>
                <span style={{
                  color: '#111827',
                  fontWeight: 600
                }}>2 months free</span> • Best value
              </div>

              <ul style={{
                listStyle: 'none',
                padding: 0,
                margin: '2rem 0',
                textAlign: 'left'
              }}>
                <li style={{
                  display: 'flex',
                  alignItems: 'center',
                  marginBottom: '0.75rem',
                  fontSize: '0.875rem',
                  color: '#6B7280',
                  fontFamily: "'Inter', 'SF Pro Text', system-ui, sans-serif"
                }}>
                  <span style={{
                    color: '#10B981',
                    fontWeight: 600,
                    marginRight: '0.5rem',
                    fontSize: '1rem'
                  }}>✓</span>
                  All Monthly features
                </li>
                <li style={{
                  display: 'flex',
                  alignItems: 'center',
                  marginBottom: '0.75rem',
                  fontSize: '0.875rem',
                  color: '#6B7280',
                  fontFamily: "'Inter', 'SF Pro Text', system-ui, sans-serif"
                }}>
                  <span style={{
                    color: '#10B981',
                    fontWeight: 600,
                    marginRight: '0.5rem',
                    fontSize: '1rem'
                  }}>✓</span>
                  2 months free
                </li>
                <li style={{
                  display: 'flex',
                  alignItems: 'center',
                  marginBottom: '0.75rem',
                  fontSize: '0.875rem',
                  color: '#6B7280',
                  fontFamily: "'Inter', 'SF Pro Text', system-ui, sans-serif"
                }}>
                  <span style={{
                    color: '#10B981',
                    fontWeight: 600,
                    marginRight: '0.5rem',
                    fontSize: '1rem'
                  }}>✓</span>
                  Exclusive beta access
                </li>
                <li style={{
                  display: 'flex',
                  alignItems: 'center',
                  fontSize: '0.875rem',
                  color: '#6B7280',
                  fontFamily: "'Inter', 'SF Pro Text', system-ui, sans-serif"
                }}>
                  <span style={{
                    color: '#10B981',
                    fontWeight: 600,
                    marginRight: '0.5rem',
                    fontSize: '1rem'
                  }}>✓</span>
                  Premium support
                </li>
              </ul>

              <button
                onClick={() => handleStripeCheckout(STRIPE_PRICES.annual)}
                style={{
                  width: '100%',
                  backgroundColor: '#FFFFFF',
                  color: '#1F2937',
                  border: 'none',
                  padding: '1rem 2rem',
                  fontSize: '1rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  borderRadius: '12px',
                  fontFamily: "'Inter', 'SF Pro Text', system-ui, sans-serif",
                  letterSpacing: '0.025em'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.9)';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                  e.currentTarget.style.boxShadow = '0 10px 25px rgba(0, 0, 0, 0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#FFFFFF';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                Select Annual
              </button>
            </div>
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
            color: '#6B7280',
            fontSize: '0.875rem',
            fontFamily: "'Inter', 'SF Pro Text', system-ui, sans-serif"
          }}>
            © 2025 Paira Bot. All rights reserved.
          </p>
        </div>
      </footer>

    </div>
  );
}
