import React, { useState } from 'react';
import { Rnd } from 'react-rnd';

const RoomCustomizer = () => {
    const [decorItems, setDecorItems] = useState([]);
    const [selectedItem, setSelectedItem] = useState(null);

    const addDecor = (decor) => {
        setDecorItems([...decorItems, { id: Date.now(), ...decor }]);
    };

    const removeDecor = (id) => {
        setDecorItems(decorItems.filter(item => item.id !== id));
    };

    const saveDesign = () => {
        // Implement save functionality here
        console.log('Design saved!');
    };

    return (
        <div className="room-customizer">
            <h2>Room Customizer</h2>
            <button onClick={() => addDecor({ x: 100, y: 100, width: 50, height: 50 })}>Add Decor</button>
            <div className="room-preview" style={{ position: 'relative', width: '800px', height: '600px', border: '1px solid #ccc' }}>
                {decorItems.map(item => (
                    <Rnd
                        key={item.id}
                        style={{ border: selectedItem === item.id ? '2px solid blue' : 'none' }}
                        bounds="parent"
                        onClick={() => setSelectedItem(item.id)}
                        onDragStop={(e, d) => {
                            const updatedItems = decorItems.map(i => 
                                i.id === item.id ? { ...i, x: d.x, y: d.y } : i
                            );
                            setDecorItems(updatedItems);
                        }}
                        default={{ x: item.x, y: item.y, width: item.width, height: item.height }}
                    >
                        <button onClick={() => removeDecor(item.id)}>Delete</button>
                        {/* Add Rotate and Scale Controls here */}
                        Decor Item {item.id}
                    </Rnd>
                ))}
            </div>
            <button onClick={saveDesign}>Save Design</button>
        </div>
    );
};

export default RoomCustomizer;