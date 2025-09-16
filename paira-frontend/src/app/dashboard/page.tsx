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
    <div className="bg-white border-b border-gray-200 px-8 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center mr-3">
            <span className="text-white font-bold text-sm">P</span>
          </div>
          <span className="text-lg font-semibold text-gray-900">Paira Bot</span>
        </div>

        {/* Profile Dropdown */}
        <div className="relative">
          <button
            className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 transition-colors"
            onMouseEnter={() => setShowProfileDropdown(true)}
            onMouseLeave={() => setShowProfileDropdown(false)}
          >
            <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
              <User size={16} className="text-gray-600" />
            </div>
            <span className="text-sm font-medium text-gray-700">{user?.email}</span>
            <ChevronDown size={16} className="text-gray-400" />
          </button>

          {showProfileDropdown && (
            <div
              className="absolute right-0 top-full mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50"
              onMouseEnter={() => setShowProfileDropdown(true)}
              onMouseLeave={() => setShowProfileDropdown(false)}
            >
              <div className="px-4 py-2 border-b border-gray-100">
                <p className="text-sm font-medium text-gray-900">{user?.email}</p>
                <p className="text-xs text-gray-500">Monthly Plan</p>
              </div>
              <button className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                <Settings size={16} className="mr-3" />
                Account Settings
              </button>
              <button
                onClick={onLogout}
                className="w-full flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
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
    <div className="min-h-screen bg-gray-50">
      <Header user={user} onLogout={handleLogout} />

      <div className="max-w-6xl mx-auto p-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">
            Welcome back, {user?.email}!
          </h1>
          <p className="text-gray-600">
            Manage your subscription and download the latest version of Paira Bot.
          </p>
        </div>

        {/* Subscription Status Card */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Subscription Status</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Plan */}
            <div>
              <div className="text-sm text-gray-500 mb-2">Plan</div>
              <div className="text-xl font-semibold text-gray-900">{subscription?.plan || 'N/A'}</div>
            </div>

            {/* Status */}
            <div>
              <div className="text-sm text-gray-500 mb-2">Status</div>
              <div className="flex items-center">
                <div className={`flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                  subscription?.status === 'active'
                    ? 'bg-green-50 text-green-700'
                    : 'bg-yellow-50 text-yellow-700'
                }`}>
                  <CheckCircle size={14} className="mr-1" />
                  {subscription?.status || 'Inactive'}
                </div>
              </div>
            </div>

            {/* Expires */}
            <div>
              <div className="text-sm text-gray-500 mb-2">Expires</div>
              <div className="flex items-center text-xl font-semibold text-gray-900">
                <Calendar size={18} className="mr-2 text-gray-400" />
                {subscription?.current_period_end
                  ? new Date(subscription.current_period_end).toLocaleDateString()
                  : 'N/A'
                }
              </div>
            </div>
          </div>
        </div>

        {/* Download Section */}
        {subscription?.status === 'active' ? (
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Download Paira Bot</h3>
                <p className="text-gray-600">Get the latest version of Paira Bot Desktop App.</p>
              </div>
              <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
                <Download size={20} className="text-blue-500" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Windows Download */}
              <div className="border border-gray-200 rounded-xl p-6 hover:border-blue-200 hover:bg-blue-50/30 transition-all duration-200">
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                    <Monitor size={18} className="text-blue-600" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">Download for Windows</div>
                    <div className="text-sm text-gray-500">Windows 10/11</div>
                  </div>
                </div>
                <div className="text-xs text-gray-500 mb-4">MSI Installer • ~70MB download</div>
                <a
                  href="/paira-bot-setup.msi"
                  download="paira-bot-setup.msi"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center"
                >
                  <Download size={16} className="mr-2" />
                  Download
                </a>
              </div>

              {/* Other Platforms */}
              <div className="border border-gray-200 rounded-xl p-6 hover:border-gray-300 transition-all duration-200">
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center mr-3">
                    <Smartphone size={18} className="text-gray-600" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">Other Platforms</div>
                    <div className="text-sm text-gray-500">macOS, Linux, Mobile</div>
                  </div>
                </div>
                <div className="text-xs text-gray-500 mb-4">Coming soon</div>
                <button
                  onClick={() => window.open('https://paira.live/download', '_blank')}
                  className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 px-4 rounded-lg transition-colors duration-200"
                >
                  View Options
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="text-center">
              <div className="text-red-500 mb-3">
                <svg className="w-10 h-10 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Active Subscription</h3>
              <p className="text-gray-600 mb-4">You need an active subscription to download Paira Bot.</p>
              <button
                onClick={() => router.push('/')}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition-colors duration-200"
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