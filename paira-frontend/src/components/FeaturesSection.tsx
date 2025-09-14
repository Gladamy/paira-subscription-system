export default function FeaturesSection() {
  const features = [
    {
      title: 'Advanced Trading Algorithms',
      description: 'AI-powered trading strategies that maximize profits while minimizing risk.',
      icon: '🤖'
    },
    {
      title: 'Real-Time Price Tracking',
      description: 'Live Rolimons integration with instant price updates and market analysis.',
      icon: '📈'
    },
    {
      title: 'HWID-Based Security',
      description: 'Device-specific licensing ensures your account stays secure and protected.',
      icon: '🔒'
    },
    {
      title: '24/7 Automation',
      description: 'Run trades automatically around the clock with smart scheduling.',
      icon: '⚡'
    },
    {
      title: 'Risk Management',
      description: 'Built-in stop-loss, take-profit, and position sizing controls.',
      icon: '🛡️'
    },
    {
      title: 'Analytics Dashboard',
      description: 'Detailed trading statistics and performance metrics.',
      icon: '📊'
    }
  ];

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
            Why Choose Paira Bot?
          </h2>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            Professional-grade trading automation with enterprise-level security and reliability.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="bg-slate-50 rounded-lg p-6 border border-slate-200 hover:shadow-lg transition-shadow">
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">{feature.title}</h3>
              <p className="text-slate-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}