import { useSocketServer } from "socket-controllers";
import { Server } from "socket.io";

export default (httpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: ["http://localhost:3000", "http://localhost:3006", "https://morris.herokuapp.com"],
    },
    maxHttpBufferSize: 4e6 // 4Mb
  });


  io.sockets.on("connection", (socket) => {
    let currentRoomId;
    let playerName;
    socket.on('join_room', function({roomId, player}) {
      currentRoomId = roomId;
      playerName = player.playerName;
    });
    socket.on("disconnecting", (reason) => {
      const allPlayers = io.sockets.adapter.rooms.get(currentRoomId)?.['allPlayers'];
      if(allPlayers) io.sockets.adapter.rooms.get(currentRoomId)['allPlayers'] = allPlayers.filter(obj => obj.playerName !== playerName);
      socket.broadcast.in(currentRoomId).emit('player_left', playerName);
    });
  });

  useSocketServer(io, { controllers: [__dirname + "/api/controllers/*.ts"] });

  return io;
};
