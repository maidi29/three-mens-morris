import React, { useEffect, useRef, useState } from "react";
import gameService from "../../services/gameService";
import socketService from "../../services/socketService";
import {Room, useStore} from "../../store/store";
import styles from './Game.module.scss';
import {Stone} from "../Stone/Stone";
import classnames from "classnames";
import {checkWinning, coordinateExistsInSet, getAdjacentFields} from "../../utils/boardLogic";
import {Board} from "../Board/Board";

interface GameProps {
}

export type Matrix = Array<Array<0 | 1 | null>>;
export type Coordinate = {x: number, y: number};

export function Game({ }: GameProps): JSX.Element {
  const [matrix, setMatrix] = useState<Matrix>([
    [null, null, null],
    [null, null, null],
    [null, null, null],
  ]);
  const { setGameFinished, setActivePlayer, room, activePlayer, winner, setWinner, opponent, me, setOpponent } = useStore();
  const [listenersAttached, setListenersAttached] = useState(false);
  const [winningFields, setWinningFields] = useState(new Set<Coordinate>());
  const [adjacentFields, setAdjacentFields] = useState(new Set<Coordinate>());

  const checkWinner = (matrix: Matrix) => {
    const winnerInfo = checkWinning(matrix);
    if(winnerInfo) {
      setWinner(winnerInfo.winner);
      setWinningFields(winnerInfo.winningFields);
    }
  }


  const updateMatrix = (x: number, y: number, player: 0 | 1) => {
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

  const handlePlayerJoin = () => {
    if (socketService.socket) {
      gameService.onPlayerJoined(socketService.socket, (player) => {
        player.score = 0;
        setOpponent(player);
      });
    }
  };


  useEffect(() => {
    checkWinner(matrix);
  }, [matrix]);


  useEffect(() => {
    if (!listenersAttached) {
      handlePlayerLeft();
      handlePlayerJoin();
      handleGameEnd();
      setListenersAttached(true);
    }
  }, []);

  return (
      <>
      <h2>{room?.roomId}</h2>

  <div className={styles.game}>
        <div className={classnames(styles.controls)}>
          <h3>Me: {me?.id}</h3>
          {[0,1,2,].map(()=>(
              <Stone emoji={me?.symbol || '👽'}/>
          ))}
        </div>
        <div className={styles.board}>
          <Board/>
          <div className={styles.fields}>
            {matrix.map((row, x) => (
                <div className={styles.row}>
                  {row.map((value, y)=> (
                      <button
                          className={classnames(
                              styles.field,
                              coordinateExistsInSet( {x,y}, winningFields) && styles.winningField,
                              coordinateExistsInSet( {x,y}, adjacentFields) && styles.adjacentField
                          )}
                          onClick={() =>{
                            setAdjacentFields(getAdjacentFields(x,y));
                            updateMatrix(x,y,activePlayer);
                          }}
                          disabled={value!==null}>{value}</button>
                  ))}
                </div>
            ))}
          </div>
      </div>

     <div className={styles.controls}>
       {opponent ?
           <>
             <h3>Opponent: {opponent?.id}</h3>
             {[0,1,2,].map(()=>(
                 <Stone color="#74f9ab" emoji={opponent?.symbol || "🤖"}/>
             ))}
           </> :
           <h3>Opponent not yet joined</h3>}
        </div>

      </div>
      </>
  );
}
