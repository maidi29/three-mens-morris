import create from "zustand";

export interface Room {
  roomId: string;
  sessionname?: string;
}

export interface Player {
  color: string;
  symbol: string;
  socketId?: string;
  id: number;
  score: number;
}

interface AppState {
  me?: Player;
  opponent?: Player;
  setOpponent: (player: Player) => void;
  setMe: (player: Player) => void;
  room?: Room;
  setRoom: (newRoom?: Room) => void;
  gameFinished: boolean;
  setGameFinished: (isFinished: boolean) => void;
  resetStore: () => void;
  resetActiveGameButKeepRoom: () => void;
  activePlayer: 0 | 1;
  setActivePlayer: (playerId: 0 | 1) => void;
  winner: 0 | 1 | null;
  setWinner: (winner: 0 | 1 | null) => void;
}


export const useStore = create<AppState>((set) => ({
    me: undefined,
    opponent: undefined,
    room: undefined,
    setRoom: (newRoom?: Room) => {
        set({ room: newRoom });
    },
    gameFinished: false,
    setGameFinished: (isFinished) => set({ gameFinished: isFinished }),
    activePlayer: 0,
    setActivePlayer: (playerId: 0 | 1) => set( {activePlayer: playerId}),
    setOpponent: (player: Player) => set( {opponent: player}),
    setMe: (player: Player) => set( {me: player}),
    winner: null,
    setWinner: (winner: 0 | 1 | null) => set({winner}),
    resetStore: () =>
        set((state) => {
            state.room = undefined;
            state.gameFinished = false;
            state.me = undefined;
            state.opponent = undefined;
        }),
    resetActiveGameButKeepRoom: () =>
        set((state) => {
            state.gameFinished = false;
            if( state.me) state.me.score = 0;
            if (state.opponent) state.opponent.score = 0;
        }),
}));
