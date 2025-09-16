'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'https://api.paira.live';

export default function SignIn() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('paira_auth_token', data.token);
        router.push('/dashboard');
      } else {
        setError(data.error || 'Sign in failed');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #FAFAFA 0%, #F5F5F5 100%)',
      fontFamily: "'Inter', 'SF Pro Display', system-ui, sans-serif",
      color: '#0F172A',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem 1rem'
    }}>
      <div style={{
        backgroundColor: '#FFFFFF',
        maxWidth: '28rem',
        width: '100%',
        border: '1px solid rgba(15, 23, 42, 0.1)',
        borderRadius: '20px',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{
          backgroundColor: '#F8FAFC',
          padding: '2rem 2rem 1.5rem',
          textAlign: 'center',
          borderTopLeftRadius: '20px',
          borderTopRightRadius: '20px'
        }}>
          <h1 style={{
            fontSize: '2rem',
            fontWeight: 700,
            color: '#0F172A',
            fontFamily: "'Inter', 'SF Pro Display', system-ui, sans-serif",
            letterSpacing: '-0.025em',
            marginBottom: '0.5rem'
          }}>Welcome Back</h1>
          <p style={{
            color: '#475569',
            fontSize: '1rem',
            fontFamily: "'Inter', 'SF Pro Text', system-ui, sans-serif"
          }}>Sign in to your Paira account</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{
          padding: '2rem',
          backgroundColor: '#FFFFFF'
        }}>
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{
              display: 'block',
              fontSize: '0.875rem',
              fontWeight: 600,
              color: '#475569',
              fontFamily: "'Inter', 'SF Pro Text', system-ui, sans-serif",
              marginBottom: '0.5rem'
            }}>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                width: '100%',
                padding: '1rem 1.5rem',
                border: '1px solid rgba(15, 23, 42, 0.1)',
                backgroundColor: '#FFFFFF',
                color: '#0F172A',
                fontFamily: "'Inter', 'SF Pro Text', system-ui, sans-serif",
                fontSize: '1rem',
                borderRadius: '12px',
                outline: 'none',
                transition: 'all 0.2s'
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = 'rgba(15, 23, 42, 0.3)';
                e.currentTarget.style.boxShadow = '0 0 0 3px rgba(15, 23, 42, 0.1)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = 'rgba(15, 23, 42, 0.1)';
                e.currentTarget.style.boxShadow = 'none';
              }}
              required
            />
          </div>

          <div style={{ marginBottom: '2rem' }}>
            <label style={{
              display: 'block',
              fontSize: '0.875rem',
              fontWeight: 600,
              color: '#475569',
              fontFamily: "'Inter', 'SF Pro Text', system-ui, sans-serif",
              marginBottom: '0.5rem'
            }}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                width: '100%',
                padding: '1rem 1.5rem',
                border: '1px solid rgba(15, 23, 42, 0.1)',
                backgroundColor: '#FFFFFF',
                color: '#0F172A',
                fontFamily: "'Inter', 'SF Pro Text', system-ui, sans-serif",
                fontSize: '1rem',
                borderRadius: '12px',
                outline: 'none',
                transition: 'all 0.2s'
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = 'rgba(15, 23, 42, 0.3)';
                e.currentTarget.style.boxShadow = '0 0 0 3px rgba(15, 23, 42, 0.1)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = 'rgba(15, 23, 42, 0.1)';
                e.currentTarget.style.boxShadow = 'none';
              }}
              required
            />
          </div>

          {error && (
            <div style={{
              padding: '1rem 1.5rem',
              backgroundColor: '#FEF2F2',
              border: '1px solid #FECACA',
              color: '#DC2626',
              fontSize: '0.875rem',
              borderRadius: '12px',
              fontFamily: "'Inter', 'SF Pro Text', system-ui, sans-serif",
              fontWeight: 500,
              marginBottom: '1.5rem'
            }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '1rem 2rem',
              backgroundColor: '#FFFFFF',
              color: '#1F2937',
              border: '1px solid rgba(15, 23, 42, 0.1)',
              fontSize: '1rem',
              fontWeight: 700,
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.5 : 1,
              letterSpacing: '0.025em',
              borderRadius: '12px',
              fontFamily: "'Inter', 'SF Pro Text', system-ui, sans-serif",
              transition: 'all 0.2s',
              marginBottom: '1.5rem'
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.9)';
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = '0 10px 25px rgba(0, 0, 0, 0.1)';
              }
            }}
            onMouseLeave={(e) => {
              if (!loading) {
                e.currentTarget.style.backgroundColor = '#FFFFFF';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }
            }}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        {/* Footer */}
        <div style={{
          backgroundColor: '#F8FAFC',
          padding: '1.5rem 2rem 2rem',
          textAlign: 'center',
          borderBottomLeftRadius: '20px',
          borderBottomRightRadius: '20px'
        }}>
          <p style={{
            color: '#475569',
            fontSize: '0.875rem',
            fontFamily: "'Inter', 'SF Pro Text', system-ui, sans-serif",
            marginBottom: '1rem'
          }}>
            Don't have an account?{' '}
            <Link href="/auth/signup" style={{
              color: '#6B46C1',
              textDecoration: 'underline',
              fontWeight: 600
            }}>
              Sign up
            </Link>
          </p>
          <Link href="/" style={{
            color: '#6B46C1',
            textDecoration: 'underline',
            fontSize: '0.875rem',
            fontWeight: 600,
            fontFamily: "'Inter', 'SF Pro Text', system-ui, sans-serif"
          }}>
            ← Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}