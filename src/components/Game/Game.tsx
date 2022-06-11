import React, { useEffect, useRef, useState } from "react";
import gameService from "../../services/gameService";
import socketService from "../../services/socketService";
import {Room, useStore} from "../../store/store";
import styles from './Game.module.scss';
import {Stone} from "../Octagon/Stone";
import classnames from "classnames";

interface GameProps {
}

export type Matrix = Array<Array<number | null>>;
export type Coordinate = {x: number, y: number};

export function Game({ }: GameProps): JSX.Element {
  const [matrix, setMatrix] = useState<Matrix>([
    [null, null, null],
    [null, null, null],
    [null, null, null],
  ]);
  const { setGameFinished, setActivePlayer, room, activePlayer } = useStore();
  const [listenersAttached, setListenersAttached] = useState(false);
  const [winningFields, setWinningFields] = useState<Coordinate[]>([]);
  const [winnerSymbol, setWinnerSymbol] = useState<number | null>(null);
  const [adjacentFields, setAdjacentFields] = useState<Coordinate[]>([]);

  const getAdjacentFields = (x: number, y: number): void =>  {
    const betweenIndices = (num: number) => num >= 0 && num <= 2;
    const nonDiagonalCoordinates = [{x:1, y:0}, {x:2,y:1}, {x:0,y:1}, {x:1,y:2}];
    setAdjacentFields([
        {x:x-1,y}, {x:x+1,y},
        {x,y:y-1}, {x,y:y+1},
        ...(nonDiagonalCoordinates.some((value)=>value.x === x && value.y === y) ? [] : [{x:x+1,y:y+1}, {x:x-1,y:y-1},
        {x:x-1,y:y+1}, {x:x+1,y:y-1}])
    ].filter(({x,y}) => betweenIndices(x) && betweenIndices(y)));
  }

  const checkWinner = (matrix: Matrix) => {
    // columns check
    for (let y = 0; y < 3; y++) {
      // check if every value in column y is the same and therefore Set has only one value (and is not null)
      if (matrix[0][y] !== null && (new Set([0,1,2].map((x)=>matrix[x][y]))).size === 1) {
        setWinnerSymbol(matrix[0][y]); // store first value of winning column as winner symbol
        setWinningFields([0,1,2].map((x)=>({x,y})));
        return;
      }
    }

    // rows check
    for (let x = 0; x < 3; x++) {
      // check if every value in row x is the same and therefore Set has only one value (and is not null)
      if (matrix[x][0] !== null && (new Set(matrix[x])).size === 1) {
        setWinnerSymbol(matrix[x][0]); // store first value of winning row as winner symbol
        setWinningFields(matrix[1].map((value, y) => ({x,y})));
        return;
      }
    }

    // diagonals check
    // check if middle value is not null and then check the two diagonals for same value
    if (matrix[1][1] !== null) {
      if ((new Set([matrix[0][0], matrix[1][1], matrix[2][2]])).size === 1 )  {
        setWinningFields([{x:0,y:0}, {x:1,y:1}, {x:2,y:2}]);
        setWinnerSymbol(matrix[1][1]); // store the middle value as winner symbol
      } else if ((new Set([matrix[0][2], matrix[1][1], matrix[2][0]])).size === 1) {
        setWinningFields([{x:0,y:2}, {x:1,y:1}, {x:2,y:0}]);
        setWinnerSymbol(matrix[1][1]); // store the middle value as winner symbol
      }
    }
  }


  const updateMatrix = (x: number, y: number, player: number) => {
    const newMatrix = [...matrix];
    const newPlayer = activePlayer === 0 ? 1 : 0;

    if (newMatrix[x][y] === null) {
      newMatrix[x][y] = player;
      setMatrix(newMatrix);
      setActivePlayer(newPlayer);
    }
  }

  const gameEnd = (isEnd: boolean) => {
    if (socketService.socket) {
      gameService.gameEnd(socketService.socket, isEnd);
    }
  };

  const handleGameEnd = () => {
    if (socketService.socket) {
      gameService.onGameEnd(socketService.socket, (isEnd) => {
        setGameFinished(isEnd);
      });
    }
  };

  const handlePlayerLeft = () => {
    if (socketService.socket) {
      //gameService.onPlayerLeft(socketService.socket, (playerName) =>
        //removePlayer(playerName)
      //);
    }
  };

  useEffect(() => {
    console.log(matrix);
    checkWinner(matrix);
  }, [matrix]);

  useEffect(() => {
    console.log('adjacentfields', adjacentFields);
  }, [adjacentFields]);


  useEffect(() => {
    if (!listenersAttached) {
      handlePlayerLeft();
      handleGameEnd();
      setListenersAttached(true);
    }
  }, []);

  return (
      <div className={styles.game}>
        <div className={classnames(styles.controls)}>
          <h3>Me:</h3>
          {[0,1,2,].map(()=>(
              <Stone emoji="👽"/>
          ))}
        </div>
        <div className={styles.board}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 500" shapeRendering="geometricPrecision" textRendering="geometricPrecision">
            <rect width="490" height="490" rx="0" ry="0" transform="translate(5 5)" fill="none" stroke="#000" strokeWidth="5" strokeLinecap="round"/>
            <line x1="-245" y1="-245" x2="245" y2="245" transform="translate(250 250)" fill="none" stroke="#000" strokeWidth="5"/>
            <line x1="245" y1="-245" x2="-245" y2="245" transform="translate(250 250)" fill="none" stroke="#000" strokeWidth="5"/>
            <line x1="-245" y1="0" x2="245" y2="0" transform="translate(250 250)" fill="none" stroke="#000" strokeWidth="5"/>
            <line x1="0" y1="240" x2="0" y2="-250" transform="translate(250 255)" fill="none" stroke="#000" strokeWidth="5"/>
          </svg>

          <div className={styles.fields}>
            {matrix.map((row, x) => (
                <div className={styles.row}>
                  {row.map((value, y)=> (
                      <button
                          className={classnames(
                              styles.field,
                              // Todo: how could be better checked if array (or better set) contains an object
                              winningFields.some((value)=>value.x === x && value.y === y) && styles.winningField,
                              adjacentFields.some((value)=>value.x === x && value.y === y) && styles.adjacentField
                          )}
                          onClick={() =>{
                            getAdjacentFields(x,y);
                            updateMatrix(x,y,activePlayer);
                          }}
                          disabled={value!==null}>{value}</button>
                  ))}
                </div>
            ))}
          </div>
      </div>

        <div className={styles.controls}>
          <h3>Opponent:</h3>
          {[0,1,2,].map(()=>(
                <Stone color="#74f9ab" emoji="🤖"/>
          ))}
        </div>

      </div>
  );
}
