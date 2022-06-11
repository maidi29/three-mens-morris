import { Socket } from "socket.io-client";
import { Player } from "../store/store";

interface JoinInfo {
  roomId: string;
  player: Player;
}

interface RoomInfo {
  opponent: Player;
}

class GameService {
  public async joinGameRoom(
    socket: Socket,
    joinInfo: JoinInfo
  ): Promise<RoomInfo> {
    return new Promise((rs, rj) => {
      socket.emit("join_room", joinInfo);
      socket.on("room_joined", (roomInfo: RoomInfo) => rs(roomInfo));
      socket.on("room_join_error", ({ error }) => rj(error));
    });
  }

  public async createGameRoom(
    socket: Socket,
    gameMaster: Player
  ): Promise<string> {
    return new Promise((rs, rj) => {
      socket.emit("create_room", gameMaster);
      socket.on("room_created", (roomId) => rs(roomId));
    });
  }

  public async onPlayerJoined(
    socket: Socket,
    listener: (player: Player) => void
  ) {
    socket.on("player_joined", (player) => {
      listener(player);
    });
  }

  public async onPlayerLeft(
    socket: Socket,
    listener: (playerName: string) => void
  ) {
    socket.on("player_left", (playerName) => listener(playerName));
  }

  public async gameEnd(socket: Socket, isEnd: boolean) {
    socket.emit("game_end", isEnd);
  }

  public async onGameEnd(socket: Socket, listener: (isEnd: boolean) => void) {
    socket.on("on_game_end", (isEnd) => listener(isEnd));
  }

}

export default new GameService();
