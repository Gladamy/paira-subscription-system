'use client';

import { useState } from 'react';

interface AuthModalProps {
  onClose: () => void;
}

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'https://api.paira.live';

export default function AuthModal({ onClose }: AuthModalProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [user, setUser] = useState<any>(null);
  const [showPricing, setShowPricing] = useState(false);

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
        setUser(data.user);
        setShowPricing(true);
      } else {
        setError(data.error || 'Authentication failed');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async (planType: 'monthly' | 'annual') => {
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('paira_auth_token');
      const response = await fetch(`${API_BASE}/api/subscriptions/create-checkout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          priceId: planType === 'monthly'
            ? 'price_1S778IHF7lE4j38pZNPnlifC'  // 60 cent test price
            : 'price_1S75fTHF7lE4j38pMqjFt3Im'  // Annual price
        })
      });

      const data = await response.json();

      if (response.ok && data.url) {
        window.location.href = data.url; // Redirect to Stripe Checkout
      } else {
        setError(data.error || 'Failed to create checkout session');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (showPricing) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6 border-b border-slate-200">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-slate-900">Choose Your Plan</h2>
              <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Monthly Plan */}
              <div className="border-2 border-slate-200 rounded-lg p-6 hover:border-blue-500 transition-colors">
                <h3 className="text-xl font-semibold text-slate-900 mb-2">Monthly</h3>
                <div className="text-3xl font-bold text-slate-900 mb-4">$0.60<span className="text-lg font-normal text-slate-600">/month</span></div>
                <ul className="space-y-2 mb-6 text-slate-600">
                  <li>✓ Full bot functionality</li>
                  <li>✓ HWID-based licensing</li>
                  <li>✓ Priority support</li>
                  <li>✓ Cancel anytime</li>
                </ul>
                <button
                  onClick={() => handleSubscribe('monthly')}
                  disabled={loading}
                  className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? 'Processing...' : 'Subscribe Monthly'}
                </button>
              </div>

              {/* Annual Plan */}
              <div className="border-2 border-blue-500 rounded-lg p-6 relative">
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                  Save 34%
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-2">Annual</h3>
                <div className="text-3xl font-bold text-slate-900 mb-4">$54.99<span className="text-lg font-normal text-slate-600">/year</span></div>
                <ul className="space-y-2 mb-6 text-slate-600">
                  <li>✓ All Monthly features</li>
                  <li>✓ 2 months free</li>
                  <li>✓ Exclusive beta access</li>
                  <li>✓ Premium support</li>
                </ul>
                <button
                  onClick={() => handleSubscribe('annual')}
                  disabled={loading}
                  className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? 'Processing...' : 'Subscribe Annual'}
                </button>
              </div>
            </div>

            {error && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
                {error}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full">
        <div className="p-6 border-b border-slate-200">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-slate-900">
              {isLogin ? 'Sign In' : 'Create Account'}
            </h2>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Please wait...' : (isLogin ? 'Sign In' : 'Create Account')}
          </button>
        </form>

        <div className="px-6 pb-6 text-center">
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-blue-600 hover:text-blue-800 text-sm"
          >
            {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
          </button>
        </div>
      </div>
    </div>
  );
}