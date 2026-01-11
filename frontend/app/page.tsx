"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { getSocket } from "@/lib/socket";

export default function Home() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [roomCode, setRoomCode] = useState("");

  function createRoom() {
    const ws = getSocket();

    ws.onopen = () => {
      ws.send(
        JSON.stringify({
          type: "create",
          username,
        })
      );
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (data.type === "room-created") {
        router.push(`/room/${data.roomCode}`);
      }

      if (data.type === "error") {
        alert(data.message);
      }
    };
  }

  function joinRoom() {
    router.push(`/room/${roomCode}?username=${username}`);
  }

  return (
    <main>
      <input value={username} onChange={(e) => setUsername(e.target.value)} />
      <button onClick={createRoom}>Create Room</button>

      <input value={roomCode} onChange={(e) => setRoomCode(e.target.value)} />
      <button onClick={joinRoom}>Join Room</button>
    </main>
  );
}
