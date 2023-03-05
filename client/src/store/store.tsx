import create from "zustand";
import { Token } from "../components/elements/Token/Token";
import { ReactElement } from "react";
import { Coordinate } from "../components/features/Game/Game";
import { checkWinning } from "../utils/gameLogic";
import produce from "immer";
import { Turn } from "../services/gameService";

export enum PLAYER {
  ZERO = 0,
  ONE = 1,
}

export type Matrix = (PLAYER | null)[][];

export interface Room {
  roomId: string;
}

export interface Player {
  color: string;
  symbol: string;
  socketId?: string;
  id: PLAYER;
  score: number;
  activated: boolean;
}

type Opponent = Player & { isComputer?: boolean };

export enum PHASE {
  SET = "set",
  MOVE = "move",
}

interface AppState {
  me?: Player;
  opponent?: Opponent;
  setOpponent: (player?: Opponent) => void;
  setMe: (player: Player) => void;
  room?: Room;
  setRoom: (newRoom?: Room) => void;
  gameFinished: boolean;
  setGameFinished: (isFinished: boolean) => void;
  setActivated: (
    setMe: boolean,
    setOpponent: boolean,
    activated: boolean
  ) => void;
  resetActiveGameButKeepRoom: () => void;
  activePlayer: PLAYER | null;
  setActivePlayer: (playerId: PLAYER | null) => void;
  winner: PLAYER | null;
  winningFields: Set<Coordinate>;
  adjacentFields: Set<Coordinate>;
  phase: PHASE;
  setPhase: (phase: PHASE) => void;
  nonPlayedTokens: { 0: number[]; 1: number[] };
  playedTokens: { element: ReactElement; position: string }[];
  playToken: (
    playerId: PLAYER,
    value: Coordinate,
    prevValue?: Coordinate
  ) => void;
  getPlayerById: (id: PLAYER) => Player | undefined;
  increaseScore: (id: PLAYER) => void;
  matrix: Matrix;
  updateMatrix: (
    { x, y }: Coordinate,
    value: PLAYER | null,
    toBeRemoved?: Coordinate
  ) => void;
  setAdjacentFields: (adjacentFields: Set<Coordinate>) => void;
  setWinningFields: (winningFields: Set<Coordinate>) => void;
  takeTurn: (turn: Turn) => void;
}

const initMatrix = [
  [null, null, null],
  [null, null, null],
  [null, null, null],
];

export const useStore = create<AppState>((set, get) => ({
  me: undefined,
  opponent: undefined,
  room: undefined,
  setRoom: (newRoom?: Room) => {
    set({ room: newRoom });
  },
  gameFinished: false,
  setGameFinished: (isFinished) => set({ gameFinished: isFinished }),
  activePlayer: PLAYER.ZERO,
  setActivePlayer: (playerId: PLAYER | null) => set({ activePlayer: playerId }),
  setOpponent: (player?: Opponent) => set({ opponent: player }),
  setMe: (player: Player) => set({ me: player }),
  winner: null,
  winningFields: new Set<Coordinate>(),
  adjacentFields: new Set<Coordinate>(),
  setAdjacentFields: (adjacentFields: Set<Coordinate>) =>
    set({ adjacentFields }),
  setWinningFields: (winningFields: Set<Coordinate>) => set({ winningFields }),
  phase: PHASE.SET,
  setPhase: (phase: PHASE) => set({ phase }),
  setActivated: (setMe: boolean, setOpponent: boolean, activated: boolean) => {
    if (setMe) {
      set(
        produce((state) => {
          state.me.activated = activated;
        })
      );
    }
    if (setOpponent) {
      set(
        produce((state) => {
          state.opponent.activated = activated;
        })
      );
    }
  },
  matrix: [...initMatrix],
  updateMatrix: (
    { x, y }: Coordinate,
    value: PLAYER | null,
    toBeRemoved?: Coordinate
  ) => {
    const matrix = get().matrix;
    const newMatrix = matrix.map((arr) => arr.slice());
    if (newMatrix[x][y] === null) {
      newMatrix[x][y] = value;
    }
    if (toBeRemoved) {
      newMatrix[toBeRemoved.x][toBeRemoved.y] = null;
    }
    set({ matrix: [...newMatrix] });
    set({ adjacentFields: new Set<Coordinate>() });
    const winnerInfo = checkWinning(newMatrix);
    if (winnerInfo) {
      set({ winner: winnerInfo.winner });
      set({ winningFields: winnerInfo.winningFields });
    }
  },
  playedTokens: [],
  nonPlayedTokens: {
    [PLAYER.ZERO]: [0, 1, 2],
    [PLAYER.ONE]: [0, 1, 2],
  },
  playToken: (
    playerId: PLAYER,
    { x, y }: Coordinate,
    prevValue?: Coordinate
  ) => {
    const phase = get().phase;
    if (phase === PHASE.SET) {
      set(({ nonPlayedTokens }) => ({
        nonPlayedTokens: {
          ...nonPlayedTokens,
          [playerId]: nonPlayedTokens[playerId].slice(0, -1),
        },
      }));
      const player = get().getPlayerById(playerId);
      if (player) {
        set(({ playedTokens }) => ({
          playedTokens: [
            ...playedTokens,
            {
              element: (
                <Token emoji={player.symbol} color={player.color} size={4} />
              ),
              position: `${x}${y}`,
            },
          ],
        }));
      }
      const nPlTokens = get().nonPlayedTokens;
      const noMoreTokens = Object.values(nPlTokens).every(
        (value) => value.length === 0
      );
      if (noMoreTokens) {
        set({ phase: PHASE.MOVE });
      }
    } else if (phase === PHASE.MOVE && prevValue) {
      const plTokens = get().playedTokens.map((token) =>
        token.position === `${prevValue.x}${prevValue.y}`
          ? {
              element: token.element,
              position: `${x}${y}`,
            }
          : token
      );
      set(() => ({ playedTokens: plTokens }));
    }
  },
  getPlayerById: (id: PLAYER): Player | undefined => {
    const me = get().me;
    const opponent = get().opponent;
    return [me, opponent].find((player) => player?.id === id);
  },
  increaseScore: (id: PLAYER) => {
    if (id === get().me?.id) {
      set(
        produce((state) => {
          state.me.score = (get().me?.score || 0) + 1;
        })
      );
    } else if (id === get().opponent?.id) {
      set(
        produce((state) => {
          state.opponent.score = (get().opponent?.score || 0) + 1;
        })
      );
    }
  },
  takeTurn: (turn: Turn) => {
    get().updateMatrix(turn.newCoordinate, turn.playerId, turn.prevCoordinate);
    get().playToken(turn.playerId, turn.newCoordinate, turn.prevCoordinate);
    get().setActivePlayer(
      turn.playerId === PLAYER.ZERO ? PLAYER.ONE : PLAYER.ZERO
    );
  },
  resetActiveGameButKeepRoom: () => {
    const winner = get().winner;
    return set((state) => {
      state.winner = null;
      state.activePlayer = winner === PLAYER.ZERO ? PLAYER.ONE : PLAYER.ZERO;
      state.playedTokens = [];
      state.matrix = [...initMatrix];
      state.nonPlayedTokens = {
        [PLAYER.ZERO]: [0, 1, 2],
        [PLAYER.ONE]: [0, 1, 2],
      };
      state.phase = PHASE.SET;
      state.gameFinished = false;
    });
  },
}));
