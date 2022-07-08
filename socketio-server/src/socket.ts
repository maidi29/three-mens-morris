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
    let roomId;
    socket.on('create_room', async (player: Player)=> {
      roomId = (Math.floor(Math.random()*900) + 100).toString();
      await socket.join(roomId);
      io.sockets.adapter.rooms.get(roomId)['master'] = player;
      socket.emit("room_created", roomId);
    });
    socket.on('join_room',  async (message: JoinInfo) => {
      roomId = message.roomId;
      const master = io.sockets.adapter.rooms.get(roomId)?.['master'];
      if(!roomId) {
        socket.emit("room_join_error", {
          error: "Please provide a Game ID.",
        });
      } else {
        const connectedSockets = io.sockets.adapter.rooms.get(roomId);
        const socketRooms = Array.from(socket.rooms.values()).filter(
            (r) => r !== socket.id
        );
        if (!io.sockets.adapter.rooms.get(roomId)){
          socket.emit("room_join_error", {
            error: "No room was found with this ID.",
          });
        } else if (socketRooms.length > 0 || (connectedSockets && connectedSockets.size === 2)) {
            socket.emit("room_join_error", {
              error: "Room is full, please choose another room to play.",
            });
          } else if (!connectedSockets?.has(master.socketId)) {
            socket.emit("room_join_error", {
              error: "Room was closed, please host or join another room.",
            });
          } else if (master?.symbol === message.player.symbol) {
            socket.emit("room_join_error", {
              error: `Symbol ${message.player.symbol} already taken by opponent. Please choose another symbol.`,
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
      socket.broadcast.in(roomId).emit('opponent_left');
    });
    socket.on("turn_finished",  (turn: Turn) => {
      io.in(roomId).emit("on_turn_finished", turn);
    });
    socket.on("reactivate",  () => {
      socket.broadcast.in(roomId).emit('on_reactivate');
    });
  });

  return io;
};
