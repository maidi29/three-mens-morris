import React, { useState } from "react";
import { PHASE, PLAYER, useStore } from "../../store/store";
import styles from "./Fields.module.scss";
import { Coordinate } from "../Game/Game";
import classnames from "classnames";
import {
  coordinateExistsInSet,
  getAdjacentFields,
} from "../../utils/boardLogic";
import socketService from "../../services/socketService";
import gameService from "../../services/gameService";

export const Fields = (): JSX.Element => {
  const phase = useStore((state) => state.phase);
  const opponent = useStore((state) => state.opponent);
  const winner = useStore((state) => state.winner);
  const me = useStore((state) => state.me);
  const activePlayer = useStore((state) => state.activePlayer);
  const adjacentFields = useStore((state) => state.adjacentFields);
  const winningFields = useStore((state) => state.winningFields);
  const matrix = useStore((state) => state.matrix);
  const playedStones = useStore((state) => state.playedStones);
  const setAdjacentFields = useStore((state) => state.setAdjacentFields);
  const [prevCoordinate, setPrevCoordinate] = useState<
    Coordinate | undefined
  >();

  const handleFieldClick = ({ x, y }: Coordinate): void => {
    if (activePlayer === me?.id && opponent) {
      if (phase === PHASE.MOVE && !prevCoordinate) {
        setAdjacentFields(getAdjacentFields({ x, y }));
        setPrevCoordinate({ x, y });
      } else {
        turnFinished({ x, y });
      }
    }
  };

  const turnFinished = (coord: Coordinate): void => {
    if (socketService.socket) {
      setPrevCoordinate(undefined);
      gameService.turnFinished(socketService.socket, {
        newCoordinate: coord,
        playerId: activePlayer || 0,
        ...(phase === PHASE.MOVE && { prevCoordinate }),
      });
    }
  };

  const isFieldEnabled = (value: PLAYER | null, coord: Coordinate): boolean => {
    if (activePlayer === me?.id && winner === null && opponent?.activated) {
      if (phase === PHASE.SET) {
        return value === null;
      } else if (phase === PHASE.MOVE) {
        if (prevCoordinate) {
          return coordinateExistsInSet(coord, adjacentFields) && value === null;
        } else {
          const emptyAdjacentFields = Array.from(
            getAdjacentFields(coord)
          ).filter(({ x, y }) => matrix[x][y] === null);
          return value === me?.id && emptyAdjacentFields.length > 0;
        }
      }
      return false;
    }
    return false;
  };

  return (
    <div className={styles.fields}>
      <>
        {playedStones.map(({ element, position }, index) => (
          <div
            key={index}
            className={classnames(styles.token, styles[`s${position}`])}
          >
            <div className={styles.tokenWrapper}>
              {element}
            </div>
          </div>
        ))}
        {matrix.map((row, x) => (
          <div className={styles.row} key={x}>
            {row.map((value, y) => (
              <button
                className={classnames(
                  styles.field,
                  coordinateExistsInSet({ x, y }, winningFields) &&
                    styles.winningField,
                  isFieldEnabled(value, { x, y }) && styles.activeField
                )}
                onClick={() => handleFieldClick({ x, y })}
                disabled={!isFieldEnabled(value, { x, y })}
                key={`${x}${y}`}
              />
            ))}
          </div>
        ))}
      </>
    </div>
  );
};
