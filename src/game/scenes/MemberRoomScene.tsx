import React, { useState } from 'react';
import { RoomLayout, DecorPlacement, FurnitureArrangement } from './components'; // Assuming components are available

const MemberRoomScene = ({ memberId }) => {
  const [layout, setLayout] = useState("default");
  const [decor, setDecor] = useState([]);

  const handleLayoutChange = (newLayout) => {
    setLayout(newLayout);
  };

  const handleDecorPlacement = (newDecor) => {
    setDecor([...decor, newDecor]);
  };

  return (
    <div className={`room-scene layout-${layout}`}> 
      <RoomLayout layout={layout} onLayoutChange={handleLayoutChange} />
      <DecorPlacement decor={decor} onPlaceDecor={handleDecorPlacement} />
      <FurnitureArrangement />
    </div>
  );
};

export default MemberRoomScene;
