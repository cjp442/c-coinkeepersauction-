import { useState, useMemo } from 'react'
import { Search, ChevronUp, ChevronDown, BookOpen, Ban } from 'lucide-react'

interface Member {
  id: string
  username: string
  email: string
  role: 'user' | 'vip' | 'host' | 'admin'
  status: 'active' | 'banned' | 'suspended'
  joinDate: string
  balance: number
}

const INITIAL_MEMBERS: Member[] = [
  { id: '1', username: 'darkwolf92',   email: 'darkwolf92@example.com',   role: 'vip',   status: 'active',    joinDate: '2024-01-15', balance: 1250.00 },
  { id: '2', username: 'neon_rider',   email: 'neonrider@example.com',    role: 'user',  status: 'active',    joinDate: '2024-02-03', balance: 340.50  },
  { id: '3', username: 'hostmaster_x', email: 'hostx@example.com',        role: 'host',  status: 'active',    joinDate: '2023-11-20', balance: 4800.00 },
  { id: '4', username: 'silver_fox',   email: 'silverfox@example.com',    role: 'user',  status: 'banned',    joinDate: '2024-03-07', balance: 0.00    },
  { id: '5', username: 'quantum_leap', email: 'quantum@example.com',      role: 'vip',   status: 'active',    joinDate: '2024-01-29', balance: 2100.75 },
  { id: '6', username: 'prism_blade',  email: 'prismblade@example.com',   role: 'user',  status: 'suspended', joinDate: '2024-04-11', balance: 120.00  },
  { id: '7', username: 'aurora_sky',   email: 'aurorasky@example.com',    role: 'host',  status: 'active',    joinDate: '2023-09-05', balance: 6300.00 },
  { id: '8', username: 'void_runner',  email: 'voidrunner@example.com',   role: 'user',  status: 'active',    joinDate: '2024-05-18', balance: 75.25   },
  { id: '9', username: 'cryptic_owl',  email: 'crypticowl@example.com',   role: 'vip',   status: 'active',    joinDate: '2024-02-22', balance: 990.00  },
  { id: '10', username: 'starfall99', email: 'starfall99@example.com',    role: 'user',  status: 'active',    joinDate: '2024-06-01', balance: 450.00  },
  { id: '11', username: 'ironclad',   email: 'ironclad@example.com',      role: 'admin', status: 'active',    joinDate: '2023-08-10', balance: 9999.99 },
  { id: '12', username: 'pixel_punk',  email: 'pixelpunk@example.com',    role: 'user',  status: 'active',    joinDate: '2024-07-04', balance: 200.00  },
]

type SortKey = 'username' | 'email' | 'role' | 'balance'
type SortDir = 'asc' | 'desc'

const PAGE_SIZE = 5

const ROLE_COLORS: Record<Member['role'], string> = {
  admin: 'text-red-400',
  host:  'text-amber-400',
  vip:   'text-purple-400',
  user:  'text-slate-300',
}

const STATUS_COLORS: Record<Member['status'], string> = {
  active:    'bg-green-500/20 text-green-400',
  banned:    'bg-red-500/20 text-red-400',
  suspended: 'bg-yellow-500/20 text-yellow-400',
}

interface Props {
  onViewLedger?: (userId: string) => void
}

export default function AdminMemberList({ onViewLedger }: Props) {
  const [members, setMembers] = useState<Member[]>(INITIAL_MEMBERS)
  const [search, setSearch] = useState('')
  const [sortKey, setSortKey] = useState<SortKey>('username')
  const [sortDir, setSortDir] = useState<SortDir>('asc')
  const [page, setPage] = useState(1)
  const [confirmBan, setConfirmBan] = useState<string | null>(null)

  const handleSort = (key: SortKey) => {
    if (key === sortKey) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key)
      setSortDir('asc')
    }
    setPage(1)
  }

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return members.filter(
      (m) => m.username.toLowerCase().includes(q) || m.email.toLowerCase().includes(q)
    )
  }, [members, search])

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      const av = a[sortKey]
      const bv = b[sortKey]
      const cmp = typeof av === 'number' ? av - (bv as number) : String(av).localeCompare(String(bv))
      return sortDir === 'asc' ? cmp : -cmp
    })
  }, [filtered, sortKey, sortDir])

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE))
  const paginated = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const toggleBan = (id: string) => {
    setMembers((prev) =>
      prev.map((m) =>
        m.id === id
          ? { ...m, status: m.status === 'banned' ? 'active' : 'banned' }
          : m
      )
    )
    setConfirmBan(null)
  }

  const SortIcon = ({ col }: { col: SortKey }) => {
    if (sortKey !== col) return <ChevronUp size={12} className="text-slate-600" />
    return sortDir === 'asc'
      ? <ChevronUp size={12} className="text-amber-500" />
      : <ChevronDown size={12} className="text-amber-500" />
  }

  return (
    <div className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
      <div className="p-4 border-b border-slate-700 flex items-center gap-3">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by username or email…"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            className="w-full bg-slate-700 border border-slate-600 rounded pl-8 pr-3 py-2 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-amber-500"
          />
        </div>
        <span className="text-xs text-slate-400">{filtered.length} members</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-900/50 text-slate-400 text-xs uppercase">
            <tr>
              {(['username', 'email', 'role', 'balance'] as SortKey[]).map((col) => (
                <th
                  key={col}
                  onClick={() => handleSort(col)}
                  className="px-4 py-3 text-left cursor-pointer hover:text-amber-500 select-none"
                >
                  <span className="flex items-center gap-1">
                    {col} <SortIcon col={col} />
                  </span>
                </th>
              ))}
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-left">Joined</th>
              <th className="px-4 py-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700/50">
            {paginated.map((m) => (
              <tr key={m.id} className="hover:bg-slate-700/30 transition-colors">
                <td className="px-4 py-3 font-medium text-white">{m.username}</td>
                <td className="px-4 py-3 text-slate-300">{m.email}</td>
                <td className={`px-4 py-3 font-medium capitalize ${ROLE_COLORS[m.role]}`}>{m.role}</td>
                <td className="px-4 py-3 text-white">${m.balance.toFixed(2)}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${STATUS_COLORS[m.status]}`}>
                    {m.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-slate-400">{m.joinDate}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    {confirmBan === m.id ? (
                      <>
                        <span className="text-xs text-red-400 mr-1">Confirm?</span>
                        <button
                          onClick={() => toggleBan(m.id)}
                          className="text-xs bg-red-600 hover:bg-red-500 text-white px-2 py-1 rounded transition-colors"
                        >
                          Yes
                        </button>
                        <button
                          onClick={() => setConfirmBan(null)}
                          className="text-xs bg-slate-600 hover:bg-slate-500 text-white px-2 py-1 rounded transition-colors"
                        >
                          No
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => setConfirmBan(m.id)}
                        className={`flex items-center gap-1 text-xs px-2 py-1 rounded transition-colors ${
                          m.status === 'banned'
                            ? 'bg-green-700/40 hover:bg-green-700/60 text-green-400'
                            : 'bg-red-700/40 hover:bg-red-700/60 text-red-400'
                        }`}
                      >
                        <Ban size={11} />
                        {m.status === 'banned' ? 'Unban' : 'Ban'}
                      </button>
                    )}
                    <button
                      onClick={() => onViewLedger?.(m.id)}
                      className="flex items-center gap-1 text-xs bg-slate-700 hover:bg-slate-600 text-slate-300 px-2 py-1 rounded transition-colors"
                    >
                      <BookOpen size={11} /> Ledger
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {paginated.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-slate-400">No members found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="p-3 border-t border-slate-700 flex items-center justify-between text-xs text-slate-400">
        <span>
          Page {page} of {totalPages}
        </span>
        <div className="flex gap-1">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => setPage(p)}
              className={`w-7 h-7 rounded text-xs font-medium transition-colors ${
                p === page
                  ? 'bg-amber-500 text-slate-900'
                  : 'bg-slate-700 hover:bg-slate-600 text-slate-300'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
