import React, { useEffect, useRef, useState } from "react";
import gameService from "../../services/gameService";
import socketService from "../../services/socketService";
import {Room, useStore} from "../../store/store";

const boardSize = 400;

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

  const drawBoardLines = (context: CanvasRenderingContext2D) => {
      context.strokeStyle = '#000';
      context.lineWidth = 8;
      context.strokeRect(0, 0, boardSize, boardSize);
      context.lineWidth = 4;
      context.beginPath();
      context.moveTo(0, 0);
      context.lineTo(boardSize, boardSize);
      context.moveTo(boardSize, 0);
      context.lineTo(0, boardSize);
      context.moveTo((boardSize / 2), 0);
      context.lineTo((boardSize / 2), boardSize);
      context.moveTo(0, (boardSize / 2));
      context.lineTo(boardSize, (boardSize / 2));
      context.closePath();
      context.stroke();
  }

  const drawCircle = (context: CanvasRenderingContext2D, x: number, y: number, radius: number) => {
      context.fillStyle = '#9cadce ';
      context.beginPath();
      context.arc(x, y, radius, 0, Math.PI *2);
      context.closePath();
      context.fill();
  }

  useEffect(()=> {
    if (context) {
      drawBoardLines(context);
      drawCircle(context, 0,0,10);
      drawCircle(context, 0, boardSize,10);
      drawCircle(context, boardSize,0,10);
      drawCircle(context, boardSize,boardSize,10);
      drawCircle(context, boardSize/2,boardSize/2,10);
      drawCircle(context, boardSize/2,0,10);
      drawCircle(context, 0,boardSize/2,10);
      drawCircle(context, boardSize,boardSize/2,10);
      drawCircle(context, boardSize/2,boardSize,10);
    }
  },[context]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.style.width = "400px";
      canvas.style.height = "400px";
      const dpi = window.devicePixelRatio;
      const context = canvas.getContext('2d');
      if (context)  {
        context.scale(dpi,dpi);
        setContext(context);
      }
    }

    if (!listenersAttached) {
      handlePlayerLeft();
      handleGameEnd();
      setListenersAttached(true);
    }
  }, []);

  return (
    <canvas ref={canvasRef} width="800" height="800"></canvas>
  );
}
