'use client';

interface HeroSectionProps {
  onGetStarted: () => void;
}

export default function HeroSection({ onGetStarted }: HeroSectionProps) {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto text-center">
        <h1 className="text-5xl md:text-6xl font-bold text-slate-900 mb-6">
          Professional Roblox
          <span className="text-blue-600 block">Trading Automation</span>
        </h1>
        <p className="text-xl text-slate-600 mb-8 max-w-3xl mx-auto">
          Automate your Roblox Limited trading with advanced algorithms, real-time price tracking,
          and HWID-based licensing. Join thousands of successful traders.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={onGetStarted}
            className="bg-blue-600 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-blue-700 transition-colors shadow-lg"
          >
            Start Free Trial
          </button>
          <button className="border-2 border-slate-300 text-slate-700 px-8 py-4 rounded-lg font-semibold text-lg hover:border-slate-400 transition-colors">
            Watch Demo
          </button>
        </div>
        <div className="mt-12 flex justify-center">
          <div className="bg-white rounded-lg shadow-lg p-6 border border-slate-200">
            <div className="flex items-center space-x-8">
              <div className="text-center">
                <div className="text-2xl font-bold text-slate-900">$10K+</div>
                <div className="text-sm text-slate-600">Monthly Volume</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-slate-900">50K+</div>
                <div className="text-sm text-slate-600">Active Users</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-slate-900">99.9%</div>
                <div className="text-sm text-slate-600">Uptime</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}