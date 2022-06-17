import create from "zustand";
import {Stone} from "../components/Stone/Stone";
import {ReactElement} from "react";
import {Coordinate} from "../components/Game/Game";

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
  activePlayer: PLAYER | null;
  setActivePlayer: (playerId: PLAYER | null) => void;
  winner: PLAYER | null;
  setWinner: (winner: PLAYER | null) => void;
  phase?: number;
  setPhase: (phase: number) => void;
  nonPlayedStones: { 0: number[], 1: number[]},
  playedStones: { element: ReactElement, position:string}[],
  playStone: (playerId: PLAYER, value: Coordinate, prevValue?: Coordinate) => void;
  getPlayerById: (id: PLAYER) => Player | undefined;
}


export const useStore = create<AppState>((set, get) => ({
    me: undefined,
    opponent: undefined,
    room: undefined,
    setRoom: (newRoom?: Room) => {
        set({ room: newRoom });
    },
    gameFinished: false,
    setGameFinished: (isFinished) => set({ gameFinished: isFinished }),
    activePlayer: 0,
    setActivePlayer: (playerId: PLAYER | null) => set( {activePlayer: playerId}),
    setOpponent: (player: Player) => set( {opponent: player}),
    setMe: (player: Player) => set( {me: player}),
    winner: null,
    setWinner: (winner: PLAYER | null) => set({winner}),
    phase: undefined,
    setPhase: (phase: number) => set({phase}),
    playedStones: [],
    nonPlayedStones: {
        [PLAYER.ZERO]: [0,1,2],
        [PLAYER.ONE]: [0,1,2]
    },
    playStone: (playerId: PLAYER, {x,y}: Coordinate, prevValue?: Coordinate) => {
        const phase = get().phase;
        if (phase === 1) {
            set(({ nonPlayedStones }) =>
                    ({ nonPlayedStones: { ...nonPlayedStones, [playerId]: nonPlayedStones[playerId].slice(0,-1) } })
            );
            const nPlStones = get().nonPlayedStones;
            const noMoreStones = Object.values(nPlStones).every((value) => value.length === 0);
            const player = get().getPlayerById(playerId);
            if (player) {
                set(({playedStones}) => ({
                    playedStones: [...playedStones, {element:<Stone emoji={player.symbol} color={player.color}/>, position: `${x}${y}`}]
                }));
            }
            if(noMoreStones) {
                set( {phase: 2});
            }
        } else if (phase === 2 && prevValue) {
            const plStones = get().playedStones.map((stone)=> {
                if (stone.position === `${prevValue.x}${prevValue.y}`) {
                    return { element: stone.element, position: `${x}${y}`};
                } else {
                    return stone;
                }
            })
            set(() => ({
                playedStones: plStones
            }));
        }
    },
    getPlayerById: (id: PLAYER): Player | undefined => {
        const me = get().me;
        const opponent = get().opponent;
        return [me,opponent].find((player) => player?.id === id);
    },
    resetStore: () =>
        set((state) => {
            state.room = undefined;
            state.gameFinished = false;
            state.me = undefined;
            state.opponent = undefined;
        }),
    // Todo: reset everything properly
    resetActiveGameButKeepRoom: () => {
        const winner = get().winner;
        set((state) => {
            state.winner = null;
            state.activePlayer = winner;
            state.playedStones = [];
            state.nonPlayedStones = {
                [PLAYER.ZERO]: [0,1,2],
                [PLAYER.ONE]: [0,1,2]
            }
            state.phase = 1;
            state.gameFinished = false;
            if( state.me) state.me.score = 0;
            if (state.opponent) state.opponent.score = 0;
        })
    },
}));
