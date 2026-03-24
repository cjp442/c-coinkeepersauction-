import { useState, useEffect } from 'react'
import { Heart } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { toast } from 'sonner'

export interface FollowButtonProps {
  hostId: string
  hostName: string
  size?: 'sm' | 'md'
}

const STORAGE_KEY = 'followed_hosts'

/**
 * Deterministic hash of a string used to seed a consistent mock follower count
 * for each hostId during development (no real follower data exists yet).
 */
function hashString(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 31 + str.charCodeAt(i)) >>> 0
  }
  return hash
}

function getMockFollowerCount(hostId: string): number {
  return Math.floor((hashString(hostId) % 950) + 50)
}

function loadFollowed(): Set<string> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    const parsed: unknown = raw ? JSON.parse(raw) : []
    if (Array.isArray(parsed)) {
      return new Set(parsed.filter((v): v is string => typeof v === 'string'))
    }
  } catch {
    // Silent failure is acceptable here: corrupt localStorage data is non-critical
    // and a fresh empty set is a safe fallback that allows the UI to continue working.
  }
  return new Set()
}

function saveFollowed(ids: Set<string>): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(ids)))
}

export default function FollowButton({ hostId, hostName, size = 'md' }: FollowButtonProps) {
  const { user } = useAuth()
  const [isFollowing, setIsFollowing] = useState(false)
  const [animating, setAnimating] = useState(false)
  const mockCount = getMockFollowerCount(hostId)

  useEffect(() => {
    const followed = loadFollowed()
    setIsFollowing(followed.has(hostId))
  }, [hostId])

  const handleClick = () => {
    if (!user) {
      toast.error('Log in to follow hosts')
      return
    }

    const followed = loadFollowed()
    const next = isFollowing
      ? (followed.delete(hostId), followed)
      : (followed.add(hostId), followed)

    saveFollowed(next)
    setIsFollowing(!isFollowing)

    if (!isFollowing) {
      setAnimating(true)
      setTimeout(() => setAnimating(false), 400)
      toast.success(`Following ${hostName}`)
    } else {
      toast(`Unfollowed ${hostName}`)
    }
  }

  const sizeClasses =
    size === 'sm'
      ? 'px-2 py-1 text-xs gap-1'
      : 'px-3 py-1.5 text-sm gap-1.5'

  const iconSize = size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4'

  return (
    <button
      onClick={handleClick}
      aria-label={isFollowing ? `Unfollow ${hostName}` : `Follow ${hostName}`}
      className={`inline-flex items-center rounded-full border font-medium transition-all duration-150
        ${sizeClasses}
        ${
          isFollowing
            ? 'bg-red-900/40 border-red-700 text-red-300 hover:bg-red-900/60'
            : 'bg-slate-800 border-slate-700 text-slate-300 hover:border-red-700 hover:text-red-300'
        }
        ${animating ? 'scale-110' : 'scale-100'}
      `}
    >
      <Heart
        className={`${iconSize} transition-all ${
          isFollowing ? 'fill-red-500 text-red-500' : 'text-current'
        } ${animating ? 'scale-125' : 'scale-100'}`}
      />
      <span>{isFollowing ? 'Following' : 'Follow'}</span>
      <span className="opacity-50">{(mockCount + (isFollowing ? 1 : 0)).toLocaleString()}</span>
    </button>
  )
}
