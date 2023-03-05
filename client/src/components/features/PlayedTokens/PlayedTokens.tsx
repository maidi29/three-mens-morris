import React from "react";
import styles from "./PlayedTokens.module.scss";
import classnames from "classnames";
import { useStore } from "../../../store/store";

export const PlayedTokens = (): JSX.Element => {
  const playedTokens = useStore((state) => state.playedTokens);
  return (
    <>
      {playedTokens.map(({ element, position }, index) => (
        <div
          key={index}
          className={classnames(styles.token, styles[`s${position}`])}
        >
          <div className={styles.tokenWrapper}>{element}</div>
        </div>
      ))}
    </>
  );
};
