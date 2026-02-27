import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { ArrowLeft, Info } from 'lucide-react'
import { AuctionCategory } from '../types'
import { createAuction } from '../services/auctionService'
import { useAuth } from '../contexts/AuthContext'

interface FormData {
  title: string
  description: string
  category: AuctionCategory
  starting_bid: number
  reserve_price: string
  snipe_protection_minutes: number
  starts_at: string
  ends_at: string
}

const CATEGORIES: { label: string; value: AuctionCategory }[] = [
  { label: '🪙 Coins', value: 'coins' },
  { label: '🏆 Bullion', value: 'bullion' },
  { label: '🎖️ Collectibles', value: 'collectibles' },
  { label: '💍 Jewelry', value: 'jewelry' },
  { label: '🎨 Art', value: 'art' },
  { label: '📦 Other', value: 'other' },
]

function isoLocalDefault(offsetMinutes: number): string {
  const d = new Date(Date.now() + offsetMinutes * 60000)
  d.setSeconds(0, 0)
  return d.toISOString().slice(0, 16)
}

export default function CreateAuctionPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    defaultValues: {
      category: 'coins',
      starting_bid: 100,
      snipe_protection_minutes: 2,
      starts_at: isoLocalDefault(30),
      ends_at: isoLocalDefault(60 * 24),
    },
  })

  const startsAt = watch('starts_at')

  if (!user) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center">
        <p className="text-slate-400">You must be logged in to create an auction.</p>
      </div>
    )
  }

  if (user.role !== 'host' && user.role !== 'admin') {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center">
        <p className="text-slate-400">Only hosts and admins can create auctions.</p>
        <p className="text-slate-500 text-sm mt-2">Upgrade to a Host membership to get started.</p>
      </div>
    )
  }

  const onSubmit = (data: FormData) => {
    setError(null)
    try {
      const startsDate = new Date(data.starts_at)
      const endsDate = new Date(data.ends_at)
      if (endsDate <= startsDate) {
        setError('End time must be after start time.')
        return
      }

      createAuction({
        title: data.title,
        description: data.description,
        category: data.category,
        starting_bid: Number(data.starting_bid),
        reserve_price: data.reserve_price ? Number(data.reserve_price) : undefined,
        snipe_protection_minutes: Number(data.snipe_protection_minutes),
        starts_at: startsDate.toISOString(),
        ends_at: endsDate.toISOString(),
        host_id: user.id,
        host_name: user.username,
      })
      setSuccess(true)
      setTimeout(() => navigate('/auctions'), 1500)
    } catch (err) {
      setError('Failed to create auction. Please try again.')
    }
  }

  if (success) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center">
        <div className="text-5xl mb-4">✅</div>
        <h2 className="text-2xl font-bold text-white mb-2">Auction Created!</h2>
        <p className="text-slate-400">Redirecting to auctions...</p>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-8">
        <button
          onClick={() => navigate('/auctions')}
          className="text-slate-400 hover:text-white transition"
          aria-label="Back"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-white">Create Auction</h1>
          <p className="text-slate-400 text-sm">List a new item for bidding</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic info */}
        <div className="bg-slate-800 rounded-lg p-6 space-y-4">
          <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wide">Item Details</h2>

          <div>
            <label className="text-sm text-slate-300 block mb-1">Title *</label>
            <input
              {...register('title', { required: 'Title is required', maxLength: 120 })}
              placeholder="e.g. Morgan Silver Dollar 1921 MS-65"
              className="w-full bg-slate-700 border border-slate-600 text-white rounded px-3 py-2 text-sm focus:outline-none focus:border-amber-500"
            />
            {errors.title && <p className="text-red-400 text-xs mt-1">{errors.title.message}</p>}
          </div>

          <div>
            <label className="text-sm text-slate-300 block mb-1">Description *</label>
            <textarea
              {...register('description', { required: 'Description is required' })}
              rows={4}
              placeholder="Describe the item, condition, grading, provenance..."
              className="w-full bg-slate-700 border border-slate-600 text-white rounded px-3 py-2 text-sm focus:outline-none focus:border-amber-500 resize-none"
            />
            {errors.description && (
              <p className="text-red-400 text-xs mt-1">{errors.description.message}</p>
            )}
          </div>

          <div>
            <label className="text-sm text-slate-300 block mb-1">Category *</label>
            <select
              {...register('category', { required: true })}
              className="w-full bg-slate-700 border border-slate-600 text-white rounded px-3 py-2 text-sm focus:outline-none focus:border-amber-500"
            >
              {CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Pricing */}
        <div className="bg-slate-800 rounded-lg p-6 space-y-4">
          <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wide">Pricing</h2>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-slate-300 block mb-1">Starting Bid (tokens) *</label>
              <input
                type="number"
                min={1}
                {...register('starting_bid', { required: true, min: 1 })}
                className="w-full bg-slate-700 border border-slate-600 text-white rounded px-3 py-2 text-sm focus:outline-none focus:border-amber-500"
              />
              {errors.starting_bid && (
                <p className="text-red-400 text-xs mt-1">Starting bid must be at least 1</p>
              )}
            </div>
            <div>
              <label className="text-sm text-slate-300 block mb-1">
                Reserve Price (optional)
                <span
                  title="Minimum price the item will sell for. Kept secret from bidders."
                  className="ml-1 cursor-help"
                >
                  <Info size={12} className="inline text-slate-500" />
                </span>
              </label>
              <input
                type="number"
                min={1}
                {...register('reserve_price')}
                placeholder="No reserve"
                className="w-full bg-slate-700 border border-slate-600 text-white rounded px-3 py-2 text-sm focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>
        </div>

        {/* Timing */}
        <div className="bg-slate-800 rounded-lg p-6 space-y-4">
          <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wide">Schedule</h2>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-slate-300 block mb-1">Starts At *</label>
              <input
                type="datetime-local"
                {...register('starts_at', { required: true })}
                className="w-full bg-slate-700 border border-slate-600 text-white rounded px-3 py-2 text-sm focus:outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="text-sm text-slate-300 block mb-1">Ends At *</label>
              <input
                type="datetime-local"
                min={startsAt}
                {...register('ends_at', { required: true })}
                className="w-full bg-slate-700 border border-slate-600 text-white rounded px-3 py-2 text-sm focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div>
            <label className="text-sm text-slate-300 block mb-1">
              Snipe Protection (minutes)
              <span
                title="Auction auto-extends by this many minutes if a bid is placed in the final window."
                className="ml-1 cursor-help"
              >
                <Info size={12} className="inline text-slate-500" />
              </span>
            </label>
            <select
              {...register('snipe_protection_minutes')}
              className="w-full bg-slate-700 border border-slate-600 text-white rounded px-3 py-2 text-sm focus:outline-none focus:border-amber-500"
            >
              <option value={0}>None</option>
              <option value={1}>1 minute</option>
              <option value={2}>2 minutes</option>
              <option value={5}>5 minutes</option>
              <option value={10}>10 minutes</option>
            </select>
          </div>
        </div>

        {error && (
          <p className="text-red-400 text-sm bg-red-900/30 border border-red-700 rounded px-4 py-3">
            {error}
          </p>
        )}

        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => navigate('/auctions')}
            className="flex-1 bg-slate-700 hover:bg-slate-600 text-white py-3 rounded-lg transition font-medium"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 bg-amber-600 hover:bg-amber-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white py-3 rounded-lg transition font-medium"
          >
            {isSubmitting ? 'Creating...' : '🔨 Create Auction'}
          </button>
        </div>
      </form>
    </div>
  )
}
