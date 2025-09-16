'use client';

import { useState } from 'react';

interface AuthModalProps {
  onClose: () => void;
  onAuthSuccess?: () => void;
}

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'https://api.paira.live';

export default function AuthModal({ onClose, onAuthSuccess }: AuthModalProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
      const response = await fetch(`${API_BASE}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('paira_auth_token', data.token);
        // Close modal immediately after successful authentication
        onClose();
        // Notify parent component of successful authentication
        onAuthSuccess?.();
      } else {
        setError(data.error || 'Authentication failed');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };





  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div style={{
        backgroundColor: '#FFFFFF',
        maxWidth: '28rem',
        width: '100%',
        border: '1px solid rgba(15, 23, 42, 0.1)',
        borderRadius: '20px',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        position: 'relative'
      }}>
        <div className="p-6" style={{
          backgroundColor: '#F8FAFC',
          borderTopLeftRadius: '20px',
          borderTopRightRadius: '20px'
        }}>
          <div className="flex justify-between items-center">
            <h2 style={{
              fontSize: '1.875rem',
              fontWeight: 700,
              color: '#0F172A',
              fontFamily: "'Inter', 'SF Pro Display', system-ui, sans-serif",
              letterSpacing: '-0.025em',
              marginBottom: '0.5rem'
            }}>
              {isLogin ? 'Sign In' : 'Create Account'}
            </h2>
            <button onClick={onClose} style={{ color: '#6B7280' }}>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4" style={{
          backgroundColor: '#FFFFFF'
        }}>
          <div>
            <label className="block text-sm font-medium mb-2" style={{
              color: '#475569',
              fontFamily: "'Inter', 'SF Pro Text', system-ui, sans-serif",
              fontWeight: 600
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

          <div>
            <label className="block text-sm font-medium mb-2" style={{
              color: '#475569',
              fontFamily: "'Inter', 'SF Pro Text', system-ui, sans-serif",
              fontWeight: 600
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
              fontWeight: 500
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
              transition: 'all 0.2s'
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
            {loading ? 'Please wait...' : (isLogin ? 'Sign In' : 'Create Account')}
          </button>
        </form>

        <div className="px-6 pb-6 text-center" style={{
          backgroundColor: '#F8FAFC',
          borderBottomLeftRadius: '20px',
          borderBottomRightRadius: '20px'
        }}>
          <button
            onClick={() => setIsLogin(!isLogin)}
            style={{
              color: '#6B46C1',
              fontSize: '0.875rem',
              textDecoration: 'underline',
              background: 'none',
              border: 'none',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = '#553C9A';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = '#6B46C1';
            }}
          >
            {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
          </button>
        </div>
      </div>
    </div>
  );
}