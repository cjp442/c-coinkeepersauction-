import { Check } from 'lucide-react'

export default function MembershipPlans() {
  const plans = [
    {
      name: 'Basic',
      price: 'Free',
      period: 'Forever',
      features: [
        'View auctions',
        'Text chat',
        'Limited game access',
        'Basic avatar',
      ],
    },
    {
      name: 'VIP',
      price: 29.99,
      period: 'Monthly',
      features: [
        'All Basic features',
        'Place bids',
        'Voice chat',
        'Premium avatar',
        'Private rooms',
        'Co-host streams',
      ],
      highlighted: true,
    },
    {
      name: 'Host',
      price: 'Apply',
      period: 'Call us',
      features: [
        'All VIP features',
        'Stream hosting',
        'Room customization',
        'Advanced analytics',
        'Revenue sharing',
        'Dedicated support',
      ],
    },
  ]

  return (
    <section className="max-w-7xl mx-auto px-4 py-16">
      <h2 className="text-3xl font-bold mb-12 text-center">Membership Plans</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {plans.map((plan) => (
          <div
            key={plan.name}
            className={`p-8 rounded-lg transition ${
              plan.highlighted
                ? 'bg-amber-600 transform md:scale-105'
                : 'bg-slate-800 hover:bg-slate-700'
            }`}
          >
            <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
            <div className="mb-6">
              <span className="text-4xl font-bold">${plan.price}</span>
              <span className="text-sm ml-2">{plan.period}</span>
            </div>
            <button
              className={`w-full py-2 rounded font-semibold mb-6 transition ${
                plan.highlighted
                  ? 'bg-white text-amber-600 hover:bg-amber-50'
                  : 'bg-amber-600 hover:bg-amber-700 text-white'
              }`}
            >
              {plan.name === 'Host' ? 'Apply Now' : 'Choose Plan'}
            </button>
            <ul className="space-y-3">
              {plan.features.map((feature, idx) => (
                <li key={idx} className="flex items-center gap-2">
                  <Check size={20} className="text-green-400" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  )
}
