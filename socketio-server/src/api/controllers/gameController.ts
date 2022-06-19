import {
  ConnectedSocket,
  MessageBody,
  OnMessage,
  SocketController,
  SocketIO,
} from "socket-controllers";
import { Server, Socket } from "socket.io";

type Coordinate = {x: number, y: number};

interface Turn {
  prevCoordinate: Coordinate,
  newCoordinate: Coordinate,
  playerId: 0 | 1
}

@SocketController()
export class GameController {
  private getSocketGameRoomId(socket: Socket): string {
    const socketRooms = Array.from(socket.rooms.values()).filter(
      (r) => r !== socket.id
    );
    return socketRooms && socketRooms[0];
  }

  @OnMessage("turn_finished")
  public async turnFinished(
      @SocketIO() io: Server,
      @ConnectedSocket() socket: Socket,
      @MessageBody() turn: Turn
  ) {
    const gameRoom = this.getSocketGameRoomId(socket);
    io.in(gameRoom).emit("on_turn_finished", turn);
  }

  @OnMessage("reactivate")
  public async reactivate(
    @SocketIO() io: Server,
    @ConnectedSocket() socket: Socket
  ) {
    const gameRoom = this.getSocketGameRoomId(socket);
    socket.broadcast.to(gameRoom).emit("on_reactivate");
  }
}
