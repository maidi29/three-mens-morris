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
  playerName: string,
  score: number,
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
      let allPlayers = room['allPlayers'] || [];
      if (allPlayers.find((player)=>player.playerName === message.player.playerName)) {
        socket.emit("room_join_error", {
          error: "playerNameAlreadyTaken",
        });
      } else {
        let gameMaster = room['gameMaster'];
        let sessionname = room['sessionname'] || '';
        let mode = room['mode'] || '';
        message.player.socketId = socket.id;
        io.sockets.adapter.rooms.get(message.roomId)['allPlayers'] = [
          ...allPlayers.filter(
              (player) => player.playerName !== message.player.playerName
          ),
          message.player
        ];
        allPlayers = io.sockets.adapter.rooms.get(message.roomId)['allPlayers'];
        await socket.join(message.roomId);
        socket.emit("room_joined", {
          players: allPlayers,
          gameMaster: gameMaster,
          sessionname: sessionname,
          mode: mode
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
    io.sockets.adapter.rooms.get(roomId)['gameMaster'] = message;
    socket.emit("room_created", roomId);
  }
}
