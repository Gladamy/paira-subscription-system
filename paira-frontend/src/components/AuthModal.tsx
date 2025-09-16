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
        border: '1px solid #E5E7EB'
      }}>
        <div className="p-6" style={{ borderBottom: '1px solid #E5E7EB' }}>
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-medium" style={{ color: '#0f0f0f', fontWeight: 500 }}>
              {isLogin ? 'Sign In' : 'Create Account'}
            </h2>
            <button onClick={onClose} style={{ color: '#6B7280' }}>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: '#374151' }}>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                width: '100%',
                padding: '1rem 0.75rem',
                border: '1px solid #E5E7EB',
                backgroundColor: '#FFFFFF',
                color: '#000000',
                fontFamily: "'Inter', 'SF Pro', sans-serif",
                fontSize: '1rem',
                outline: 'none'
              }}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: '#374151' }}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                width: '100%',
                padding: '1rem 0.75rem',
                border: '1px solid #E5E7EB',
                backgroundColor: '#FFFFFF',
                color: '#000000',
                fontFamily: "'Inter', 'SF Pro', sans-serif",
                fontSize: '1rem',
                outline: 'none'
              }}
              required
            />
          </div>

          {error && (
            <div style={{
              padding: '0.75rem',
              backgroundColor: '#FEF2F2',
              border: '1px solid #FECACA',
              color: '#DC2626',
              fontSize: '14px'
            }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '1rem',
              backgroundColor: '#6B46C1',
              color: '#FFFFFF',
              fontSize: '1rem',
              fontWeight: 500,
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.5 : 1
            }}
            onMouseEnter={(e) => {
              if (!loading) e.currentTarget.style.backgroundColor = '#553C9A';
            }}
            onMouseLeave={(e) => {
              if (!loading) e.currentTarget.style.backgroundColor = '#6B46C1';
            }}
          >
            {loading ? 'Please wait...' : (isLogin ? 'Sign In' : 'Create Account')}
          </button>
        </form>

        <div className="px-6 pb-6 text-center">
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