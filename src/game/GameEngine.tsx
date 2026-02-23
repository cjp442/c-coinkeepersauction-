import React, { useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { create } from 'zustand';
import LobbyScene from './scenes/LobbyScene';
import HostRoomScene from './scenes/HostRoomScene';
import MemberRoomScene from './scenes/MemberRoomScene';

type Scene = 'lobby' | 'host' | 'member';

interface GameStore {
    score: number;
    currentScene: Scene;
    increaseScore: () => void;
    setScene: (scene: Scene) => void;
}

// Zustand store for game state management
const useGameStore = create<GameStore>((set) => ({
    score: 0,
    currentScene: 'lobby',
    increaseScore: () => set((state) => ({ score: state.score + 1 })),
    setScene: (scene: Scene) => set({ currentScene: scene }),
}));

const GameEngine = () => {
    const currentScene = useGameStore((state) => state.currentScene);
    const setScene = useGameStore((state) => state.setScene);

    useEffect(() => {
        // Any game initialization logic
    }, []);

    return (
        <Canvas
            shadows
            camera={{ position: [0, 5, 10], fov: 60 }}
            style={{ background: '#1a0e04' }}
        >
            {currentScene === 'lobby' && <LobbyScene onNavigate={setScene} />}
            {currentScene === 'host' && <HostRoomScene onNavigate={setScene} />}
            {currentScene === 'member' && <MemberRoomScene onNavigate={setScene} />}
        </Canvas>
    );
};

export default GameEngine;