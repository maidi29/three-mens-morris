import { Coordinate } from "../components/features/Game/Game";
import { Matrix, PLAYER } from "../store/store";
import { getAdjacentFields } from "./gameLogic";

interface PossibleWin {
  nullCoordinate: Coordinate;
  line: Coordinate[];
}

interface MoveTurnCoordinates {
  newCoordinate: Coordinate;
  prevCoordinate: Coordinate;
}

const columns: Record<number, Coordinate[]> = {
  0: [0, 1, 2].map((x) => ({ x, y: 0 })),
  1: [0, 1, 2].map((x) => ({ x, y: 1 })),
  2: [0, 1, 2].map((x) => ({ x, y: 2 })),
};

const diagonal1 = [
  { x: 0, y: 0 },
  { x: 1, y: 1 },
  { x: 2, y: 2 },
];
const diagonal2 = [
  { x: 0, y: 2 },
  { x: 1, y: 1 },
  { x: 2, y: 0 },
];
const diagonals = [diagonal1, diagonal2];

const checkPossibleWinForAdjacentTokensNotInLine = (
  coordinateToCheck: Coordinate,
  line: Coordinate[],
  matrix: Matrix,
  playerToCheck: PLAYER
): { adjacentFields?: Set<Coordinate>; possibleWinToken?: Coordinate } => {
  const adjacentFields = getAdjacentFields(coordinateToCheck);
  return {
    adjacentFields,
    possibleWinToken: Array.from(adjacentFields).find(
      (field) =>
        matrix[field.x][field.y] === playerToCheck &&
        !line.find((coord) => coord.x === field.x && coord.y === field.y)
    ),
  };
};

const makeComputerWinMovePhase = (
  matrix: Matrix
): MoveTurnCoordinates | undefined => {
  const possibleWins = getPossibleWins(matrix, PLAYER.ONE);
  if (possibleWins.length > 0) {
    for (const { nullCoordinate, line } of possibleWins) {
      const { possibleWinToken } = checkPossibleWinForAdjacentTokensNotInLine(
        nullCoordinate,
        line,
        matrix,
        PLAYER.ONE
      );
      if (possibleWinToken) {
        return {
          prevCoordinate: possibleWinToken,
          newCoordinate: nullCoordinate,
        };
      }
    }
  }
};

const preventPlayerFromWinningMovePhase = (
  matrix: Matrix
): MoveTurnCoordinates | undefined => {
  const possibleDefeats = getPossibleWins(matrix, PLAYER.ZERO);
  if (possibleDefeats.length > 0) {
    for (const { nullCoordinate, line } of possibleDefeats) {
      const { adjacentFields, possibleWinToken } =
        checkPossibleWinForAdjacentTokensNotInLine(
          nullCoordinate,
          line,
          matrix,
          PLAYER.ZERO
        );
      if (possibleWinToken && adjacentFields) {
        const preventDefeatToken = Array.from(adjacentFields).find(
          (field) => matrix[field.x][field.y] === PLAYER.ONE
        );
        if (preventDefeatToken) {
          return {
            prevCoordinate: preventDefeatToken,
            newCoordinate: nullCoordinate,
          };
        }
      }
    }
  }
};

const makeRandomNotDangerousMove = (matrix: Matrix): MoveTurnCoordinates => {
  const computerTokensWithEmptyAdjacentFields = getCoordinatesWithValue(
    matrix,
    PLAYER.ONE
  ).filter((coordinate) => {
    return Array.from(getAdjacentFields(coordinate)).some(
      ({ x, y }) => matrix[x][y] === null
    );
  });

  const possibleTokensWithoutDangerousTokens =
    computerTokensWithEmptyAdjacentFields.filter((coordinate) => {
      const playerCanMoveToThisCoordinate = Array.from(
        getAdjacentFields(coordinate)
      ).find((field) => matrix[field.x][field.y] === PLAYER.ZERO);
      return !(
        coordinateHasTwoOtherValuesInLine(coordinate, matrix, PLAYER.ZERO) &&
        playerCanMoveToThisCoordinate
      );
    });

  const tokensToChooseFrom =
    possibleTokensWithoutDangerousTokens.length < 0
      ? possibleTokensWithoutDangerousTokens
      : computerTokensWithEmptyAdjacentFields;

  const prevCoordinate =
    tokensToChooseFrom[Math.floor(Math.random() * tokensToChooseFrom.length)];

  const emptyAdjacentFields = Array.from(
    getAdjacentFields(prevCoordinate)
  ).filter(({ x, y }) => matrix[x][y] === null);

  const newCoordinate =
    emptyAdjacentFields[Math.floor(Math.random() * emptyAdjacentFields.length)];

  return { newCoordinate, prevCoordinate };
};

export const calculateNewCoordinateOfComputerInMovePhase = (
  matrix: Matrix
): MoveTurnCoordinates => {
  const winTurn = makeComputerWinMovePhase(matrix);
  if (winTurn) return winTurn;

  const preventTurn = preventPlayerFromWinningMovePhase(matrix);
  if (preventTurn) return preventTurn;

  return makeRandomNotDangerousMove(matrix);
};

const makeComputerWinSetPhase = (matrix: Matrix): Coordinate | undefined =>
  getPossibleWins(matrix, PLAYER.ONE)?.[0]?.nullCoordinate;

const preventPlayerFromWinningSetPhase = (
  matrix: Matrix
): Coordinate | undefined => {
  const playedTokensPlayer = matrix
    .flatMap((rows) => rows)
    .filter((value) => value === PLAYER.ZERO);
  const nextTurnWillBeMove = playedTokensPlayer.length === 3;
  if (nextTurnWillBeMove) {
    const possibleDefeats = getPossibleWins(matrix, PLAYER.ZERO);
    if (possibleDefeats.length > 0) {
      for (const { nullCoordinate, line } of possibleDefeats) {
        const { possibleWinToken } = checkPossibleWinForAdjacentTokensNotInLine(
          nullCoordinate,
          line,
          matrix,
          PLAYER.ZERO
        );
        if (possibleWinToken) {
          return nullCoordinate;
        }
      }
    }
  } else {
    return getPossibleWins(matrix, PLAYER.ZERO)?.[0]?.nullCoordinate;
  }
};

const getRandomNullCoordinate = (matrix: Matrix): Coordinate => {
  const nullCoordinates = getCoordinatesWithValue(matrix, null);
  return nullCoordinates[Math.floor(Math.random() * nullCoordinates.length)];
};

export const calculateNewCoordinateOfComputerInSetPhase = (
  matrix: Matrix
): Coordinate => {
  const winCoordinate = makeComputerWinSetPhase(matrix);
  if (winCoordinate) return winCoordinate;

  const preventCoordinate = preventPlayerFromWinningSetPhase(matrix);
  if (preventCoordinate) return preventCoordinate;

  return getRandomNullCoordinate(matrix);
};

const getCoordinatesWithValue = (
  matrix: Matrix,
  value: PLAYER | null
): Coordinate[] => {
  const nonNullCoordinates: Coordinate[] = [];
  for (let x = 0; x < 3; x++) {
    matrix[x].forEach((row, y) => {
      if (matrix[x][y] === value) {
        nonNullCoordinates.push({ x, y });
      }
    });
  }
  return nonNullCoordinates;
};

const getPossibleWins = (matrix: Matrix, id: PLAYER): PossibleWin[] => {
  const result: { nullCoordinate: Coordinate; line: Coordinate[] }[] = [];
  // columns check
  for (let y = 0; y < Object.values(columns).length; y++) {
    const columnValues: (PLAYER | null)[] = Object.values(columns)[y].map(
      ({ x: a, y: b }) => matrix[a][b]
    );
    if (lineHasTwoValuesOfIdAndOneNullValue(columnValues, id)) {
      const x = columnValues.findIndex((value) => value === null);
      result.push({
        nullCoordinate: { x, y },
        line: Object.values(columns)[y],
      });
    }
  }

  // rows check
  for (let x = 0; x < matrix.length; x++) {
    const rowValues = matrix[x];
    const row: Coordinate[] = [0, 1, 2].map((y) => ({ x, y }));
    if (lineHasTwoValuesOfIdAndOneNullValue(rowValues, id)) {
      const y = rowValues.findIndex((value) => value === null);
      result.push({
        nullCoordinate: { x, y },
        line: row,
      });
    }
  }

  // diagonals check
  for (const diagonal of diagonals) {
    const values = diagonal.map(({ x, y }) => matrix[x][y]);
    if (lineHasTwoValuesOfIdAndOneNullValue(values, id)) {
      result.push({
        nullCoordinate: diagonal.find(({ x, y }) => matrix[x][y] === null)!,
        line: diagonal,
      });
    }
  }
  return result;
};

const lineHasTwoValuesOfIdAndOneNullValue = (
  line: (PLAYER | null)[],
  id: PLAYER
): boolean => {
  const existingValuesInLine = new Set(line);
  const nonNullValues = line.filter((value) => value !== null);
  return (
    nonNullValues.length === 2 &&
    existingValuesInLine.size === 2 &&
    existingValuesInLine.has(id)
  );
};

const checkOtherValuesInLine = (
  line: Coordinate[],
  coordinate: Coordinate,
  matrix: Matrix,
  otherId: PLAYER
): boolean => {
  const otherValuesInLine = new Set(
    line
      .filter(({ x, y }) => !(coordinate.x === x && coordinate.y === y))
      .map(({ x, y }) => matrix[x][y])
  );
  return otherValuesInLine.size === 1 && otherValuesInLine.has(otherId);
};

const coordinateHasTwoOtherValuesInLine = (
  coordinate: Coordinate,
  matrix: Matrix,
  otherId: PLAYER
) => {
  const column = columns[coordinate.y];
  if (checkOtherValuesInLine(column, coordinate, matrix, otherId)) return true;

  const row = [0, 1, 2].map((y) => ({ x: coordinate.x, y }));
  if (checkOtherValuesInLine(row, coordinate, matrix, otherId)) return true;

  for (const diagonal of diagonals) {
    if (checkOtherValuesInLine(diagonal, coordinate, matrix, otherId))
      return true;
  }
  return false;
};
