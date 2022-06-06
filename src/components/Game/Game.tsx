import React, { useEffect, useRef, useState } from "react";
import gameService from "../../services/gameService";
import socketService from "../../services/socketService";
import {Room, useStore} from "../../store/store";
import styles from './Game.module.scss';
import {useWindowSize} from "../../hooks/useWindowSize";

/*const radius = 10;
const boardSize = 400;
const rectSize = boardSize-radius;
const rectWidth = boardSize-radius*2;*/





interface GameProps {
}

export function Game({ }: GameProps): JSX.Element {
  const strokeWidth = 5;
  const gameRoom: Room | undefined = useStore(({ room }) => room);
  const { setGameFinished } = useStore();
  const [ listenersAttached, setListenersAttached ] = useState(false);
  const [ widthHeight, setWidthHeight ] = useState(500 - strokeWidth*4);
  const { height, width } = useWindowSize();

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

  /*useEffect(()=> {
    if (width && height) {
      const value = Math.min(width, height);
      setWidthHeight(value*0.7 - strokeWidth*4)
    }
  },[width, height])*/

  useEffect(()=> {

  })

  return (
      <div className={styles.game}>
          <svg id="eDgLJwr7eqf1" xmlns="http://www.w3.org/2000/svg" viewBox={`0 0 ${widthHeight + strokeWidth*4} ${widthHeight + strokeWidth*4}`} shapeRendering="geometricPrecision" textRendering="geometricPrecision">
              <rect width={widthHeight} height={widthHeight} rx="0" ry="0" transform={`translate(${strokeWidth*2} ${strokeWidth*2})`} paintOrder="stroke fill markers" fill="none" stroke="#000" strokeWidth={strokeWidth} strokeLinecap="round"/>
              <line x1={-widthHeight/2} y1={-widthHeight/2} x2={widthHeight/2} y2={widthHeight/2} transform={`translate(${(widthHeight + strokeWidth*4)/2} ${(widthHeight + strokeWidth*4)/2})`} fill="none" stroke="#000" strokeWidth={strokeWidth}/>
              <line x1={widthHeight/2} y1={-widthHeight/2} x2={-widthHeight/2} y2={widthHeight/2} transform={`translate(${(widthHeight + strokeWidth*4)/2} ${(widthHeight + strokeWidth*4)/2})`} fill="none" stroke="#000" strokeWidth={strokeWidth}/>
              <line x1={-widthHeight/2} y1="0" x2={widthHeight/2} y2="0" transform={`translate(${(widthHeight + strokeWidth*4)/2} ${(widthHeight + strokeWidth*4)/2})`} fill="none" stroke="#000" strokeWidth={strokeWidth}/>
              <line x1="0" y1={(widthHeight/2)-strokeWidth} x2="0" y2={-((widthHeight/2)+strokeWidth)} transform={`translate(${(widthHeight + strokeWidth*4)/2} ${(widthHeight + strokeWidth*4)/2+strokeWidth})`} fill="none" stroke="#000" strokeWidth={strokeWidth}/>
          </svg>

          {/*<canvas className={styles.canvas} ref={canvasRef} width="800" height="800"/>*/}
      </div>
  );
}
