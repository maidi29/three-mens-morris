import create from "zustand";
import {Stone} from "../components/Stone/Stone";
import {ReactElement} from "react";
import {Coordinate} from "../components/Game/Game";
import omit from 'lodash-es/omit'

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
  increaseScore:(id: PLAYER) => void;
  matrix: Matrix,
  setMatrix: (matrix: Matrix) => void;
  updateMatrix: ({x, y}: Coordinate, value: PLAYER | null, toBeRemoved?: Coordinate) => void;
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
    matrix: [
        [null, null, null],
        [null, null, null],
        [null, null, null],
    ],
    setMatrix: (matrix: Matrix) => set ({matrix: matrix.map((arr)=>arr.slice())}),
    updateMatrix: ({x, y}: Coordinate, value: PLAYER | null, toBeRemoved?: Coordinate) => {
        console.log('mymatrix inside onclick', get().matrix);
        const mtrx = get().matrix;
        const newMatrix = mtrx.map((arr)=>arr.slice());
        // console.log('newMatrix', newMatrix);
        // const newTestMatrix = [...matrix];
        // const newArray = [...array];
        //
        if (newMatrix[x][y] === null) {
            newMatrix[x][y] = value;
            // newTestMatrix[x][y] = value;
            // newArray[x] = value;
        }
        if (toBeRemoved) {
            newMatrix[toBeRemoved.x][toBeRemoved.y] = null;
        }
        return set ({matrix: [...newMatrix]})
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
    increaseScore: (id: PLAYER) => {
        console.log('increaseScore', id);
        if (id === get().me?.id) {
            set(({ me }) =>
                me ? ({ me: { ...me, score: me.score + 1  } }) : { me }
            );
            console.log('me win', id, get().me?.id, get().me);
        } else if (id === get().opponent?.id) {
            set(({ opponent }) =>
                opponent ? ({ opponent: { ...opponent, score: opponent.score + 1 } }) : { opponent }
            )
            console.log('opponent win', id, get().me?.id, get().me);

            console.log(get().opponent);

        }
    },
    resetStore: () =>
        set((state) => {
            state.room = undefined;
            state.gameFinished = false;
            state.me = undefined;
            state.opponent = undefined;
        }),
    resetActiveGameButKeepRoom: () => {
        console.log('resetActiveGame');
        // Todo: how to reset matrix properly???
        const winner = get().winner;
        const newMatrix = get().matrix.map((row)=>[null,null,null]);
        return set((state) => {
            state.winner = null;
            state.activePlayer = winner;
            state.playedStones = [];
            state.matrix = JSON.parse(JSON.stringify(newMatrix));
            state.nonPlayedStones = {
                [PLAYER.ZERO]: [0,1,2],
                [PLAYER.ONE]: [0,1,2]
            }
            state.phase = 1;
            state.gameFinished = false;
        })
    },
}));
