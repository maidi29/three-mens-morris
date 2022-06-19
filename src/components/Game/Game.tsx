import React, {useEffect, useState} from "react";
import gameService, {Turn} from "../../services/gameService";
import socketService from "../../services/socketService";
import {PHASE, PLAYER, useStore} from "../../store/store";
import styles from './Game.module.scss';
import {Stone} from "../Stone/Stone";
import classnames from "classnames";
import {coordinateExistsInSet, getAdjacentFields} from "../../utils/boardLogic";
import {Board} from "../Board/Board";
import roomService from "../../services/roomService";
import Lottie from 'react-lottie';
import pop from '../../lotties/pop.json';

export type Coordinate = {x: number, y: number};

export function Game(): JSX.Element {
  const {
    setGameFinished, activePlayer, setActivePlayer, room, winner, opponent, me, setOpponent, phase, setPhase, nonPlayedStones,
    playStone, playedStones, resetActiveGameButKeepRoom, gameFinished, increaseScore, matrix, updateMatrix, winningFields,
    adjacentFields, setAdjacentFields, setWinningFields, setActivated
  } = useStore();
  const [listenersAttached, setListenersAttached] = useState(false);
  const [prevCoordinate, setPrevCoordinate] = useState<Coordinate | undefined>();

  const turnFinished = (coord: Coordinate) => {
    if (socketService.socket) {
      setPrevCoordinate(undefined);
      gameService.turnFinished(socketService.socket, {newCoordinate: coord, playerId: activePlayer || 0, ...(phase === PHASE.MOVE && {prevCoordinate})})
    }
  };

  const handleTurnFinished = () => {
    if (socketService.socket) {
      gameService.onTurnFinished(socketService.socket, (turn: Turn) => {
        updateMatrix(turn.newCoordinate, turn.playerId, turn.prevCoordinate);
        setActivePlayer(turn.playerId === PLAYER.ZERO ? PLAYER.ONE : PLAYER.ZERO);
        playStone(turn.playerId, turn.newCoordinate, turn.prevCoordinate);
      });
    }
  };

  const reactivate = () => {
    setActivated(true, false, true);
    resetActiveGameButKeepRoom();
    if (socketService.socket) {
      gameService.reactivate(socketService.socket);
    }
  };

  const handleReactivate = () => {
    if (socketService.socket) {
      gameService.onReactivate(socketService.socket, () => {
        console.log('opponent reactivate');
        setActivated(false, true, true);
      });
    }
  };

  const handleOpponentLeft = () => {
    if (socketService.socket) {
      roomService.onOpponentLeft(socketService.socket, () =>
        setOpponent(undefined)
      );
    }
  };

  const handleOpponentJoin = () => {
    if (socketService.socket) {
      roomService.onOpponentJoined(socketService.socket, (player) => {
        setOpponent(player);
      });
    }
  };

  useEffect(() => {
    if (winner !== null) {
      setActivePlayer(null);
      setGameFinished(true);
      setActivated(true,true,false);
      increaseScore(winner);
    }
  }, [winner]);

  useEffect(() => {
    if (!gameFinished) {
      setWinningFields(new Set<Coordinate>());
    }
  }, [gameFinished]);

  useEffect(() => {
    if (!listenersAttached) {
      handleOpponentJoin();
      handleOpponentLeft();
      handleTurnFinished();
      handleReactivate();
      setListenersAttached(true);
    }
  }, []);

  const isFieldEnabled = (value: PLAYER | null, coord: Coordinate): boolean => {
    if (activePlayer === me?.id && winner === null && opponent?.activated) {
      if (phase === PHASE.SET) {
        return value === null;
      } else if (phase === PHASE.MOVE) {
        if (prevCoordinate) {
          return coordinateExistsInSet(coord, adjacentFields) && value === null;
        } else {
          const emptyAdjacentFields = Array.from(getAdjacentFields(coord)).filter(({x, y}) => matrix[x][y] === null);
          return value === me?.id && emptyAdjacentFields.length > 0;
        }
      }
      return false;
    }
    return false;
  }

  return (
      <>
      <h2>Room ID: {room?.roomId}</h2>
      <div className={styles.game}>

        <div className={styles.status}>

        { !opponent || (!gameFinished && !opponent.activated) ?
            <h2 className={styles.pulse}>Wait for opponent to join</h2> :
            winner !== null ?
                <>
                  { winner === me?.id ?
                      <div className={styles.winningText}>
                        <h2 className={styles.pulse}>You win</h2>
                        <Lottie
                            options={{
                              loop: true,
                              autoplay: true,
                              animationData: pop,
                              rendererSettings: {
                                preserveAspectRatio: "xMidYMid slice",
                              }}}
                            height={90}
                            width={150}
                        />
                      </div> : <h2>You lose</h2> }
                      <button className={classnames('button', styles.playAgain)} onClick={reactivate}>
                        Play again
                      </button>
                </> :
                (activePlayer === me?.id ? <h2 className={styles.pulse}>your turn {winner}</h2> : <h2>opponents turn {winner}</h2>)
        }
        </div>

        <div className={styles.board}>
          <Board/>
          <div className={styles.fields}>
            <>
              {playedStones.map(({element, position}) =>
                  <div className={classnames(styles.stone, styles[`s${position}`])}>{element}</div>)}
              {matrix.map((row, x) => (
                <div className={styles.row}>
                  {row.map((value, y)=> (
                      <button
                          className={classnames(
                              styles.field,
                              coordinateExistsInSet( {x,y}, winningFields) && styles.winningField,
                              isFieldEnabled(value, {x,y}) && styles.activeField
                          )}
                          onClick={() =>{
                            if (activePlayer === me?.id && opponent) {
                              if (phase === PHASE.MOVE && !prevCoordinate) {
                                setAdjacentFields(getAdjacentFields({x,y}));
                                setPrevCoordinate({x,y});
                              } else {
                                turnFinished({x,y})
                              }
                            }
                          }}
                          disabled={!isFieldEnabled(value, {x,y})}/>
                  ))}
                </div>
            ))}
            </>
          </div>
      </div>


        <div className={styles.playerInfo}>
          <div className={styles.playerBox}>
            <div className={styles.head}>
            <h3>{me?.symbol} Me</h3>
            <div className={styles.score}>{me?.score}</div>
            </div>
            <div className={styles.nonPlayedStones}>
            { me && nonPlayedStones[me?.id].map(()=>(
                <Stone emoji={me.symbol} color={me?.color} size={4}/>
            ))}
            </div>
          </div>

          <div className={styles.playerBox}>
         {opponent &&
             <>
               <div className={styles.head}>
                 <h3>{opponent?.symbol} Opponent</h3>
                 <div className={styles.score}>
                   {opponent?.score}
                 </div>
               </div>
               <div className={styles.nonPlayedStones}>
                  {nonPlayedStones[opponent.id].map(()=>(
                     <Stone color={opponent?.color} emoji={opponent?.symbol} size={4}/>
                 ))}
               </div>
           </>}
          </div>
        </div>

      </div>
      </>
  );
}
