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
  console.log("new user connected");

  socket.roomCode = null;
  socket.username = null;

  socket.on("message", (data) => {
    let message;
    try {
      message = JSON.parse(data.toString());
    } catch {
      return;
    }

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

      console.log(`${socket.username} created room ${roomCode}`);
      return;
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
        return;
      }

      if (socket.roomCode === roomCode) {
        return;
      }

      rooms[roomCode].add(socket);
      socket.username = username;
      socket.roomCode = roomCode;

      socket.send(
        JSON.stringify({
          type: "joined",
          roomCode,
        })
      );

      rooms[roomCode].forEach((client) => {
        if (client !== socket) {
          client.send(
            JSON.stringify({
              type: "system",
              message: `${username} joined the room`,
            })
          );
        }
      });

      console.log(`${socket.username} joined room ${roomCode}`);
      return;
    }

    if (message.type === "chat") {
      const roomCode = socket.roomCode;

      if (!roomCode || !rooms[roomCode]) return;

      rooms[roomCode].forEach((client) => {
        if (client.readyState === 1) {
          client.send(
            JSON.stringify({
              type: "chat",
              user: socket.username,
              message: message.message,
            })
          );
        }
      });
    }
  });

  socket.on("close", () => {
    const roomCode = socket.roomCode;

    if (!roomCode || !rooms[roomCode]) return;

    rooms[roomCode].delete(socket);

    rooms[roomCode].forEach((client) => {
      client.send(
        JSON.stringify({
          type: "system",
          message: `${socket.username} left the room`,
        })
      );
    });

    if (rooms[roomCode].size === 0) {
      delete rooms[roomCode];
      console.log(`Room ${roomCode} deleted`);
    }

    console.log(`${socket.username} disconnected`);
  });
});
