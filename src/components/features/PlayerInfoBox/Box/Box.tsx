import React from "react";
import styles from "./Box.module.scss";
import { Player, useStore } from "../../../../store/store";
import { Token } from "../../../elements/Token/Token";

interface BoxProps {
  player: Player;
  name: string;
}

export const Box = ({ player, name }: BoxProps): JSX.Element => {
  const nonPlayedTokens = useStore((state) => state.nonPlayedTokens);
  return (
    <div className={styles.playerBox}>
      <div className={styles.head}>
        <h3>
          {player.symbol} {name}
        </h3>
        <div className={styles.score}>{player.score}</div>
      </div>
      <div className={styles.nonPlayedTokens}>
        {nonPlayedTokens[player.id].map((token, index) => (
          <Token
            color={player?.color}
            emoji={player?.symbol}
            size={4}
            key={index}
          />
        ))}
      </div>
    </div>
  );
};
