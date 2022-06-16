import React, {useCallback, useEffect, useRef, useState} from "react";
import gameService, {Turn} from "../../services/gameService";
import socketService from "../../services/socketService";
import {PLAYER, Room, useStore} from "../../store/store";
import styles from './Game.module.scss';
import {Stone} from "../Stone/Stone";
import classnames from "classnames";
import {checkWinning, coordinateExistsInSet, getAdjacentFields} from "../../utils/boardLogic";
import {Board} from "../Board/Board";
import roomService from "../../services/roomService";
import {cpus} from "os";

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
  const { setGameFinished, activePlayer, setActivePlayer, room, winner, setWinner, opponent, me, setOpponent, phase, setPhase, nonPlayedStones, playStone } = useStore();

  const [listenersAttached, setListenersAttached] = useState(false);
  const [winningFields, setWinningFields] = useState(new Set<Coordinate>());
  const [adjacentFields, setAdjacentFields] = useState(new Set<Coordinate>());
  const [roundClicks, setRoundClicks] = useState(0);
  const [prevCoordinate, setPrevCoordinate] = useState<Coordinate | undefined>();

  const checkWinner = (matrix: Matrix) => {
    const winnerInfo = checkWinning(matrix);
    if(winnerInfo) {
      setWinner(winnerInfo.winner);
      setWinningFields(winnerInfo.winningFields);
    }
  }

  const updateMatrix = ({x, y}: Coordinate, value: PLAYER | null, toBeRemoved?: Coordinate) => {
    const newMatrix = [...matrix];

    if (newMatrix[x][y] === null) {
      newMatrix[x][y] = value;
    }
    if (toBeRemoved) {
      matrix[toBeRemoved.x][toBeRemoved.y] = null;
    }
    setMatrix(newMatrix);
  }

  const gameEnd = (isEnd: boolean) => {
    if (socketService.socket) {
      gameService.gameEnd(socketService.socket, isEnd);
    }
  };

  const turnFinished = (coord: Coordinate) => {
    if (socketService.socket) {
      setRoundClicks(0);
      setAdjacentFields(new Set());
      gameService.turnFinished(socketService.socket, {newCoordinate: coord, playerId: activePlayer, ...(phase === 2 && {prevCoordinate})})
    }
  };

  const handleTurnFinished = () => {
    if (socketService.socket) {
      gameService.onTurnFinished(socketService.socket, (turn: Turn) => {
        updateMatrix(turn.newCoordinate, turn.playerId, turn.prevCoordinate);
        setActivePlayer(turn.playerId === 0 ? 1 : 0);
        playStone(turn.playerId);
      });
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
      roomService.onPlayerJoined(socketService.socket, (player) => {
        player.score = 0;
        setOpponent(player);
        setPhase(1);
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
      handleTurnFinished();
      setListenersAttached(true);
    }
  }, []);

  const isFieldEnabled = (value: PLAYER | null, coord: Coordinate): boolean => {
    if(activePlayer === me?.id) {
      if (phase === 1) {
        return value === null;
      } else if (phase === 2) {
        if (roundClicks === 0) {
          const emptyAdjacentFields = Array.from(getAdjacentFields(coord)).filter(({x,y}) => matrix[x][y] === null);
          return value === me?.id && emptyAdjacentFields.length > 0;
        } else {
          return coordinateExistsInSet(coord, adjacentFields) && value === null;
        }
      }
      return false;
    }
    return false;
  }

  return (
      <>
      <h2>Room ID: {room?.roomId}</h2>
        {opponent ?
            (activePlayer === me?.id ? <h2>your turn</h2> : <h2>opponents turn</h2>) :
            <>Wait for opponent to join</>}

      <div className={styles.game}>
        <div className={classnames(styles.controls)}>
          <h3>Me</h3>
          {me && nonPlayedStones[me?.id].map(()=>(
              <Stone emoji={me.symbol || '👽'}/>
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
                              (coordinateExistsInSet( {x,y}, adjacentFields) && value === null) && styles.adjacentField
                          )}
                          onClick={() =>{
                            if (activePlayer === me?.id && opponent) {
                              if (phase === 2 && roundClicks === 0) {
                                setAdjacentFields(getAdjacentFields({x,y}));
                                setRoundClicks(roundClicks + 1);
                                setPrevCoordinate({x,y});
                              } else {
                                turnFinished({x,y})
                              }
                            }
                          }}
                          disabled={!isFieldEnabled(value, {x,y})}>{value !== null ? value === me?.id ? me?.symbol : opponent?.symbol : ''}</button>
                  ))}
                </div>
            ))}
          </div>
      </div>

     <div className={styles.controls}>
       {opponent &&
           <>
             <h3>Opponent: {opponent?.id}</h3>
             {nonPlayedStones[opponent.id].map(()=>(
                 <Stone color="#74f9ab" emoji={opponent?.symbol || "🤖"}/>
             ))}
           </>}
        </div>

      </div>
      </>
  );
}
