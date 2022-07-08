import React from "react";
import { Toaster } from "react-hot-toast";
import { Player, Room } from "../../store/store";
import styles from "./Main.module.scss";
import { Game } from "../Game/Game";
import { Start } from "../Start/Start";
import { Collapsible } from "../Collapsible/Collapsible";

interface MainProps {
  room?: Room;
  me?: Player;
}
export const Main = ({ room, me }: MainProps): JSX.Element => (
  <div className={styles.main}>
    <h1>Three Men's Morris</h1>
    {room && me ? <Game /> : <Start />}
    <div className={styles.howToPlay}>
      <Collapsible header="How to play">
        <p>
          Three men's morris is an abstract strategy game played on a three by
          three board (counting lines) that is similar to tic-tac-toe.
          <br />
          The winner is the first player to align their three tokens on a line
          drawn on the board.
        </p>
        <p>The game consists of two phases:</p>
        <h3>1. Phase: Placing Tokens</h3>
        <p>
          The board is empty to begin the game, and players take turns placing
          their tokens on empty intersections. Each player has three tokens.
        </p>
        <h3>2. Phase: Moving Tokens</h3>
        <p>
          Once all pieces are placed (assuming there is no winner by then), play
          proceeds with each player moving one of their tokens per turn. A token
          may move to any adjacent linked empty position.
        </p>
      </Collapsible>
    </div>
    <Toaster
      toastOptions={{
        className: styles.toast,
        duration: 3000,
      }}
    />
  </div>
);
