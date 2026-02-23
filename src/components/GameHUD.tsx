import React from 'react';

const GameHUD: React.FC = () => {
  return (
    <div className="game-hud">
      <div className="coin-balance">Coins: 1000</div>
      <div className="player-name">Player: PlayerName</div>
      <div className="minimap">Minimap Placeholder</div>
      <div className="chat-panel">Chat Panel Placeholder</div>
      <div className="controls-help">Controls: WASD to move, Space to jump</div>
      <div className="fps-counter">FPS: 60</div>
    </div>
  );
}

export default GameHUD;