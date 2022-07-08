import { Socket } from "socket.io-client";
import { Coordinate } from "../components/Game/Game";
import { PLAYER } from "../store/store";

export interface Turn {
  prevCoordinate?: Coordinate;
  newCoordinate: Coordinate;
  playerId: PLAYER;
}

class GameService {
  public async reactivate(socket: Socket) {
    socket.emit("reactivate");
  }

  public async onReactivate(socket: Socket, listener: () => void) {
    socket.on("on_reactivate", () => listener());
  }

  public async turnFinished(socket: Socket, turn: Turn) {
    socket.emit("turn_finished", turn);
  }

  public async onTurnFinished(socket: Socket, listener: (turn: Turn) => void) {
    socket.on("on_turn_finished", (turn) => listener(turn));
  }
}

export default new GameService();
