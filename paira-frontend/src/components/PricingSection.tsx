'use client';

interface PricingSectionProps {
  onSelectPlan: () => void;
}

export default function PricingSection({ onSelectPlan }: PricingSectionProps) {
  const plans = [
    {
      name: 'Monthly',
      price: '$6.99',
      period: 'month',
      description: 'Perfect for getting started',
      features: [
        'Full bot functionality',
        'HWID-based licensing',
        'Priority support',
        'Cancel anytime'
      ],
      popular: false
    },
    {
      name: 'Annual',
      price: '$54.99',
      period: 'year',
      originalPrice: '$83.88',
      savings: 'Save 34%',
      description: 'Best value for serious traders',
      features: [
        'All Monthly features',
        '2 months free',
        'Exclusive beta access',
        'Premium support'
      ],
      popular: true
    }
  ];

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
            Choose Your Plan
          </h2>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            Start your trading automation journey with our secure, professional-grade bot.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`bg-white rounded-lg shadow-lg border-2 transition-all hover:shadow-xl ${
                plan.popular ? 'border-blue-500 scale-105' : 'border-slate-200'
              }`}
            >
              {plan.popular && (
                <div className="bg-blue-500 text-white text-center py-2 rounded-t-lg font-semibold">
                  Most Popular
                </div>
              )}

              <div className="p-8">
                <h3 className="text-2xl font-bold text-slate-900 mb-2">{plan.name}</h3>
                <p className="text-slate-600 mb-4">{plan.description}</p>

                <div className="mb-6">
                  <div className="flex items-baseline">
                    <span className="text-4xl font-bold text-slate-900">{plan.price}</span>
                    <span className="text-slate-600 ml-2">per {plan.period}</span>
                  </div>
                  {plan.originalPrice && (
                    <div className="mt-2">
                      <span className="text-slate-500 line-through">{plan.originalPrice}</span>
                      <span className="text-green-600 font-semibold ml-2">{plan.savings}</span>
                    </div>
                  )}
                </div>

                <ul className="mb-8 space-y-3">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center text-slate-700">
                      <svg className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>

                <button
                  onClick={onSelectPlan}
                  className={`w-full py-3 px-6 rounded-lg font-semibold transition-colors ${
                    plan.popular
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-slate-900 text-white hover:bg-slate-800'
                  }`}
                >
                  Get Started
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <p className="text-slate-600">
            30-day money-back guarantee • Secure payment via Stripe
          </p>
        </div>
      </div>
    </section>
  );
}