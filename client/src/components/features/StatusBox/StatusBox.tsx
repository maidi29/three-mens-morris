import React, { ReactNode } from "react";
import styles from "./StatusBox.module.scss";
import Lottie from "react-lottie";
import { useStore } from "../../../store/store";
import { Button } from "../../elements/Button/Button";
import pop from "../../../lotties/pop.json";
import { Chat } from "../Chat/Chat";

interface StatusBoxProps {
  reactivate: () => void;
}
export const StatusBox = ({ reactivate }: StatusBoxProps): JSX.Element => {
  const opponent = useStore((state) => state.opponent);
  const gameFinished = useStore((state) => state.gameFinished);
  const winner = useStore((state) => state.winner);
  const me = useStore((state) => state.me);
  const activePlayer = useStore((state) => state.activePlayer);

  const playAgainButton = (
    <Button className={styles.playAgain} onClick={reactivate}>
      Play again
    </Button>
  );

  const getStatusText = (): ReactNode => {
    if (!opponent || (!gameFinished && !opponent.activated)) {
      return (
        <h2 className={styles.pulse} key="wait">
          Wait for opponent to join
        </h2>
      );
    } else if (winner === me?.id) {
      return (
        <>
          <div className={styles.winningText}>
            <h2 className={styles.pulse} key="victory">
              Victory
            </h2>
            <Lottie
              options={{
                loop: true,
                autoplay: true,
                animationData: pop,
                rendererSettings: {
                  preserveAspectRatio: "xMidYMid slice",
                },
              }}
              height={90}
              width={150}
            />
          </div>
          {playAgainButton}
        </>
      );
    } else if (winner === opponent?.id) {
      return (
        <>
          <h2 className={styles.pulse} key="defeat">
            Defeat ☹
          </h2>
          {playAgainButton}
        </>
      );
    } else if (activePlayer === me?.id) {
      return (
        <h2 className={styles.pulse} key="yourTurn">
          your turn
        </h2>
      );
    } else {
      return (
        <h2 className={styles.pulse} key="opponentsTurn">
          opponents turn
        </h2>
      );
    }
  };

  return (
    <div className={styles.row}>
      <div className={styles.statusBox}>
        <div className={styles.statusInfo}>{getStatusText()}</div>
        {/* @todo: find better placement for chat box */}
        {opponent && !opponent.isComputer && <Chat />}
      </div>
    </div>
  );
};
