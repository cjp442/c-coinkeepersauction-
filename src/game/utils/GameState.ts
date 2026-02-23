import create from 'zustand';

// Define the types for your states
interface PlayerState {
    players: string[];
    addPlayer: (name: string) => void;
    removePlayer: (name: string) => void;
}

interface RoomState {
    roomId: string;
    roomName: string;
    updateRoomName: (name: string) => void;
}

interface FinanceState {
    balance: number;
    addFunds: (amount: number) => void;
    deductFunds: (amount: number) => void;
}

interface AdminState {
    isAdmin: boolean;
    setAdmin: (status: boolean) => void;
}

// Define the Zustand store
interface Store extends PlayerState, RoomState, FinanceState, AdminState {}

export const useGameState = create<Store>((set) => ({
    // Player state management
    players: [],
    addPlayer: (name) => set((state) => ({ players: [...state.players, name] })),
    removePlayer: (name) => set((state) => ({ players: state.players.filter(player => player !== name) })),
    
    // Room state management
    roomId: '',
    roomName: '',
    updateRoomName: (name) => set({ roomName: name }),
    
    // Finance state management
    balance: 0,
    addFunds: (amount) => set((state) => ({ balance: state.balance + amount })),
    deductFunds: (amount) => set((state) => ({ balance: state.balance - amount })),
    
    // Admin state management
    isAdmin: false,
    setAdmin: (status) => set({ isAdmin: status }),
}));
