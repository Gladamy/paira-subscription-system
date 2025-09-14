'use client';

import { useState } from 'react';
import AuthModal from '@/components/AuthModal';
import PricingSection from '@/components/PricingSection';
import HeroSection from '@/components/HeroSection';
import FeaturesSection from '@/components/FeaturesSection';

export default function Home() {
  const [showAuth, setShowAuth] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-slate-900">Paira</h1>
              <span className="ml-2 text-sm text-slate-500">Bot</span>
            </div>
            <button
              onClick={() => setShowAuth(true)}
              className="bg-slate-900 text-white px-4 py-2 rounded-lg font-medium hover:bg-slate-800 transition-colors"
            >
              Get Started
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main>
        <HeroSection onGetStarted={() => setShowAuth(true)} />
        <FeaturesSection />
        <PricingSection onSelectPlan={() => setShowAuth(true)} />
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h3 className="text-xl font-semibold mb-4">Ready to automate your trading?</h3>
            <p className="text-slate-300 mb-6">Join thousands of traders using Paira Bot</p>
            <button
              onClick={() => setShowAuth(true)}
              className="bg-blue-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Start Free Trial
            </button>
          </div>
          <div className="mt-8 pt-8 border-t border-slate-700 text-center text-slate-400">
            <p>&copy; 2025 Paira Bot. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Auth Modal */}
      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
    </div>
  );
}
