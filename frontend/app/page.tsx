"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getSocket } from "@/lib/socket";

export default function HomePage() {
  const router = useRouter();

  const [createUsername, setCreateUsername] = useState("");
  const [joinUsername, setJoinUsername] = useState("");
  const [roomCode, setRoomCode] = useState("");

  function createRoom() {
    if (!createUsername.trim()) {
      alert("Enter username");
      return;
    }

    const ws = getSocket();

    ws.onopen = () => {
      ws.send(
        JSON.stringify({
          type: "create",
          username: createUsername,
        })
      );
    };

    // ws.onmessage = (event) => {
    //   const data = JSON.parse(event.data);

    //   if (data.type === "room-created") {
    //     localStorage.setItem("username", createUsername);
    //     localStorage.setItem("role", "creator");
    //     router.push(`/room/${data.roomCode}`);
    //   }

    //   if (data.type === "error") {
    //     alert(data.message);
    //   }
    // };
    const handleMessage = (event: MessageEvent) => {
      const data = JSON.parse(event.data);

      if (data.type === "room-created") {
        localStorage.setItem("username", createUsername);
        localStorage.setItem("role", "creator");
        router.push(`/room/${data.roomCode}`);
      }

      if (data.type === "joined") {
        localStorage.setItem("username", joinUsername);
        localStorage.setItem("role", "joiner");
        router.push(`/room/${roomCode}`);
      }

      if (data.type === "error") {
        alert(data.message);
      }
    };

    ws.addEventListener("message", handleMessage);
  }

  function joinRoom() {
    if (!joinUsername.trim() || !roomCode.trim()) {
      alert("Enter username and room code");
      return;
    }

    const ws = getSocket();

    ws.onopen = () => {
      ws.send(
        JSON.stringify({
          type: "join",
          roomCode,
          username: joinUsername,
        })
      );
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (data.type === "joined") {
        localStorage.setItem("username", joinUsername);
        localStorage.setItem("role", "joiner");
        router.push(`/room/${roomCode}`);
      }

      if (data.type === "error") {
        alert(data.message);
      }
    };
  }

  return (
    <main className="min-h-screen bg-linear-to-br from-slate-900 to-black flex items-center justify-center text-white">
      <div className="w-full max-w-md bg-slate-800 rounded-2xl shadow-xl p-8 space-y-8">
        <h1 className="text-3xl font-bold text-center">Group Chat</h1>

        <div className="space-y-3">
          <h2 className="text-lg font-semibold">Create Room</h2>

          <input
            className="w-full px-4 py-2 rounded-lg bg-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Username"
            value={createUsername}
            onChange={(e) => setCreateUsername(e.target.value)}
          />

          <button
            onClick={createRoom}
            className="w-full py-2 rounded-lg bg-blue-600 hover:bg-blue-700 transition font-semibold"
          >
            Create Room
          </button>
        </div>

        <div className="flex items-center gap-4 text-gray-400">
          <div className="flex-1 h-px bg-gray-600" />
          OR
          <div className="flex-1 h-px bg-gray-600" />
        </div>

        <div className="space-y-3">
          <h2 className="text-lg font-semibold">Join Room</h2>

          <input
            className="w-full px-4 py-2 rounded-lg bg-slate-700 focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="Username"
            value={joinUsername}
            onChange={(e) => setJoinUsername(e.target.value)}
          />

          <input
            className="w-full px-4 py-2 rounded-lg bg-slate-700 focus:outline-none focus:ring-2 focus:ring-green-500 uppercase"
            placeholder="Room code"
            value={roomCode}
            onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
          />

          <button
            onClick={joinRoom}
            className="w-full py-2 rounded-lg bg-green-600 hover:bg-green-700 transition font-semibold"
          >
            Join Room
          </button>
        </div>
      </div>
    </main>
  );
}
