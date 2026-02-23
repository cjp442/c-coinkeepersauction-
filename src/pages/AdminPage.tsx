import React from 'react'
import { useNavigate } from 'react-router-dom'

const AdminPanel: React.FC = () => {
  const navigate = useNavigate()
  const isOwner = true // Replace with actual owner check logic

  if (!isOwner) {
    navigate('/unauthorized')
    return null
  }

  return (
    <div className="admin-panel">
      <h1>Admin Panel</h1>
      <ul className="tabs">
        <li className="tab active">Dashboard</li>
        <li className="tab">User Management</li>
        <li className="tab">Settings</li>
        <li className="tab">Reports</li>
      </ul>
      <div className="tab-content">
        {/* Content related to the selected tab goes here */}
      </div>
    </div>
  )
}

export default AdminPanel