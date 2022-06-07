import React, { useEffect, useRef, useState } from "react";
import gameService from "../../services/gameService";
import socketService from "../../services/socketService";
import {Room, useStore} from "../../store/store";
import styles from './Game.module.scss';
import {Stone} from "../Octagon/Stone";

interface GameProps {
}

export type Matrix = Array<Array<number | null>>;

export function Game({ }: GameProps): JSX.Element {
  const [matrix, setMatrix] = useState<Matrix>([
    [null, null, null],
    [null, null, null],
    [null, null, null],
  ]);
  const { setGameFinished, setActivePlayer, room, activePlayer } = useStore();
  const [listenersAttached, setListenersAttached] = useState(false);

  const getAdjacentFields = (x: number, y: number): {x: number, y: number}[] =>  {
    // Todo: check how to find adjacent fields in the most efficient way
    // check x-1, x+1, y-1, y+1
    // if diagonal field: check x+-1 & y+-1
    return [];
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
  }, [matrix]);


  useEffect(() => {
    if (!listenersAttached) {
      handlePlayerLeft();
      handleGameEnd();
      setListenersAttached(true);
    }
  }, []);

  return (
      <div className={styles.game}>
        <div className={styles.controls}>
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
                      <button className={styles.field} onClick={() =>updateMatrix(x,y,activePlayer)} disabled={value!==null}>{value}</button>
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
