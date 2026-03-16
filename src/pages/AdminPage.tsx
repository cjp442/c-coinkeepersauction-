import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

const AdminPage = () => {
    const navigate = useNavigate()
    const { user } = useAuth()
    const isOwner = user?.role === 'admin'

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

export default AdminPage