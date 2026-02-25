import React from 'react';

const AdminDashboard: React.FC = () => {
    // Example metrics - in a real application, these would likely be passed as props or fetched from an API
    const totalUsers = 1000;
    const totalRevenue = 50000;
    const activePlayers = 300;
    const systemStatus = 'Operational';

    return (
        <div>
            <h1>Admin Dashboard</h1>
            <ul>
                <li>Total Users: {totalUsers}</li>
                <li>Total Revenue: ${totalRevenue}</li>
                <li>Active Players: {activePlayers}</li>
                <li>System Status: {systemStatus}</li>
            </ul>
        </div>
    );
};

export default AdminDashboard;