import React from "react";
import styles from "./PlayerInfoBox.module.scss";
import { Box } from "./Box/Box";
import { useStore } from "../../../store/store";

export const PlayerInfoBox = (): JSX.Element => {
  const opponent = useStore((state) => state.opponent);
  const me = useStore((state) => state.me);

  return (
    <div className={styles.playerInfo}>
      {me && <Box player={me} name="Me" />}
      {opponent && <Box player={opponent} name="Opponent" />}
    </div>
  );
};
