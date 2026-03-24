import { useState } from 'react'

export interface AgeVerificationModalProps {
  onVerified: () => void
  onDenied: () => void
}

type Step = 'age' | 'terms' | 'id' | 'denied'

interface TermsState {
  isAdult: boolean
  understandsCoins: boolean
  readTerms: boolean
}

export default function AgeVerificationModal({
  onVerified,
  onDenied,
}: AgeVerificationModalProps) {
  const [step, setStep] = useState<Step>('age')
  const [terms, setTerms] = useState<TermsState>({
    isAdult: false,
    understandsCoins: false,
    readTerms: false,
  })

  const allChecked = terms.isAdult && terms.understandsCoins && terms.readTerms

  const handleVerified = () => {
    localStorage.setItem('age_verified', 'true')
    onVerified()
  }

  const toggleTerm = (key: keyof TermsState) => {
    setTerms(prev => ({ ...prev, [key]: !prev[key] }))
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-slate-900 border-2 border-amber-700 rounded-lg shadow-2xl shadow-black/60 overflow-hidden">
        {/* Decorative top bar */}
        <div className="bg-amber-800 px-4 py-2 text-center">
          <p className="text-amber-100 text-xs tracking-[0.3em] uppercase font-medium">
            ╔══════ The Keeper's Saloon ══════╗
          </p>
        </div>

        <div className="px-6 py-6">
          {/* Step: Age confirmation */}
          {step === 'age' && (
            <div className="text-center">
              <div className="text-5xl mb-4">🤠</div>
              <h2 className="text-2xl font-bold text-amber-400 font-serif mb-2">
                Hold it right there, partner
              </h2>
              <p className="text-slate-300 text-sm mb-6 leading-relaxed">
                This saloon is for adults only. You must be{' '}
                <span className="text-amber-400 font-semibold">21 or older</span> to enter.
              </p>
              <p className="text-amber-200 font-semibold text-lg mb-6">
                Are you 21 or older?
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setStep('terms')}
                  className="flex-1 bg-amber-700 hover:bg-amber-600 text-white font-bold py-3 rounded transition-colors"
                >
                  Yes, I am
                </button>
                <button
                  onClick={() => setStep('denied')}
                  className="flex-1 bg-slate-700 hover:bg-slate-600 text-slate-300 font-bold py-3 rounded transition-colors"
                >
                  No
                </button>
              </div>
              <p className="text-slate-600 text-xs mt-4 tracking-widest">
                ✦ ═════════════ ✦
              </p>
            </div>
          )}

          {/* Step: Terms */}
          {step === 'terms' && (
            <div>
              <div className="text-center mb-5">
                <div className="text-4xl mb-2">📜</div>
                <h2 className="text-xl font-bold text-amber-400 font-serif">
                  Sign the Register
                </h2>
                <p className="text-slate-400 text-sm mt-1">
                  Please confirm the following before entering
                </p>
              </div>

              <div className="space-y-4 mb-6">
                {(
                  [
                    { key: 'isAdult', label: 'I am 21+ years of age' },
                    {
                      key: 'understandsCoins',
                      label: 'I understand all transactions use Keeper Coins (virtual currency only)',
                    },
                    { key: 'readTerms', label: 'I have read the Terms of Service' },
                  ] as { key: keyof TermsState; label: string }[]
                ).map(({ key, label }) => (
                  <label
                    key={key}
                    className="flex items-start gap-3 cursor-pointer group"
                  >
                    <div
                      className={`mt-0.5 w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-colors ${
                        terms[key]
                          ? 'bg-amber-600 border-amber-500'
                          : 'border-slate-600 group-hover:border-amber-700'
                      }`}
                      onClick={() => toggleTerm(key)}
                    >
                      {terms[key] && (
                        <svg
                          className="w-3 h-3 text-white"
                          viewBox="0 0 12 12"
                          fill="none"
                        >
                          <path
                            d="M2 6l3 3 5-5"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      )}
                    </div>
                    <input
                      type="checkbox"
                      className="sr-only"
                      checked={terms[key]}
                      onChange={() => toggleTerm(key)}
                    />
                    <span className="text-slate-300 text-sm leading-relaxed">{label}</span>
                  </label>
                ))}
              </div>

              <button
                onClick={() => setStep('id')}
                disabled={!allChecked}
                className={`w-full font-bold py-3 rounded transition-all ${
                  allChecked
                    ? 'bg-amber-700 hover:bg-amber-600 text-white'
                    : 'bg-slate-700 text-slate-500 cursor-not-allowed'
                }`}
              >
                Continue
              </button>
            </div>
          )}

          {/* Step: ID Notice */}
          {step === 'id' && (
            <div className="text-center">
              <div className="text-4xl mb-3">🪪</div>
              <h2 className="text-xl font-bold text-amber-400 font-serif mb-3">
                ID Verification Notice
              </h2>
              <p className="text-slate-300 text-sm leading-relaxed mb-4">
                For host applications and VIP features, government-issued ID verification is
                required. Standard members can explore the site freely. Full access requires ID
                verification.
              </p>
              <div className="bg-slate-800 border border-slate-700 rounded p-3 mb-5 text-left">
                <p className="text-amber-400 text-xs font-semibold mb-1">🪙 Keeper Coins</p>
                <p className="text-slate-400 text-xs leading-relaxed">
                  All in-site currency is virtual. No real money is used or transferred on this
                  platform.
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleVerified}
                  className="flex-1 bg-slate-700 hover:bg-slate-600 text-slate-200 font-bold py-3 rounded text-sm transition-colors"
                >
                  Explore as Guest
                </button>
                <button
                  onClick={handleVerified}
                  className="flex-1 bg-amber-700 hover:bg-amber-600 text-white font-bold py-3 rounded text-sm transition-colors"
                >
                  Proceed to Sign Up
                </button>
              </div>
            </div>
          )}

          {/* Step: Denied */}
          {step === 'denied' && (
            <div className="text-center">
              <div className="text-5xl mb-4">🚫</div>
              <h2 className="text-xl font-bold text-red-400 font-serif mb-3">
                Sorry, Partner
              </h2>
              <p className="text-slate-300 text-sm leading-relaxed mb-6">
                You must be <span className="text-amber-400 font-semibold">21 or older</span>{' '}
                to enter The Keeper's Saloon. Come back when you're of age.
              </p>
              <button
                onClick={onDenied}
                className="w-full bg-red-800 hover:bg-red-700 text-white font-bold py-3 rounded transition-colors"
              >
                Leave Site
              </button>
            </div>
          )}
        </div>

        {/* Decorative bottom bar */}
        <div className="bg-amber-800/40 px-4 py-2 text-center">
          <p className="text-amber-700 text-xs tracking-[0.3em]">
            ╚══════════════════════════════╝
          </p>
        </div>
      </div>
    </div>
  )
}
