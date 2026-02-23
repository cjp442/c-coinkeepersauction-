import React, { useState } from 'react'
import { RoomLayout, DecorPlacement, FurnitureArrangement } from '../components'

const MemberRoomScene = ({ memberId }: { memberId: string }) => {
  const [layout, setLayout] = useState('default')
  const [decor, setDecor] = useState<unknown[]>([])

  const handleLayoutChange = (newLayout: string) => {
    setLayout(newLayout)
  }

  const handleDecorPlacement = (newDecor: unknown) => {
    setDecor(prev => [...prev, newDecor])
  }

  return (
    <div className={`room-scene layout-${layout}`} data-member={memberId}>
      <RoomLayout layout={layout} onLayoutChange={handleLayoutChange} />
      <DecorPlacement decor={decor} onPlaceDecor={handleDecorPlacement} />
      <FurnitureArrangement />
    </div>
  )
}

export default MemberRoomScene
