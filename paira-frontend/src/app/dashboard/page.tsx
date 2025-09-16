'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle, Calendar, Download, Monitor, Smartphone, User, Settings, LogOut, ChevronDown } from 'lucide-react';

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

// Header Component
const Header = ({ user, onLogout }: { user: User | null; onLogout: () => void }) => {
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);

  return (
    <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200/60 px-8 py-5 sticky top-0 z-50">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center mr-4 shadow-sm">
            <span className="text-white font-bold text-sm">P</span>
          </div>
          <span className="text-xl font-bold text-gray-900 tracking-tight">Paira Bot</span>
        </div>

        {/* Profile Dropdown */}
        <div className="relative">
          <button
            className="flex items-center space-x-4 p-3 rounded-xl hover:bg-gray-50 transition-all duration-200"
            onMouseEnter={() => setShowProfileDropdown(true)}
            onMouseLeave={() => setShowProfileDropdown(false)}
          >
            <div className="w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center">
              <User size={18} className="text-gray-600" />
            </div>
            <span className="text-sm font-semibold text-gray-700">{user?.email}</span>
            <ChevronDown size={16} className="text-gray-400" />
          </button>

          {showProfileDropdown && (
            <div
              className="absolute right-0 top-full mt-3 w-64 bg-white rounded-2xl shadow-xl border border-gray-200/60 py-3 z-50"
              onMouseEnter={() => setShowProfileDropdown(true)}
              onMouseLeave={() => setShowProfileDropdown(false)}
            >
              <div className="px-5 py-3 border-b border-gray-100">
                <p className="text-sm font-semibold text-gray-900">{user?.email}</p>
                <p className="text-xs text-gray-500 font-medium">Monthly Plan</p>
              </div>
              <button className="w-full flex items-center px-5 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                <Settings size={16} className="mr-3" />
                Account Settings
              </button>
              <button
                onClick={onLogout}
                className="w-full flex items-center px-5 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors"
              >
                <LogOut size={16} className="mr-3" />
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-3"></div>
          <p className="text-sm text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="border border-red-200 rounded-xl p-6 shadow-sm bg-white max-w-sm w-full text-center">
          <div className="text-red-500 mb-3">
            <svg className="w-10 h-10 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-lg font-semibold text-gray-900 mb-3">Error</h1>
          <p className="text-sm text-gray-600 mb-4">{error}</p>
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
    <div className="min-h-screen bg-slate-50/30" style={{ fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
      <Header user={user} onLogout={handleLogout} />

      <div className="max-w-7xl mx-auto px-8 py-12">
        {/* Welcome Section */}
        <div className="mb-12">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
                Welcome back!
              </h1>
              <p className="text-gray-600 font-medium">
                {user?.email}
              </p>
            </div>
            <div className="text-right max-w-md">
              <p className="text-gray-500 leading-relaxed">
                Manage your subscription and download the latest version of Paira Bot.
              </p>
            </div>
          </div>
        </div>

        {/* Subscription Status Card */}
        <div className="bg-white rounded-2xl border border-gray-200/60 p-8 mb-10 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900 tracking-tight">Subscription Status</h2>
            <div className={`flex items-center px-4 py-2 rounded-full text-sm font-semibold ${
              subscription?.status === 'active'
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : 'bg-amber-50 text-amber-700 border border-amber-200'
            }`}>
              <CheckCircle size={16} className="mr-2" />
              {subscription?.status === 'active' ? 'Active' : 'Inactive'}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Plan */}
            <div className="space-y-3">
              <div className="text-sm font-semibold text-gray-600 uppercase tracking-wider">Current Plan</div>
              <div className="text-3xl font-bold text-gray-900">{subscription?.plan || 'N/A'}</div>
            </div>

            {/* Expires */}
            <div className="space-y-3">
              <div className="text-sm font-semibold text-gray-600 uppercase tracking-wider">Expires On</div>
              <div className="flex items-center text-xl font-semibold text-gray-900">
                <Calendar size={18} className="mr-3 text-gray-400" />
                {subscription?.current_period_end
                  ? new Date(subscription.current_period_end).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })
                  : 'N/A'
                }
              </div>
            </div>
          </div>
        </div>

        {/* Download Section */}
        {subscription?.status === 'active' ? (
          <div className="bg-white rounded-2xl border border-gray-200/60 p-8 shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-xl font-bold text-gray-900 tracking-tight mb-2">Download Paira Bot</h2>
                <p className="text-gray-600 leading-relaxed">Get the latest version of Paira Bot Desktop App.</p>
              </div>
              <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center">
                <Download size={24} className="text-blue-600" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Windows Download */}
              <div className="border border-gray-200 rounded-2xl p-8 hover:border-blue-300 hover:bg-blue-50/50 transition-all duration-300 group">
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mr-4 group-hover:bg-blue-200 transition-colors">
                    <Monitor size={20} className="text-blue-600" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900 text-lg">Download for Windows</div>
                    <div className="text-gray-500">Windows 10/11</div>
                  </div>
                </div>
                <div className="text-sm text-gray-500 mb-6 leading-relaxed">MSI Installer • ~70MB download</div>
                <a
                  href="/paira-bot-setup.msi"
                  download="paira-bot-setup.msi"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 flex items-center justify-center shadow-sm hover:shadow-md"
                >
                  <Download size={18} className="mr-2" />
                  Download Now
                </a>
              </div>

              {/* Other Platforms */}
              <div className="border border-gray-200 rounded-2xl p-8 hover:border-gray-300 hover:bg-gray-50/50 transition-all duration-300 group">
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mr-4 group-hover:bg-gray-200 transition-colors">
                    <Smartphone size={20} className="text-gray-600" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900 text-lg">Other Platforms</div>
                    <div className="text-gray-500">macOS, Linux, Mobile</div>
                  </div>
                </div>
                <div className="text-sm text-gray-500 mb-6 leading-relaxed">Coming soon</div>
                <button
                  onClick={() => window.open('https://paira.live/download', '_blank')}
                  className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-4 px-6 rounded-xl transition-all duration-200 shadow-sm hover:shadow-md"
                >
                  View Options
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-200/60 p-8 shadow-sm">
            <div className="text-center">
              <div className="w-20 h-20 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-3 tracking-tight">No Active Subscription</h2>
              <p className="text-gray-600 mb-8 leading-relaxed max-w-md mx-auto">You need an active subscription to download Paira Bot.</p>
              <button
                onClick={() => router.push('/')}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-10 rounded-xl transition-all duration-200 shadow-sm hover:shadow-md"
              >
                Subscribe Now
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}