import create from 'zustand';

interface GameState {
    score: number;
    // Add other game state properties here
    increaseScore: () => void;
    resetScore: () => void;
}

const useGameStore = create<GameState>((set) => ({
    score: 0,
    increaseScore: () => set((state) => ({ score: state.score + 1 })),
    resetScore: () => set({ score: 0 }),
}));

export default useGameStore;