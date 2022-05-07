import {
  ConnectedSocket,
  MessageBody,
  OnMessage,
  SocketController,
  SocketIO,
} from "socket-controllers";
import { Server, Socket } from "socket.io";

export interface Question {
  question: string,
  pointsCorrect: number,
  pointsIncorrect: number,
  pointsOthers: number,
  id: number
}

export interface Answer {
  player: string,
  answer: string,
  questionId: number,
}

@SocketController()
export class GameController {
  private getSocketGameRoomId(socket: Socket): string {
    const socketRooms = Array.from(socket.rooms.values()).filter(
      (r) => r !== socket.id
    );
    return socketRooms && socketRooms[0];
  }

  @OnMessage("new_round")
  public async newRound(
    @SocketIO() io: Server,
    @ConnectedSocket() socket: Socket,
    @MessageBody() message: Question
  ) {
    const gameRoom = this.getSocketGameRoomId(socket);
    io.sockets.adapter.rooms.get(gameRoom)['rank'] = 0;
    io.in(gameRoom).emit("on_new_round", {question: message.question});
  }

  @OnMessage("send_answer")
  public async sendAnswer(
      @SocketIO() io: Server,
      @ConnectedSocket() socket: Socket,
      @MessageBody() message: Answer
  ) {
    const gameRoom = this.getSocketGameRoomId(socket);
    io.in(gameRoom).emit("on_sent_answer", message);
  }

  @OnMessage("buzz")
  public async buzz(
      @SocketIO() io: Server,
      @ConnectedSocket() socket: Socket,
      @MessageBody() message: {playerName: string, questionId: string}
  ) {
    const gameRoom = this.getSocketGameRoomId(socket);
    const rank = io.sockets.adapter.rooms.get(gameRoom)['rank'] || 0;
    const buzzData = {...message, rank: rank}
    io.in(gameRoom).emit("on_buzz", buzzData);
    io.sockets.adapter.rooms.get(gameRoom)['rank'] = rank + 1;
  }

  @OnMessage("mark_answer")
  public async markAnswer(
      @SocketIO() io: Server,
      @ConnectedSocket() socket: Socket,
      @MessageBody() message: { answer, round }
  ) {
    const gameRoom = this.getSocketGameRoomId(socket);
    io.in(gameRoom).emit("on_mark_answer", message);
  }

  @OnMessage("set_sessionname")
  public async setSessionname(
      @SocketIO() io: Server,
      @ConnectedSocket() socket: Socket,
      @MessageBody() sessionname: string
  ) {
    const gameRoom = this.getSocketGameRoomId(socket);
    io.sockets.adapter.rooms.get(gameRoom)['sessionname'] = sessionname;
    io.in(gameRoom).emit("on_set_sessionname", sessionname);
  }

  @OnMessage("buzzer_state")
  public async buzzerState(
      @SocketIO() io: Server,
      @ConnectedSocket() socket: Socket,
      @MessageBody() active: boolean
  ) {
    const gameRoom = this.getSocketGameRoomId(socket);
    io.in(gameRoom).emit("on_buzzer_state", active);
  }

  @OnMessage("reset_textfields")
  public async resetTextfields(
      @SocketIO() io: Server,
      @ConnectedSocket() socket: Socket,
  ) {
    const gameRoom = this.getSocketGameRoomId(socket);
    io.in(gameRoom).emit("on_reset_textfields");
  }

  @OnMessage("reset_buzzed")
  public async resetBuzzed(
      @SocketIO() io: Server,
      @ConnectedSocket() socket: Socket,
  ) {
    const gameRoom = this.getSocketGameRoomId(socket);
    io.in(gameRoom).emit("on_reset_buzzed");
  }

  @OnMessage("block_textfields")
  public async blockTextfields(
      @SocketIO() io: Server,
      @ConnectedSocket() socket: Socket,
      @MessageBody() active: boolean
  ) {
    const gameRoom = this.getSocketGameRoomId(socket);
    io.in(gameRoom).emit("on_block_textfields", active);
  }

  @OnMessage("only_first_buzzer")
  public async onlyFirst(
      @SocketIO() io: Server,
      @ConnectedSocket() socket: Socket,
      @MessageBody() active: boolean
  ) {
    const gameRoom = this.getSocketGameRoomId(socket);
    io.in(gameRoom).emit("on_only_first_buzzer", active);
  }

  @OnMessage("answer_visibility")
  public async answerVisibility(
      @SocketIO() io: Server,
      @ConnectedSocket() socket: Socket,
      @MessageBody() visible: boolean
  ) {
    const gameRoom = this.getSocketGameRoomId(socket);
    io.in(gameRoom).emit("on_answer_visibility", visible);
  }

  @OnMessage("change_mode")
  public async changeMode(
      @SocketIO() io: Server,
      @ConnectedSocket() socket: Socket,
      @MessageBody() mode: string
  ) {
    const gameRoom = this.getSocketGameRoomId(socket);
    io.sockets.adapter.rooms.get(gameRoom)['mode'] = mode;
    io.in(gameRoom).emit("on_change_mode", mode);
  }

  @OnMessage("stop_disolving")
  public async stopDisolving(
      @SocketIO() io: Server,
      @ConnectedSocket() socket: Socket,
      @MessageBody() active: boolean
  ) {
    const gameRoom = this.getSocketGameRoomId(socket);
    io.in(gameRoom).emit("on_stop_disolving", active);
  }

  @OnMessage("game_end")
  public async gameWin(
    @SocketIO() io: Server,
    @ConnectedSocket() socket: Socket,
    @MessageBody() isEnd: boolean
  ) {
    const gameRoom = this.getSocketGameRoomId(socket);
    io.in(gameRoom).emit("on_game_end", isEnd);
  }
}
