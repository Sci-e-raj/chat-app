const express = require("express");
const { WebSocketServer } = require("ws");

const app = express();
const server = app.listen(3001, () => {
  console.log("server running on port 3001");
});

const wss = new WebSocketServer({ server });

const rooms = {};

function generateRoomCode() {
  return Math.random().toString(36).substring(2, 6).toUpperCase();
}

wss.on("connection", (socket) => {
  console.log("new user created");

  socket.roomCode = null;
  socket.username = null;

  socket.on("message", (data) => {
    const message = JSON.parse(data.toString());

    if (message.type === "create") {
      const roomCode = generateRoomCode();

      rooms[roomCode] = new Set();
      rooms[roomCode].add(socket);

      socket.roomCode = roomCode;
      socket.username = message.username;

      socket.send(
        JSON.stringify({
          type: "room-created",
          roomCode,
        })
      );

      console.log(`${message.username} created room ${roomCode}`);
    }

    if (message.type === "join") {
      const { roomCode, username } = message;

      if (!rooms[roomCode]) {
        socket.send(
          JSON.stringify({
            type: "error",
            message: "Room doesn't exist",
          })
        );
      }

      rooms[roomCode].add(socket);
      socket.username = message.username;
      socket.roomCode = roomCode;

      socket.send(
        JSON.stringify({
          type: "joined",
          roomCode,
        })
      );

      console.log(`${message.username} joined the room ${roomCode}`);
    }

    if (message.type === "chat") {
      const roomCode = socket.roomCode;

      if (!rooms[roomCode]) return;

      rooms[roomCode].forEach((client) => {
        client.send(
          JSON.stringify({
            type: "chat",
            user: "socket.username",
            message: "message.message",
          })
        );
      });
    }
  });

  socket.on("close", () => {
    const roomCode = socket.roomCode;

    if (roomCode && rooms[roomCode]) {
      rooms[roomCode].delete(socket);

      if (rooms[roomCode].size === 0) {
        delete rooms[roomCode];
      }

      console.log(`${socket.username} disconnected`);
    }
  });
});
