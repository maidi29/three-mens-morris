import { Coordinate } from "../components/features/Game/Game";
import { Matrix, PLAYER } from "../store/store";
import { columns } from "../constants/constants";

export interface WinnerInfo {
  winner: 0 | 1 | null;
  winningFields: Set<Coordinate>;
}

interface PossibleWin {
  nullCoordinate: Coordinate;
  line: Coordinate[];
}

export const checkWinning = (matrix: Matrix): WinnerInfo | undefined => {
  // columns check
  for (let y = 0; y < 3; y++) {
    // check if every value in column y is the same and therefore Set has only one value (and is not null)
    if (
      matrix[0][y] !== null &&
      new Set([0, 1, 2].map((x) => matrix[x][y])).size === 1
    ) {
      return {
        winner: matrix[0][y],
        winningFields: new Set([0, 1, 2].map((x) => ({ x, y }))),
      };
    }
  }

  // rows check
  for (let x = 0; x < 3; x++) {
    // check if every value in row x is the same and therefore Set has only one value (and is not null)
    if (matrix[x][0] !== null && new Set(matrix[x]).size === 1) {
      return {
        winner: matrix[x][0],
        winningFields: new Set(matrix[1].map((value, y) => ({ x, y }))),
      };
    }
  }

  // diagonals check
  // check if middle value is not null and then check the two diagonals for same value
  if (matrix[1][1] !== null) {
    if (new Set([matrix[0][0], matrix[1][1], matrix[2][2]]).size === 1) {
      return {
        winner: matrix[1][1],
        winningFields: new Set([
          { x: 0, y: 0 },
          { x: 1, y: 1 },
          { x: 2, y: 2 },
        ]),
      };
    } else if (new Set([matrix[0][2], matrix[1][1], matrix[2][0]]).size === 1) {
      return {
        winner: matrix[1][1],
        winningFields: new Set([
          { x: 0, y: 2 },
          { x: 1, y: 1 },
          { x: 2, y: 0 },
        ]),
      };
    }
  }
};

export const coordinateExistsInSet = (
  coord: Coordinate,
  set: Set<Coordinate>
): boolean =>
  Array.from(set).some((value) => value.x === coord.x && value.y === coord.y);

export const getAdjacentFields = ({ x, y }: Coordinate): Set<Coordinate> => {
  const betweenIndices = (num: number) => num >= 0 && num <= 2;
  const nonDiagonalCoordinates = new Set([
    { x: 1, y: 0 },
    { x: 2, y: 1 },
    { x: 0, y: 1 },
    { x: 1, y: 2 },
  ]);
  return new Set(
    [
      { x: x - 1, y },
      { x: x + 1, y },
      { x, y: y - 1 },
      { x, y: y + 1 },
      ...(coordinateExistsInSet({ x, y }, nonDiagonalCoordinates)
        ? []
        : [
            { x: x + 1, y: y + 1 },
            { x: x - 1, y: y - 1 },
            { x: x - 1, y: y + 1 },
            { x: x + 1, y: y - 1 },
          ]),
    ].filter(({ x: a, y: b }) => betweenIndices(a) && betweenIndices(b))
  );
};

export const calculateNewCoordinateOfComputerInMovePhase = (
  matrix: Matrix
): { newCoordinate: Coordinate; prevCoordinate: Coordinate } => {
  // check if computer can win
  let checkTheseCoordinates = getNullishPositionInLineWithTwoValues(
    matrix,
    PLAYER.ONE
  );
  if (checkTheseCoordinates.length > 0) {
    for (let i = 0; i < checkTheseCoordinates.length; i++) {
      const possibleWin = checkTheseCoordinates[i];
      const adjFields = getAdjacentFields(possibleWin.nullCoordinate);
      const prevCoordinate = Array.from(adjFields).find(
        (field) =>
          matrix[field.x][field.y] === PLAYER.ONE &&
          !possibleWin.line.find(
            (coord) => coord.x === field.x && coord.y === field.y
          )
      );
      if (prevCoordinate) {
        return { prevCoordinate, newCoordinate: possibleWin.nullCoordinate };
      }
    }
  }

  // prevent player from winning
  checkTheseCoordinates = getNullishPositionInLineWithTwoValues(
    matrix,
    PLAYER.ZERO
  );
  if (checkTheseCoordinates.length > 0) {
    for (let i = 0; i < checkTheseCoordinates.length; i++) {
      const possibleWin = checkTheseCoordinates[i];
      const adjFields = getAdjacentFields(possibleWin.nullCoordinate);
      const opponentCanWinWithThisToken = Array.from(adjFields).find(
        (field) =>
          matrix[field.x][field.y] === PLAYER.ZERO &&
          !possibleWin.line.find(
            (coord) => coord.x === field.x && coord.y === field.y
          )
      );
      if (opponentCanWinWithThisToken) {
        const prevCoordinate = Array.from(adjFields).find(
          (field) => matrix[field.x][field.y] === PLAYER.ONE
        );
        if (prevCoordinate) {
          return { prevCoordinate, newCoordinate: possibleWin.nullCoordinate };
        }
      }
    }
  }

  // make random move
  // Todo: check if with random move other player has chance to win
  const computerTokensWithEmptyAdjacentFields = getCoordinatesWithValue(
    matrix,
    PLAYER.ONE
  ).filter((coordinate) => {
    return Array.from(getAdjacentFields(coordinate)).some(
      ({ x, y }) => matrix[x][y] === null
    );
  });
  const prevCoordinate =
    computerTokensWithEmptyAdjacentFields[
      Math.floor(Math.random() * computerTokensWithEmptyAdjacentFields.length)
    ];
  const emptyAdjacentFields = Array.from(
    getAdjacentFields(prevCoordinate)
  ).filter(({ x, y }) => matrix[x][y] === null);
  const newCoordinate =
    emptyAdjacentFields[Math.floor(Math.random() * emptyAdjacentFields.length)];
  return { newCoordinate, prevCoordinate };
};

export const calculateNewCoordinateOfComputerInSetPhase = (
  matrix: Matrix
): Coordinate => {
  const playedTokensPlayer = matrix
    .flatMap((rows) => rows)
    .filter((value) => value === PLAYER.ZERO);
  const nextTurnWillBeMove = playedTokensPlayer.length === 3;

  // check if computer can win then check if player can win
  let coordinate = getNullishPositionInLineWithTwoValues(
    matrix,
    PLAYER.ONE
  )?.[0]?.nullCoordinate;
  if (coordinate) return coordinate;

  if (nextTurnWillBeMove) {
    const checkTheseCoordinates = getNullishPositionInLineWithTwoValues(
      matrix,
      PLAYER.ZERO
    );
    if (checkTheseCoordinates.length > 0) {
      for (let i = 0; i < checkTheseCoordinates.length; i++) {
        const possibleWin = checkTheseCoordinates[i];
        const adjFields = getAdjacentFields(possibleWin.nullCoordinate);
        const opponentCanWinWithThisToken = Array.from(adjFields).find(
          (field) =>
            matrix[field.x][field.y] === PLAYER.ZERO &&
            !possibleWin.line.find(
              (coord) => coord.x === field.x && coord.y === field.y
            )
        );
        if (opponentCanWinWithThisToken) {
          return possibleWin.nullCoordinate;
        }
      }
    }
  } else {
    coordinate = getNullishPositionInLineWithTwoValues(matrix, PLAYER.ZERO)?.[0]
      ?.nullCoordinate;
    if (coordinate) return coordinate;
  }

  // get random null coordinate
  const nullCoordinates = getCoordinatesWithValue(matrix, null);
  return nullCoordinates[Math.floor(Math.random() * nullCoordinates.length)];
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

const getNullishPositionInLineWithTwoValues = (
  matrix: Matrix,
  id: PLAYER
): PossibleWin[] => {
  const result: { nullCoordinate: Coordinate; line: Coordinate[] }[] = [];
  // columns check
  for (let y = 0; y < Object.values(columns).length; y++) {
    const columnValues: (PLAYER | null)[] = Object.values(columns)[y].map(
      ({ x: a, y: b }) => matrix[a][b]
    );
    if (lineHasTowValuesOfIdAndOneNullValue(columnValues, id)) {
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
    if (lineHasTowValuesOfIdAndOneNullValue(rowValues, id)) {
      const y = rowValues.findIndex((value) => value === null);
      result.push({
        nullCoordinate: { x, y },
        line: row,
      });
    }
  }

  // diagonals check
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

  for (let index = 0; index < diagonals.length; index++) {
    const diagonal = diagonals[index];
    const values = diagonal.map(({ x, y }) => matrix[x][y]);
    if (lineHasTowValuesOfIdAndOneNullValue(values, id)) {
      result.push({
        nullCoordinate: diagonals[index].find(
          ({ x, y }) => matrix[x][y] === null
        )!,
        line: diagonals[index],
      });
    }
  }
  return result;
};

const lineHasTowValuesOfIdAndOneNullValue = (
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
