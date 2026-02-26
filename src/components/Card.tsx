import React from 'react';

interface CardProps {
    title: string;
    content: string;
    footer?: React.ReactNode;
}

const Card: React.FC<CardProps> = ({ title, content, footer }) => {
    return (
        <div style={{ border: '1px solid #ccc', borderRadius: '8px', padding: '16px', maxWidth: '300px' }}>
            <h3>{title}</h3>
            <p>{content}</p>
            {footer && <div>{footer}</div>}
        </div>
    );
};

export default Card;
