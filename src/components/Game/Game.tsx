import React, {ReactNode, useEffect, useState} from "react";
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
import {copyToClipboard} from "../../utils/helper";
import toast from "react-hot-toast";

export type Coordinate = {x: number, y: number};

export function Game(): JSX.Element {
  const {
    setGameFinished, activePlayer, setActivePlayer, room, winner, opponent, me, setOpponent, phase, nonPlayedStones,
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
        setActivated(false, true, true);
      });
    }
  };

  const handleOpponentLeft = () => {
    if (socketService.socket) {
      roomService.onOpponentLeft(socketService.socket, () => {
            setOpponent(undefined);
            toast('Opponent left! Start a new game by reloading the page.', {icon:'🚪🚶', duration:3000})
          }
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

  const getStatusText = (): ReactNode => {
    if (!opponent || (!gameFinished && !opponent.activated)) {
        return <h2 className={styles.pulse} key="wait">Wait for opponent to join</h2>;
    } else if (winner === me?.id) {
      return <div className={styles.winningText}>
                    <h2 className={styles.pulse} key="victory">Victory</h2>
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
                  </div>
    } else if (winner === opponent?.id) {
      return <>
          <h2 className={styles.pulse} key="defeat">Defeat ☹</h2>
          <button className={classnames('button', styles.playAgain)} onClick={reactivate}>
            Play again
          </button>
        </>
    } else if (activePlayer === me?.id) {
      return <h2 className={styles.pulse} key="yourTurn">your turn</h2>
    } else {
      return <h2 className={styles.pulse} key="opponentsTurn">opponents turn</h2>
    }
  }

  return (
      <>
        { me?.id === PLAYER.ZERO &&
            <div className={styles.shareInfo}>
              <h2>Game ID: {room?.roomId}</h2>
              { !opponent &&
                  <button className={styles.shareButton} onClick={()=> {
                    if (navigator.share) {
                      navigator.share({
                        title: 'Invite',
                        text: "Play Three Men's Morris with me!",
                        url: `${window.location}?id=${room?.roomId}`
                      }).catch(console.error);
                    } else {
                      copyToClipboard(`${window.location}?id=${room?.roomId}`).then(
                          () => toast(`The invite link ${window.location}?id=${room?.roomId} was copied to clipboard.`, {icon:'📋', duration:10000}),
                          () => alert(`Failed to copy the invite link ${window.location}?id=${room?.roomId}. Please copy it yourself or tell them the Game ID to enter it manually.`));
                    }
                  }}>
                    <svg width="24" height="24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path fillRule="evenodd" clipRule="evenodd" d="M22 6a4 4 0 10-7.912.838L9.017 9.373a4 4 0 10-.329 5.589l5.33 2.665a4 4 0 10.686-1.893l-4.912-2.456a3.996 3.996 0 00.12-2.116l5.071-2.535A4 4 0 0022 6z" fill="currentColor"/>
                    </svg>
                  </button> }
            </div>}
      <div className={styles.game}>

        <div className={styles.statusBox}>
          <div className={styles.statusInfo}>
            {getStatusText()}
          </div>
          <div className={styles.phaseInfo}>
            {
              phase && opponent && !gameFinished && opponent.activated ?
                phase === PHASE.SET ?
                    <>
                      <h3>Placing Tokens</h3>
                      Players take turns placing their tokens on empty intersections
                    </>
                :
                    <>
                      <h3>Moving Tokens</h3>
                      Players move one of their tokens per turn to any adjacent linked empty position
                    </>
            : null}
          </div>
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
                          onClick={(event) => {
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
            <div className={styles.score}>
              {me?.score}
            </div>
            </div>
            <div className={styles.nonPlayedStones}>
            { me && nonPlayedStones[me?.id].map(()=>(
                <Stone emoji={me.symbol} color={me?.color} size={4}/>
            ))}
            </div>
          </div>
          {opponent &&
          <div className={styles.playerBox}>
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
          </div>}
        </div>

      </div>
      </>
  );
}
