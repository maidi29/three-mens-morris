import React, { useState } from "react";
import { PHASE, PLAYER, useStore } from "../../../store/store";
import styles from "./Fields.module.scss";
import { Coordinate } from "../Game/Game";
import classnames from "classnames";
import {
  coordinateExistsInSet,
  getAdjacentFields,
} from "../../../utils/gameLogic";
import socketService from "../../../services/socketService";
import gameService from "../../../services/gameService";
import toast from "react-hot-toast";
import { PlayedTokens } from "../PlayedTokens/PlayedTokens";

export const Fields = (): JSX.Element => {
  const phase = useStore((state) => state.phase);
  const opponent = useStore((state) => state.opponent);
  const winner = useStore((state) => state.winner);
  const me = useStore((state) => state.me);
  const activePlayer = useStore((state) => state.activePlayer);
  const adjacentFields = useStore((state) => state.adjacentFields);
  const winningFields = useStore((state) => state.winningFields);
  const matrix = useStore((state) => state.matrix);
  const setAdjacentFields = useStore((state) => state.setAdjacentFields);
  const [prevCoordinate, setPrevCoordinate] = useState<
    Coordinate | undefined
  >();

  const handleFieldClick = ({ x, y }: Coordinate): void => {
    if (activePlayer === me?.id && opponent) {
      if (
        phase === PHASE.MOVE &&
        (!prevCoordinate || (prevCoordinate && matrix[x][y] !== null))
      ) {
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
      void gameService.turnFinished(socketService.socket, {
        newCoordinate: coord,
        playerId: activePlayer || 0,
        ...(phase === PHASE.MOVE && { prevCoordinate }),
      });
    } else {
      toast("Connection Error! Please reload to start a new game.", {
        icon: "❗",
        duration: 3000,
      });
    }
  };

  const isFieldEnabled = (value: PLAYER | null, coord: Coordinate): boolean => {
    if (activePlayer === me?.id && winner === null && opponent?.activated) {
      if (phase === PHASE.SET) {
        return value === null;
      } else if (phase === PHASE.MOVE) {
        const emptyAdjacentFields = Array.from(getAdjacentFields(coord)).filter(
          ({ x, y }) => matrix[x][y] === null
        );
        return (
          (coordinateExistsInSet(coord, adjacentFields) && value === null) ||
          (value === me?.id && emptyAdjacentFields.length > 0)
        );
      }
      return false;
    }
    return false;
  };

  const isFieldActive = (value: PLAYER | null, coord: Coordinate): boolean => {
    if (isFieldEnabled(value, coord)) {
      if (phase === PHASE.MOVE) {
        if (prevCoordinate) {
          return coordinateExistsInSet(coord, adjacentFields) && value === null;
        } else {
          const emptyAdjacentFields = Array.from(
            getAdjacentFields(coord)
          ).filter(({ x, y }) => matrix[x][y] === null);
          return value === me?.id && emptyAdjacentFields.length > 0;
        }
      } else {
        return isFieldEnabled(value, coord);
      }
    } else {
      return false;
    }
  };

  return (
    <div className={styles.fields}>
      <>
        <div className={styles.playedTokens}>
          <div className={styles.tokensWrapper}>
            <PlayedTokens />
          </div>
        </div>
        {matrix.map((row, x) => (
          <div className={styles.row} key={x}>
            {row.map((value, y) => (
              <button
                className={classnames(
                  styles.field,
                  coordinateExistsInSet({ x, y }, winningFields) &&
                    styles.winningField,
                  isFieldActive(value, { x, y }) && styles.activeField,
                  prevCoordinate?.x === x &&
                    prevCoordinate.y === y &&
                    styles.selectedField
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
