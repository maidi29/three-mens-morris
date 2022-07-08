import React, { useEffect, useState } from "react";
import gameService, { Turn } from "../../services/gameService";
import socketService from "../../services/socketService";
import { PLAYER, useStore } from "../../store/store";
import styles from "./Game.module.scss";
import { Board } from "../Board/Board";
import roomService from "../../services/roomService";
import toast from "react-hot-toast";
import { ShareInfo } from "../ShareInfo/ShareInfo";
import { StatusBox } from "../StatusBox/StatusBox";
import { PlayerInfoBox } from "../PlayerInfoBox/PlayerInfoBox";
import { Fields } from "../Fields/Fields";

export type Coordinate = { x: number; y: number };

export function Game(): JSX.Element {
  const setGameFinished = useStore((state) => state.setGameFinished);
  const setActivePlayer = useStore((state) => state.setActivePlayer);
  const setOpponent = useStore((state) => state.setOpponent);
  const winner = useStore((state) => state.winner);
  const me = useStore((state) => state.me);
  const playStone = useStore((state) => state.playStone);
  const resetActiveGameButKeepRoom = useStore(
    (state) => state.resetActiveGameButKeepRoom
  );
  const gameFinished = useStore((state) => state.gameFinished);
  const increaseScore = useStore((state) => state.increaseScore);
  const updateMatrix = useStore((state) => state.updateMatrix);
  const setWinningFields = useStore((state) => state.setWinningFields);
  const setActivated = useStore((state) => state.setActivated);
  const [listenersAttached, setListenersAttached] = useState(false);

  const reactivate = () => {
    setActivated(true, false, true);
    resetActiveGameButKeepRoom();
    if (socketService.socket) {
      void gameService.reactivate(socketService.socket);
    }
  };

  const handleReactivate = () => {
    if (socketService.socket) {
      void gameService.onReactivate(socketService.socket, () => {
        setActivated(false, true, true);
      });
    }
  };

  const handleTurnFinished = () => {
    if (socketService.socket) {
      void gameService.onTurnFinished(socketService.socket, (turn: Turn) => {
        updateMatrix(turn.newCoordinate, turn.playerId, turn.prevCoordinate);
        setActivePlayer(
          turn.playerId === PLAYER.ZERO ? PLAYER.ONE : PLAYER.ZERO
        );
        playStone(turn.playerId, turn.newCoordinate, turn.prevCoordinate);
      });
    }
  };

  const handleOpponentLeft = () => {
    if (socketService.socket) {
      void roomService.onOpponentLeft(socketService.socket, () => {
        setOpponent(undefined);
        toast("Opponent left! Start a new game by reloading the page.", {
          icon: "🚪🚶",
          duration: 3000,
        });
      });
    }
  };

  const handleOpponentJoin = () => {
    if (socketService.socket) {
      void roomService.onOpponentJoined(socketService.socket, (player) => {
        setOpponent(player);
      });
    }
  };

  useEffect(() => {
    if (winner !== null) {
      setActivePlayer(null);
      setGameFinished(true);
      setActivated(true, true, false);
      increaseScore(winner);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [winner]);

  useEffect(() => {
    if (!gameFinished) {
      setWinningFields(new Set<Coordinate>());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameFinished]);

  useEffect(() => {
    if (!listenersAttached) {
      handleOpponentJoin();
      handleOpponentLeft();
      handleTurnFinished();
      handleReactivate();
      setListenersAttached(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      {me?.id === PLAYER.ZERO && <ShareInfo />}
      <div className={styles.game}>
        <StatusBox reactivate={reactivate} />

        <div className={styles.board}>
          <Board />
          <Fields />
        </div>
        <PlayerInfoBox />
      </div>
    </>
  );
}
