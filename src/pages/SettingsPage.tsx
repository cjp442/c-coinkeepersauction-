import { useAuth } from '../contexts/AuthContext'

export default function SettingsPage() {
  const { user } = useAuth()

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-8">Settings</h1>

      {user ? (
        <div className="bg-slate-800 p-6 rounded-lg">
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">Username</label>
            <p className="text-white">{user.username}</p>
          </div>
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">Email</label>
            <p className="text-white">{user.email}</p>
          </div>
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">Role</label>
            <p className="text-white capitalize">{user.role}</p>
          </div>
        </div>
      ) : (
        <div className="bg-slate-800 p-6 rounded-lg">
          <p className="text-slate-400">Please log in to access settings</p>
        </div>
      )}
    </div>
  )
}
