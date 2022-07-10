#!/usr/bin/env node
import "reflect-metadata";
import app from "./app";
const debug = require("debug")("socketio-server:server");
import * as http from "http";
import socketServer from "./socket";

const normalizePort = (val: string) => {
  const port = parseInt(val, 10);

  if (isNaN(port)) {
    return val;
  }

  if (port >= 0) {
    return port;
  }

  return false;
}

const onError = (error) => {
  if (error.syscall !== "listen") {
    throw error;
  }

  const bind = typeof port === "string" ? "Pipe " + port : "Port " + port;

  // handle specific listen errors
  switch (error.code) {
    case "EACCES":
      console.error(bind + " requires elevated privileges");
      process.exit(1);
      break;
    case "EADDRINUSE":
      console.error(bind + " is already in use");
      process.exit(1);
      break;
    default:
      throw error;
  }
}

const onListening = () => {
  const addr = server.address();
  const bind = typeof addr === "string" ? "pipe " + addr : "port " + addr.port;
  debug("Listening on " + bind);

  console.log(`Server running at ${port}`);
}

const server = http.createServer(app);
const io = socketServer(server);
const port = normalizePort(process.env.PORT || "3000");
app.set("port", port);
server.listen(port);
server.on("error", onError);
server.on("listening", onListening);
