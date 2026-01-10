"use client";

import { useParams } from "next/navigation";

export default function RoomPage() {
  const params = useParams(); // hook for client-side access
  const roomId = params.roomId;

  return (
    <main className="flex min-h-screen items-center justify-center">
      <div>
        <h1 className="text-2xl font-bold">Room ID: {roomId}</h1>
        <p className="mt-2 text-gray-600">Chat will appear here</p>
      </div>
    </main>
  );
}
