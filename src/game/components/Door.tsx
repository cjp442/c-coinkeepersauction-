import React from 'react';
import { useState } from 'react';

const Door = ({ label, onClick }) => {
    const [isOpen, setIsOpen] = useState(false);

    const handleDoorClick = () => {
        setIsOpen(!isOpen);
        if (onClick) onClick();
    };

    return (
        <div onClick={handleDoorClick} style={{ cursor: 'pointer', ...styles.door }}>
            <div style={{ ...styles.geometry, background: isOpen ? 'lightgreen' : 'saddlebrown' }} />
            <div style={styles.label}>{label}</div>
        </div>
    );
};

const styles = {
    door: {
        width: '100px',
        height: '200px',
        position: 'relative',
    },
    geometry: {
        width: '100%',
        height: '100%',
        border: '2px solid black',
        transition: 'background-color 0.3s',
    },
    label: {
        position: 'absolute',
        bottom: '10px',
        left: '10px',
        color: 'white',
        fontWeight: 'bold',
    }
};

export default Door;