import create from 'zustand';

interface SceneState {
  currentScene: string;
  roomNavigation: {[key: string]: string[]};
  switchScene: (scene: string) => void;
  navigateToRoom: (room: string) => string[];
}

const useGameStore = create<SceneState>((set) => ({
  currentScene: 'home', // starting scene
  roomNavigation: {
    home: ['kitchen', 'living room'],
    kitchen: ['dining room', 'garage'],
    'living room': ['kitchen'],
  },
  switchScene: (scene) => set({ currentScene: scene }),
  navigateToRoom: (room) => {
    // Return available rooms for the current scene
    return this.roomNavigation[this.currentScene] || [];
  },
}));

export default useGameStore;
