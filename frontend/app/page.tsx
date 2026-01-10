"use client";

import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  function createRoom() {
    const roomId = Math.random().toString(36).substring(2, 8);
    router.push(`/room/${roomId}`);
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

        <button className="px-4 py-2 border rounded">Join Room</button>
      </div>
    </main>
  );
}
