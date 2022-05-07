import React, { useEffect, useRef, useState } from "react";
import gameService from "../../services/gameService";
import socketService from "../../services/socketService";
import {Room, useStore} from "../../store/store";

const boardSize = 100;

interface GameProps {
}

export function Game({ }: GameProps): JSX.Element {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const gameRoom: Room | undefined = useStore(({ room }) => room);
  const { setGameFinished } = useStore();
  const [listenersAttached, setListenersAttached] = useState(false);
  const [context, setContext] = useState<CanvasRenderingContext2D>();

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

  useEffect(()=> {
    if (context) {
      console.log(context);
      context.strokeStyle = '#000';
      context.lineWidth   = 2;
      context.strokeRect(0, 0, boardSize, boardSize);
      context.beginPath();

      context.moveTo(0, 0);
      context.lineTo(boardSize, boardSize);
      context.moveTo(boardSize, 0);
      context.lineTo(0, boardSize);
      context.moveTo((boardSize/2),0);
      context.lineTo((boardSize/2),boardSize);
      context.moveTo(0,(boardSize/2));
      context.lineTo(boardSize,(boardSize/2));
      context.stroke();
    }
  },[context]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d');
    if(context)  {
      setContext(context);
    }
    if (!listenersAttached) {
      handlePlayerLeft();
      handleGameEnd();
      setListenersAttached(true);
    }
  }, []);

  return (
    <canvas ref={canvasRef} width="300" height="300"></canvas>
  );
}
