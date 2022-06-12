import { Socket } from "socket.io-client";
import {Coordinate} from "../components/Game/Game";

interface Turn {
  prevCoordinate?: Coordinate,
  newCoordinate: Coordinate,
  playerId: 0 | 1
}

class GameService {


  public async gameEnd(socket: Socket, isEnd: boolean) {
    socket.emit("game_end", isEnd);
  }

  public async onGameEnd(socket: Socket, listener: (isEnd: boolean) => void) {
    socket.on("on_game_end", (isEnd) => listener(isEnd));
  }

  public async turnFinished(socket: Socket, turn: Turn) {
    socket.emit("turn_finished", turn);
  }

  public async onTurnFinished(socket: Socket, listener: (turn: Turn) => void) {
    socket.on("on_turn_finished", (turn) => listener(turn));
  }

}

export default new GameService();
