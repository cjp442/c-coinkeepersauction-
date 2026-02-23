// Stub 3D room scene components — implementations live in game/scenes/
import React from 'react'

export const Stage = ({ children }: { children: React.ReactNode }) => <div className="stage">{children}</div>
export const SpotLight = (_props: { position: { x: number; y: number; z: number } }) => null
export const WallScreen = (_props: { displayType: string }) => <div className="wall-screen" />
export const Chair = (_props: { position: { x: number; y: number; z: number } }) => <div className="chair" />
export const Decor = (_props: { items: string[] }) => null

export const RoomLayout = (_props: { layout: string; onLayoutChange: (l: string) => void }) => null
export const DecorPlacement = (_props: { decor: unknown[]; onPlaceDecor: (d: unknown) => void }) => null
export const FurnitureArrangement = () => null
