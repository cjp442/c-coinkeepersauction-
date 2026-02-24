import React from 'react';
import GameEngine from './game/GameEngine';
import './App.css';

const App: React.FC = () => {
    return (
        <div className="app-container">
            <GameEngine />
        </div>
    );
};

export default App;