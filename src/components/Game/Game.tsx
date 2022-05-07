import React, { useEffect, useRef, useState } from "react";
import gameService from "../../services/gameService";
import socketService from "../../services/socketService";
import {Room, useStore} from "../../store/store";

const radius = 10;
const boardSize = 400;
const rectSize = boardSize-radius;
const rectWidth = boardSize-radius*2;


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
      context.lineWidth = 4;
      context.strokeRect(radius, radius, rectWidth, rectWidth);
      context.beginPath();
      context.moveTo(radius, radius);
      context.lineTo(rectSize, rectSize);
      context.moveTo(rectSize, radius);
      context.lineTo(radius, rectSize);
      context.moveTo(boardSize / 2, radius);
      context.lineTo(boardSize / 2, rectSize);
      context.moveTo(radius, boardSize / 2);
      context.lineTo(rectSize, boardSize / 2);
      context.closePath();
      context.stroke();
  }

  const drawBoardCircles = (context: CanvasRenderingContext2D) => {
      drawCircle(context, radius,radius,radius);
      drawCircle(context, radius, rectSize,radius);
      drawCircle(context, rectSize,radius,radius);
      drawCircle(context, rectSize,rectSize,radius);
      drawCircle(context, boardSize/2,boardSize/2,radius);
      drawCircle(context, boardSize/2,radius,radius);
      drawCircle(context, radius,boardSize/2,radius);
      drawCircle(context, rectSize,boardSize/2,radius);
      drawCircle(context, boardSize/2,rectSize,radius);
    }

  const drawCircle = (context: CanvasRenderingContext2D, x: number, y: number, radius: number) => {
      context.fillStyle = '#fff';
      context.beginPath();
      context.arc(x, y, radius, 0, Math.PI *2);
      context.closePath();
      context.fill();
  }

  useEffect(()=> {
    if (context) {
      drawBoardLines(context);
      drawBoardCircles(context);
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
    <canvas ref={canvasRef} width="800" height="800"/>
  );
}
