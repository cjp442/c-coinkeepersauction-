import React, { useState } from 'react';

const Chair: React.FC = () => {
  const [isSitting, setIsSitting] = useState(false);
  const [cameraMode, setCameraMode] = useState<'1st' | '3rd'>('1st');

  const toggleSit = () => {
    setIsSitting(!isSitting);
    
    if (!isSitting) {
      // Lock camera to 1st person when sitting
      setCameraMode('1st');
    } else {
      // Unlock camera when standing up
      setCameraMode('3rd');
    }
  };

  const toggleCameraMode = () => {
    if (isSitting) {
      setCameraMode(cameraMode === '1st' ? '3rd' : '1st');
    }
  };

  return (
    <div 
      onClick={toggleSit}
      style={{ cursor: 'pointer', border: '1px solid #000', padding: '15px', width: '100px', textAlign: 'center' }}>
      {isSitting ? 'Stand Up' : 'Sit Down'}
      <button onClick={toggleCameraMode} disabled={!isSitting}>
        {cameraMode === '1st' ? 'Switch to 3rd Person' : 'Switch to 1st Person'}
      </button>
    </div>
  );
};

export default Chair;