'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Bell,
  Settings,
  Download,
  Monitor,
  Smartphone,
  Check,
  User,
  LogOut,
  ChevronDown
} from "lucide-react";

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
    <div className="min-h-screen bg-slate-50" style={{ fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
      <Header user={user} onLogout={handleLogout} />

      <div className="max-w-6xl mx-auto p-8">
        {/* Enhanced Greeting Card */}
        <Card className="bg-glass-card/80 border-glass-border/60 shadow-glass rounded-2xl backdrop-blur-sm mb-8">
          <CardContent className="p-8">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <h1 className="text-3xl font-semibold text-sidebar-active-text">
                  Welcome back!
                </h1>
                <p className="text-warm-muted">{user?.email}</p>
                <p className="text-warm-muted mt-3 max-w-2xl">
                  Manage your subscription and download the latest version of Paira Bot.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="icon-button" size="icon">
                  <Bell className="w-4 h-4" />
                </Button>
                <Button variant="icon-button" size="icon">
                  <Settings className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Subscription Status */}
        <Card className="bg-glass-card/80 border-glass-border/60 shadow-glass rounded-2xl backdrop-blur-sm mb-8">
          <CardContent className="p-8">
            <h2 className="text-xl font-semibold text-sidebar-active-text mb-6">Subscription Status</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <p className="text-sm text-warm-muted">Status</p>
                <div className="flex items-center gap-2">
                  <Badge className="bg-green-50 text-green-700 hover:bg-green-50">
                    <Check className="w-3 h-3 mr-1" />
                    {subscription?.status === 'active' ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-warm-muted">Current Plan</p>
                <p className="font-semibold text-sidebar-active-text">{subscription?.plan || 'N/A'}</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-warm-muted">Expires On</p>
                <p className="font-semibold text-sidebar-active-text">
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
          </CardContent>
        </Card>

        {/* Download Section */}
        {subscription?.status === 'active' ? (
          <Card className="bg-glass-card/80 border-glass-border/60 shadow-glass rounded-2xl backdrop-blur-sm">
            <CardContent className="p-8">
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold text-sidebar-active-text mb-2">Download Paira Bot</h2>
                  <p className="text-warm-muted">Get the latest version of Paira Bot Desktop App.</p>
                </div>

                {/* Windows Download */}
                <div className="bg-gradient-subtle rounded-xl p-6 border border-soft-border">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
                        <Monitor className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-sidebar-active-text">Download for Windows</h3>
                        <p className="text-sm text-warm-muted">Windows 10/11</p>
                        <p className="text-xs text-warm-muted mt-1">MSI Installer • ~70MB download</p>
                      </div>
                    </div>
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white px-6">
                      <Download className="w-4 h-4 mr-2" />
                      Download Now
                    </Button>
                  </div>
                </div>

                <Separator />

                {/* Other Platforms */}
                <div>
                  <h3 className="font-medium text-sidebar-active-text mb-4">Other Platforms</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-3 p-4 bg-gradient-subtle rounded-lg border border-soft-border opacity-60">
                      <Smartphone className="w-5 h-5 text-warm-muted" />
                      <div>
                        <p className="font-medium text-sidebar-active-text">macOS, Linux, Mobile</p>
                        <p className="text-sm text-warm-muted">Coming soon</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-center p-4">
                      <Button variant="action-chip" disabled>
                        View Options
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="bg-glass-card/80 border-glass-border/60 shadow-glass rounded-2xl backdrop-blur-sm">
            <CardContent className="p-8">
              <div className="text-center">
                <div className="w-20 h-20 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h2 className="text-xl font-bold text-sidebar-active-text mb-3 tracking-tight">No Active Subscription</h2>
                <p className="text-warm-muted mb-8 leading-relaxed max-w-md mx-auto">You need an active subscription to download Paira Bot.</p>
                <Button
                  onClick={() => router.push('/')}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-10"
                >
                  Subscribe Now
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}