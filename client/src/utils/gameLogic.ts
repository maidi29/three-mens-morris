import { Coordinate } from "../components/features/Game/Game";
import { Matrix } from "../store/store";

export interface WinnerInfo {
  winner: 0 | 1 | null;
  winningFields: Set<Coordinate>;
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
  coordinate: Coordinate,
  set: Set<Coordinate>
): boolean =>
  Array.from(set).some(
    (value) => value.x === coordinate.x && value.y === coordinate.y
  );

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
