"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [roomCode, setRoomCode] = useState("");

  function createRoom() {
    if (!username.trim()) {
      alert("Enter username");
      return;
    }

    router.push(`/room/temp?username=${username}`);
  }

  function joinRoom() {
    if (!username.trim() || !roomCode.trim()) {
      alert("Enter username and room code");
      return;
    }

    router.push(`/room/${roomCode}?username=${username}`);
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 to-black flex items-center justify-center text-white">
      <div className="w-full max-w-md bg-slate-800 rounded-2xl shadow-xl p-8 space-y-6">
        <h1 className="text-3xl font-bold text-center">Group Chat</h1>

        {/* Username */}
        <div>
          <label className="block text-sm mb-1 text-gray-300">Username</label>
          <input
            className="w-full px-4 py-2 rounded-lg bg-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter your name"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>

        {/* Create */}
        <button
          onClick={createRoom}
          className="w-full py-2 rounded-lg bg-blue-600 hover:bg-blue-700 transition font-semibold"
        >
          Create Room
        </button>

        <div className="flex items-center gap-4 text-gray-400">
          <div className="flex-1 h-px bg-gray-600" />
          OR
          <div className="flex-1 h-px bg-gray-600" />
        </div>

        {/* Join */}
        <div>
          <label className="block text-sm mb-1 text-gray-300">Room Code</label>
          <input
            className="w-full px-4 py-2 rounded-lg bg-slate-700 focus:outline-none focus:ring-2 focus:ring-green-500 uppercase"
            placeholder="ABCD"
            value={roomCode}
            onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
          />
        </div>

        <button
          onClick={joinRoom}
          className="w-full py-2 rounded-lg bg-green-600 hover:bg-green-700 transition font-semibold"
        >
          Join Room
        </button>
      </div>
    </main>
  );
}
