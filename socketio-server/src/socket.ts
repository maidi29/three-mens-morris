import { Server } from "socket.io";


interface JoinInfo {
  roomId: string,
  player: Player
}

interface Player {
  symbol: string,
  img: string,
  socketId?: string
}

type Coordinate = {x: number, y: number};

interface Turn {
  prevCoordinate: Coordinate,
  newCoordinate: Coordinate,
  playerId: 0 | 1
}

export default (httpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: [
          "http://localhost:3000",
          "http://localhost:3006",
          "https://three-mens-morris.herokuapp.com",
          "https://www.three-mens-morris.com",
          "http://www.three-mens-morris.com",
          "https://three-mens-morris.com",
          "http://three-mens-morris.com",
      ],
    },
  });


  io.sockets.on("connection",  (socket) => {
    console.log("New Socket connected: ", socket.id);
    let room;
    socket.on('create_room', async (message: Player)=> {
      room = (Math.floor(Math.random()*900) + 100).toString();
      await socket.join(room);
      io.sockets.adapter.rooms.get(room)['master'] = message;
      socket.emit("room_created", room);
    });
    socket.on('join_room',  async (message: JoinInfo) => {
      room = message.roomId;
      const master = io.sockets.adapter.rooms.get(room)['master'];
      if(!room) {
        socket.emit("room_join_error", {
          error: "noRoomWithThisId",
        });
      } else {
        if (master?.symbol === message.player.symbol) {
          socket.emit("room_join_error", {
            error: "symbolAlreadyTaken",
          });
        } else {
          message.player.socketId = socket.id;
          await socket.join(message.roomId);
          socket.emit("room_joined", {
            opponent: master,
          });
          socket.broadcast.to(message.roomId).emit("opponent_joined", message.player);
        }
      }
    });
    socket.on("disconnecting",  () => {
      socket.broadcast.in(room).emit('opponent_left');
    });
    socket.on("turn_finished",  (turn: Turn) => {
      io.in(room).emit("on_turn_finished", turn);
    });
    socket.on("reactivate",  () => {
      socket.broadcast.in(room).emit('on_reactivate');
    });
  });

  return io;
};
