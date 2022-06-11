import {
  ConnectedSocket,
  MessageBody,
  OnMessage,
  SocketController,
  SocketIO,
} from "socket-controllers";
import { Server, Socket } from "socket.io";

interface JoinInfo {
  roomId: string,
  player: Player
}

interface Player {
  symbol: string,
  img: string,
  socketId?: string
}

@SocketController()
export class RoomController {
  @OnMessage("join_room")
  public async joinGame(
    @SocketIO() io: Server,
    @ConnectedSocket() socket: Socket,
    @MessageBody() message: JoinInfo
  ) {
    const room = io.sockets.adapter.rooms.get(message.roomId);
    if(!room) {
      socket.emit("room_join_error", {
        error: "noRoomWithThisId",
      });
    } else {
      let otherPlayer = room['otherPlayer'] || [];
      if (otherPlayer.symbol === message.player.symbol) {
        socket.emit("room_join_error", {
          error: "symbolAlreadyTaken",
        });
      } else {
        message.player.socketId = socket.id;
        await socket.join(message.roomId);
        socket.emit("room_joined", {
          otherPlayer,
        });
        socket.broadcast.to(message.roomId).emit("player_joined", message.player);
      }
    }
  }

  @OnMessage("create_room")
  public async createRoom(
      @SocketIO() io: Server,
      @ConnectedSocket() socket: Socket,
      @MessageBody() message: Player
  ) {
    const roomId = (Math.floor(Math.random()*90000) + 10000).toString();
    await socket.join(roomId);
    socket.emit("room_created", roomId);
  }
}
