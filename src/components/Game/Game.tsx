import React, { useEffect, useRef, useState } from "react";
import gameService from "../../services/gameService";
import socketService from "../../services/socketService";
import {Room, useStore} from "../../store/store";
import styles from './Game.module.scss';
import {useWindowSize} from "../../hooks/useWindowSize";






interface GameProps {
}

export function Game({ }: GameProps): JSX.Element {
  const gameRoom: Room | undefined = useStore(({ room }) => room);
  const { setGameFinished } = useStore();
  const [listenersAttached, setListenersAttached] = useState(false);

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

    if (!listenersAttached) {
      handlePlayerLeft();
      handleGameEnd();
      setListenersAttached(true);
    }
  }, []);

  useEffect(()=> {

  },[])

  return (
      <div className={styles.game}>
        <svg id="eDgLJwr7eqf1" xmlns="http://www.w3.org/2000/svg"  viewBox="0 0 500 500" shapeRendering="geometricPrecision" textRendering="geometricPrecision">
          <rect width="480" height="480" rx="0" ry="0" transform="translate(10 10)" fill="none" stroke="#000" strokeWidth="5" strokeLinecap="round"/>
          <line x1="-240" y1="-240" x2="240" y2="240" transform="translate(250 250)" fill="none" stroke="#000" strokeWidth="5"/>
          <line x1="240" y1="-240" x2="-240" y2="240" transform="translate(250 250)" fill="none" stroke="#000" strokeWidth="5"/>
          <line x1="-240" y1="0" x2="240" y2="0" transform="translate(250 250)" fill="none" stroke="#000" strokeWidth="5"/>
          <line x1="0" y1="235" x2="0" y2="-245" transform="translate(250 255)" fill="none" stroke="#000" strokeWidth="5"/>
        </svg>

          {/*<canvas className={styles.canvas} ref={canvasRef} width="800" height="800"/>*/}
      </div>
  );
}
