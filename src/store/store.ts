import create from "zustand";

export interface Room {
  roomId: string;
  sessionname?: string;
}

export interface Player {
  playerName: string;
  score: number;
  avatar: string;
  socketId?: string;
}

interface AppState {
  me?: Player;
  opponent?: Player;
  room?: Room;
  setRoom: (newRoom?: Room) => void;
  gameFinished: boolean;
  setGameFinished: (isFinished: boolean) => void;
  resetStore: () => void;
  resetActiveGameButKeepRoom: () => void;
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
  resetStore: () =>
    set((state) => {
      state.room = undefined;
      state.gameFinished = false;
      state.me = undefined;
      state.opponent = undefined
    }),
  resetActiveGameButKeepRoom: () =>
    set((state) => {
        state.gameFinished = false;
        if( state.me) state.me.score = 0;
        if (state.opponent) state.opponent.score = 0;
    }),
}));
