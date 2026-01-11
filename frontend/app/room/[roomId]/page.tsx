"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { getSocket } from "@/lib/socket";

export default function RoomPage() {
  const { roomId } = useParams();
  const searchParams = useSearchParams();
  const username = searchParams.get("username");

  const [messages, setMessages] = useState<string[]>([]);
  const [input, setInput] = useState("");

  useEffect(() => {
    const ws = getSocket();

    ws.onopen = () => {
      if (username) {
        ws.send(
          JSON.stringify({
            type: "join",
            roomCode: roomId,
            username,
          })
        );
      }
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (data.type === "chat") {
        setMessages((prev) => [...prev, `${data.user}: ${data.message}`]);
      }

      if (data.type === "error") {
        alert(data.message);
      }
    };

    return () => {};
  }, [roomId, username]);

  function sendMessage() {
    const ws = getSocket();

    if (ws.readyState !== WebSocket.OPEN) return;

    ws.send(
      JSON.stringify({
        type: "chat",
        message: input,
      })
    );
    setInput("");
  }

  return (
    <div>
      <h1>Room {roomId}</h1>

      {messages.map((m, i) => (
        <div key={i}>{m}</div>
      ))}

      <input value={input} onChange={(e) => setInput(e.target.value)} />
      <button onClick={sendMessage}>Send</button>
    </div>
  );
}
