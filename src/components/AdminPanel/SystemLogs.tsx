import React from 'react';
import { Table } from 'antd';

const SystemLogs: React.FC = () => {
    const logs = [
        { action: 'User Login', user: 'user123', timestamp: '2026-02-23 12:00:00', target: 'user123', details: 'User logged into the system.' },
        { action: 'Change Password', user: 'admin', timestamp: '2026-02-23 12:20:00', target: 'user123', details: 'User123 changed their password.' },
        { action: 'Delete User', user: 'admin', timestamp: '2026-02-23 12:30:00', target: 'user456', details: 'User456 was deleted from the system.' },
        { action: 'Update Profile', user: 'user123', timestamp: '2026-02-23 12:40:00', target: 'user123', details: 'User123 updated their profile information.' },
        { action: 'Create User', user: 'admin', timestamp: '2026-02-23 12:45:00', target: 'user789', details: 'User789 was created in the system.' }
    ];

    const columns = [
        { title: 'Action', dataIndex: 'action', key: 'action' },
        { title: 'User', dataIndex: 'user', key: 'user' },
        { title: 'Timestamp', dataIndex: 'timestamp', key: 'timestamp' },
        { title: 'Target User', dataIndex: 'target', key: 'target' },
        { title: 'Details', dataIndex: 'details', key: 'details' }
    ];

    return (
        <div>
            <h2>Admin Action Logs</h2>
            <Table columns={columns} dataSource={logs} rowKey="timestamp" />
        </div>
    );
};

export default SystemLogs;
