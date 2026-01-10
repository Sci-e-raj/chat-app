"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function Home() {
  const router = useRouter();
  const [joinRoomId, setJoinRoomId] = useState("");

  function createRoom() {
    const roomId = Math.random().toString(36).substring(2, 8);
    router.push(`/room/${roomId}`);
  }

  function joinRoom() {
    if (!joinRoomId) return alert("Enter a room ID");
    router.push(`/room/${joinRoomId}`);
  }

  return (
    <main className="flex min-h-screen items-center justify-center">
      <div className="flex flex-col gap-4">
        <h1 className="text-3xl font-bold text-center">Chat App</h1>

        <button
          onClick={createRoom}
          className="px-4 py-2 bg-black text-white rounded"
        >
          Create Room
        </button>

        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Enter room ID"
            value={joinRoomId}
            onChange={(e) => setJoinRoomId(e.target.value)}
            className="border px-2 py-1 rounded"
          />
          <button
            onClick={joinRoom}
            className="px-4 py-2 bg-blue-600 text-white rounded"
          >
            Join Room
          </button>
        </div>
      </div>
    </main>
  );
}
