import React from 'react';
import { useHistory } from 'react-router-dom';

const AdminPanel: React.FC = () => {
    const history = useHistory();
    const isOwner = true; // Replace with actual owner check logic

    if (!isOwner) {
        history.push('/unauthorized'); // Redirect to unauthorized page if not an owner
        return null;
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
    );
};

export default AdminPanel;