import create from "zustand";

export interface Room {
  roomId: string;
}

export interface Player {
  color: string;
  symbol: string;
  socketId?: string;
  id: PLAYER;
  score: number;
}

export enum PLAYER {
    ZERO = 0,
    ONE = 1
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
  activePlayer: PLAYER;
  setActivePlayer: (playerId: PLAYER) => void;
  winner: PLAYER | null;
  setWinner: (winner: PLAYER | null) => void;
  phase?: number;
  setPhase: (phase: number) => void;
  nonPlayedStones: { 0: number[], 1: number[]},
    playStone: (playerId: PLAYER) => void;
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
    setActivePlayer: (playerId: PLAYER) => set( {activePlayer: playerId}),
    setOpponent: (player: Player) => set( {opponent: player}),
    setMe: (player: Player) => set( {me: player}),
    winner: null,
    setWinner: (winner: PLAYER | null) => set({winner}),
    phase: undefined,
    setPhase: (phase: number) => set({phase}),
    nonPlayedStones: {
        [PLAYER.ZERO]: [0,1,2],
        [PLAYER.ONE]: [0,1,2]
    },
    // todo: set phase
    playStone: (playerId: PLAYER) =>
        set(({ nonPlayedStones }) =>
                ({ nonPlayedStones: { ...nonPlayedStones, [playerId]: nonPlayedStones[playerId].slice(0,-1) } })
        ),
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
