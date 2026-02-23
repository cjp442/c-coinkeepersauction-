import React, { useEffect, useState } from 'react';
import './Portal.css';

const Portal = ({ onEnter }: { onEnter: () => void }) => {
    const [isNear, setIsNear] = useState(false);
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        const handlePlayerProximity = () => {
            // Logic to determine if the player is near the portal
            // This is a placeholder for actual proximity logic
            const near = Math.random() < 0.5; // Simulate player proximity
            setIsNear(near);
        };

        handlePlayerProximity();
        const interval = setInterval(handlePlayerProximity, 1000);

        return () => clearInterval(interval);
    }, []);

    const handleClick = () => {
        if (isNear) {
            setIsOpen(true);
            onEnter(); // Callback to enter the room
        }
    };

    return (
        <div className={`portal ${isNear ? 'glow' : ''}`} onClick={handleClick}>
            {isOpen ? 'Entering Room...' : 'Click to Enter Room'}
        </div>
    );
};

export default Portal;
