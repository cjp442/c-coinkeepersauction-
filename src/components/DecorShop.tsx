import React, { useState } from 'react';
import './DecorShop.css'; // Optional CSS file for styling

const DecorShop = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');

    const decorItems = [
        { id: 1, name: 'Vintage Lamp', price: 50, category: 'Lighting', image: 'path/to/vintage-lamp.jpg' },
        { id: 2, name: 'Modern Vase', price: 30, category: 'Decor', image: 'path/to/modern-vase.jpg' },
        { id: 3, name: 'Wall Art', price: 75, category: 'Art', image: 'path/to/wall-art.jpg' },
        // Add more items here
    ];

    const filteredItems = decorItems.filter(item => {
        const matchesSearchTerm = item.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
        return matchesSearchTerm && matchesCategory;
    });

    return (
        <div className="decor-shop">
            <h1>Decor Shop</h1>
            <input 
                type="text" 
                placeholder="Search for decor..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
            <select onChange={(e) => setSelectedCategory(e.target.value)}>
                <option value="All">All Categories</option>
                <option value="Lighting">Lighting</option>
                <option value="Decor">Decor</option>
                <option value="Art">Art</option>
                {/* Add more categories as needed */}
            </select>
            <div className="decor-grid">
                {filteredItems.map(item => (
                    <div key={item.id} className="decor-item">
                        <img src={item.image} alt={item.name} />
                        <h2>{item.name}</h2>
                        <p>{item.price} Coins</p>
                        <button>Purchase</button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default DecorShop;