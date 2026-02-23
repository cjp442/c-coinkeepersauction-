import React from 'react';
import './LobbyScene.css'; // Assuming you create a CSS file for styling

const LobbyScene = () => {
  return (
    <div className='lobby'>
      <div className='ground'></div>
      <div className='walls'></div>
      <div className='bar-counter'></div>
      <div className='portal-doors'>
        <div className='door door1'></div>
        <div className='door door2'></div>
        <div className='door door3'></div>
        <div className='door door4'></div>
      </div>
      <div className='chandeliers'></div>
      <div className='paintings'></div>
      <div className='lighting'></div>
    </div>
  );
};

export default LobbyScene;
