import React from 'react';

const ProfilePage: React.FC = () => {
    // Dummy data for user stats
    const userStats = {
        username: 'cjp442',
        coinBalance: 250,
        roomCustomization: 'Modern Theme',
        purchaseHistory: [
            { item: 'Premium Room', date: '2025-05-10' },
            { item: 'Extra Coins', date: '2025-06-15' },
            { item: 'VIP Access', date: '2025-07-20' }
        ],
        settings: {
            notifications: true,
            language: 'English'
        }
    };

    return (
        <div>
            <h1>Profile Page</h1>
            <h2>User Stats</h2>
            <p>Username: {userStats.username}</p>
            <p>Coin Balance: {userStats.coinBalance}</p>
            <h2>Customization</h2>
            <p>Room Customization: {userStats.roomCustomization}</p>
            <h2>Purchase History</h2>
            <ul>
                {userStats.purchaseHistory.map((purchase, index) => (
                    <li key={index}>{purchase.item} - {purchase.date}</li>
                ))}
            </ul>
            <h2>Settings</h2>
            <p>Notifications: {userStats.settings.notifications ? 'Enabled' : 'Disabled'}</p>
            <p>Language: {userStats.settings.language}</p>
        </div>
    );
};

export default ProfilePage;