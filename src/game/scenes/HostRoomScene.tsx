import React from 'react';
import { Stage, SpotLight, WallScreen, Chair, Decor } from '../components';

const HostRoomScene = () => {
  return (
    <Stage>
      <SpotLight position={{ x: 1, y: 5, z: 1 }} />
      <WallScreen displayType="livestream" />
      <div style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap' }}>
        {[...Array(10)].map((_, index) => (
          <Chair key={index} position={{ x: index % 5, y: 0, z: Math.floor(index / 5) }} />
        ))}
      </div>
      <Decor items={["table", "floral", "lighting"]} />
    </Stage>
  );
};

export default HostRoomScene;