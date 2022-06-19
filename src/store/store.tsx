import create from "zustand";
import {Stone} from "../components/Stone/Stone";
import {ReactElement, useState} from "react";
import {Coordinate} from "../components/Game/Game";
import {checkWinning} from "../utils/boardLogic";
import produce from 'immer'


export type Matrix = Array<Array<0 | 1 | null>>;

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

export enum PHASE {
    SET = 1,
    MOVE = 2
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
  winningFields: Set<Coordinate>;
  adjacentFields: Set<Coordinate>;
  phase?: PHASE;
  setPhase: (phase: PHASE) => void;
  nonPlayedStones: { 0: number[], 1: number[]},
  playedStones: { element: ReactElement, position:string}[],
  playStone: (playerId: PLAYER, value: Coordinate, prevValue?: Coordinate) => void;
  getPlayerById: (id: PLAYER) => Player | undefined;
  increaseScore:(id: PLAYER) => void;
  matrix: Matrix,
  updateMatrix: ({x, y}: Coordinate, value: PLAYER | null, toBeRemoved?: Coordinate) => void;
  setAdjacentFields: (adjacentFields: Set<Coordinate>) => void;
  setWinningFields: (winningFields: Set<Coordinate>) => void;
}

const initMatrix = [
    [null, null, null],
    [null, null, null],
    [null, null, null],
]


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
    winningFields: new Set<Coordinate>(),
    adjacentFields: new Set<Coordinate>(),
    setAdjacentFields: (adjacentFields: Set<Coordinate>) => set({adjacentFields}),
    setWinningFields: (winningFields: Set<Coordinate>) => set({winningFields}),
    phase: undefined,
    setPhase: (phase: number) => set({phase}),
    matrix: initMatrix,
    updateMatrix: ({x, y}: Coordinate, value: PLAYER | null, toBeRemoved?: Coordinate) => {
        const matrix = get().matrix;
        const newMatrix = matrix.map((arr)=>arr.slice());
        if (newMatrix[x][y] === null) {
            newMatrix[x][y] = value;
        }
        if (toBeRemoved) {
            newMatrix[toBeRemoved.x][toBeRemoved.y] = null;
        }
        set ({matrix: [...newMatrix]});
        set ({adjacentFields: new Set<Coordinate>()});
        const winnerInfo = checkWinning(newMatrix);
        if (winnerInfo) {
            set ({winner: winnerInfo.winner});
            set ({winningFields: winnerInfo.winningFields});
        }
    },
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
            if (noMoreStones) {
                set( {phase: 2});
            } else {
                const player = get().getPlayerById(playerId);
                if (player) {
                    set(({playedStones}) => ({
                        playedStones: [...playedStones, {element: <Stone emoji={player.symbol} color={player.color}/>, position: `${x}${y}`}]
                    }));
                }
            }
        } else if (phase === 2 && prevValue) {
            const plStones = get().playedStones.map((stone)=> (
                stone.position === `${prevValue.x}${prevValue.y}` ? {
                    element: stone.element,
                    position: `${x}${y}`
                } : stone
            ));
            set(() => ({ playedStones: plStones }));
        }
    },
    getPlayerById: (id: PLAYER): Player | undefined => {
        const me = get().me;
        const opponent = get().opponent;
        return [me,opponent].find((player) => player?.id === id);
    },
    increaseScore: (id: PLAYER) => {
        if (id === get().me?.id) {
            set(produce((state) => { state.me.score = (get().me?.score || 0) + 1 }));
        } else if (id === get().opponent?.id) {
            set(produce((state) => { state.opponent.score = (get().opponent?.score || 0) + 1 }));
        }
    },
    resetStore: () =>
        set((state) => {
            state.room = undefined;
            state.gameFinished = false;
            state.me = undefined;
            state.opponent = undefined;
            state.winner = null;
            state.activePlayer = null;
            state.playedStones = [];
            state.matrix = initMatrix;
            state.nonPlayedStones = {
                [PLAYER.ZERO]: [0,1,2],
                [PLAYER.ONE]: [0,1,2]
            }
            state.phase = 1;
            state.gameFinished = false;
        }),
    resetActiveGameButKeepRoom: () => {
        const winner = get().winner;
        return set((state) => {
            state.winner = null;
            state.activePlayer = winner;
            state.playedStones = [];
            state.matrix = initMatrix;
            state.nonPlayedStones = {
                [PLAYER.ZERO]: [0,1,2],
                [PLAYER.ONE]: [0,1,2]
            }
            state.phase = 1;
            state.gameFinished = false;
        })
    },
}));
