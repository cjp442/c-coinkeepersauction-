import { Check, Crown, Star, Mic2 } from 'lucide-react'
import { Link } from 'react-router-dom'

interface Plan {
  id: string
  icon: JSX.Element
  name: string
  tagline: string
  price: string
  period: string
  cta: string
  ctaTo: string
  highlighted: boolean
  features: string[]
}

const plans: Plan[] = [
  {
    id: 'standard',
    icon: <Star size={22} className="text-amber-400" />,
    name: 'Standard Member',
    tagline: 'Saddle Up for Free',
    price: 'Free',
    period: 'Forever',
    cta: 'Claim Your Seat',
    ctaTo: '/register',
    highlighted: false,
    features: [
      'View live auction streams',
      'Text chat in all rooms',
      'Basic 2D avatar',
      'Access to public saloon rooms',
      'Spin the randomizer wheel',
      'Buy Keeper Coins 🪙',
      'Personal room with safe',
    ],
  },
  {
    id: 'vip',
    icon: <Crown size={22} className="text-amber-900" />,
    name: 'VIP Member',
    tagline: 'Ride First Class',
    price: '29 Keeper Coins',
    period: '/mo',
    cta: 'Join the Elite',
    ctaTo: '/register?plan=vip',
    highlighted: true,
    features: [
      'All Standard features',
      'Voice & headset chat with hosts & VIPs',
      'Customizable 3D avatar',
      'Private VIP gathering rooms',
      'Pool & card tournaments',
      'Host follow & bookmarks',
      'Priority stream seating',
      'Custom room decorations',
      'Exclusive VIP badge',
    ],
  },
  {
    id: 'host',
    icon: <Mic2 size={22} className="text-amber-400" />,
    name: 'Host',
    tagline: 'Deal the Cards',
    price: 'Apply',
    period: 'Contact us',
    cta: 'Apply as Host',
    ctaTo: '/apply-host',
    highlighted: false,
    features: [
      'All VIP features',
      'Host live auction streams',
      'Stream from phone or PC',
      'Custom game creation (admin approved)',
      'Room customization tools',
      'Revenue sharing in Keeper Coins 🪙',
      'Advanced analytics',
      'Dedicated support',
    ],
  },
]

export default function MembershipPlans() {
  return (
    <section className="bg-slate-950 border-t border-amber-900/30 py-20">
      <div className="max-w-7xl mx-auto px-4">
        {/* Heading */}
        <div className="text-center mb-14">
          <p className="text-amber-600 text-xs uppercase tracking-widest font-semibold mb-2">
            Choose Your Standing
          </p>
          <h2 className="text-4xl font-extrabold text-amber-100">
            Membership at The Keeper's Saloon
          </h2>
          <p className="text-amber-300/60 mt-3 text-sm max-w-xl mx-auto">
            Every soul that darkens our doorstep chooses their place at the bar.
            Pick your tier and make yourself at home, partner.
          </p>
        </div>

        {/* Cards grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`relative rounded-2xl border flex flex-col transition-all ${
                plan.highlighted
                  ? 'bg-gradient-to-b from-amber-600 to-amber-700 border-amber-400 shadow-2xl shadow-amber-900/50 md:scale-105 md:-translate-y-2'
                  : 'bg-slate-900 border-slate-700 hover:border-amber-800'
              }`}
            >
              {plan.highlighted && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-red-800 text-red-100 text-xs font-bold uppercase tracking-widest px-4 py-1 rounded-full border border-red-600 shadow">
                  Most Popular
                </div>
              )}

              <div className="p-8 flex flex-col flex-1">
                {/* Icon + name */}
                <div className="flex items-center gap-2 mb-1">
                  {plan.icon}
                  <span className={`font-bold text-lg ${plan.highlighted ? 'text-amber-950' : 'text-amber-200'}`}>
                    {plan.name}
                  </span>
                </div>
                <p className={`text-sm italic mb-6 ${plan.highlighted ? 'text-amber-900' : 'text-amber-500'}`}>
                  "{plan.tagline}"
                </p>

                {/* Price */}
                <div className="mb-6">
                  <span className={`text-3xl font-extrabold ${plan.highlighted ? 'text-amber-950' : 'text-amber-100'}`}>
                    {plan.price}
                  </span>
                  <span className={`text-sm ml-1.5 ${plan.highlighted ? 'text-amber-900' : 'text-slate-400'}`}>
                    {plan.period}
                  </span>
                  {plan.id === 'vip' && (
                    <p className="text-xs text-amber-900/80 mt-1">🪙 Keeper Coins only — no real money</p>
                  )}
                </div>

                {/* CTA button */}
                <Link
                  to={plan.ctaTo}
                  className={`block text-center w-full py-2.5 rounded-lg font-bold text-sm mb-8 transition-all ${
                    plan.highlighted
                      ? 'bg-slate-950 text-amber-400 hover:bg-slate-900'
                      : 'bg-amber-700 hover:bg-amber-600 text-amber-100'
                  }`}
                >
                  {plan.cta}
                </Link>

                {/* Divider */}
                <div className={`h-px mb-6 ${plan.highlighted ? 'bg-amber-500/40' : 'bg-slate-700'}`} />

                {/* Features */}
                <ul className="space-y-3 flex-1">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2.5 text-sm">
                      <Check
                        size={16}
                        className={`mt-0.5 shrink-0 ${plan.highlighted ? 'text-amber-950' : 'text-amber-500'}`}
                      />
                      <span className={plan.highlighted ? 'text-amber-950' : 'text-slate-300'}>
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>

        {/* Disclaimer */}
        <p className="text-center text-amber-700/70 text-xs mt-12 border-t border-amber-900/30 pt-6 max-w-2xl mx-auto">
          🪙 All prizes and transactions use Keeper Coins only. No real money changes hands.
          Keeper Coins have no cash value outside The Keeper's Saloon.
        </p>
      </div>
    </section>
  )
}
