import React, { useEffect, useState } from "react";
import gameService, { Turn } from "../../../services/gameService";
import socketService from "../../../services/socketService";
import { PHASE, PLAYER, useStore } from "../../../store/store";
import styles from "./Game.module.scss";
import { Board } from "../../elements/Board/Board";
import roomService from "../../../services/roomService";
import toast from "react-hot-toast";
import { ShareInfo } from "../ShareInfo/ShareInfo";
import { StatusBox } from "../StatusBox/StatusBox";
import { PlayerInfoBox } from "../PlayerInfoBox/PlayerInfoBox";
import { Fields } from "../Fields/Fields";
import {
  getComputerTurnInMovePhase,
  getComputerTurnInSetPhase,
} from "../../../utils/computerPlayer";

export type Coordinate = { x: number; y: number };

export const Game = (): JSX.Element => {
  const setGameFinished = useStore((state) => state.setGameFinished);
  const setActivePlayer = useStore((state) => state.setActivePlayer);
  const setOpponent = useStore((state) => state.setOpponent);
  const winner = useStore((state) => state.winner);
  const me = useStore((state) => state.me);
  const opponent = useStore((state) => state.opponent);
  const gameFinished = useStore((state) => state.gameFinished);
  const increaseScore = useStore((state) => state.increaseScore);
  const setWinningFields = useStore((state) => state.setWinningFields);
  const setActivated = useStore((state) => state.setActivated);
  const activePlayer = useStore((state) => state.activePlayer);
  const matrix = useStore((state) => state.matrix);
  const phase = useStore((state) => state.phase);
  const takeTurn = useStore((state) => state.takeTurn);
  const resetActiveGameButKeepRoom = useStore(
    (state) => state.resetActiveGameButKeepRoom
  );
  const [listenersAttached, setListenersAttached] = useState(false);

  const reactivate = () => {
    setActivated(true, opponent?.isComputer || false, true);
    resetActiveGameButKeepRoom();
    if (socketService.socket) {
      void gameService.reactivate(socketService.socket);
    } else {
      toast("Connection Error! Please reload to start a new game.", {
        icon: "❗",
        duration: 3000,
      });
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
        takeTurn(turn);
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
    if (
      opponent?.isComputer &&
      activePlayer === opponent?.id &&
      !gameFinished
    ) {
      setTimeout(() => {
        takeTurn({
          ...(phase === PHASE.SET
            ? {
                newCoordinate:
                  getComputerTurnInSetPhase(matrix),
              }
            : { ...getComputerTurnInMovePhase(matrix) }),
          playerId: PLAYER.ONE,
        });
      }, 1000);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activePlayer, opponent?.activated]);

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
      {me?.id === PLAYER.ZERO && !opponent && <ShareInfo />}
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
};
