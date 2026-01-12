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
    <main className="min-h-screen bg-linear-to-br from-slate-900 to-black text-white flex flex-col">
      {/* Header */}
      <header className="p-4 border-b border-slate-700">
        <h1 className="flex justify-center gap-1 text-xl font-semibold">
          Room <span className="text-blue-400">{roomId}</span>
        </h1>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {messages.map((m, i) => (
          <div key={i} className="bg-slate-800 px-4 py-2 rounded-lg max-w-xl">
            {m}
          </div>
        ))}
      </div>

      {/* Input */}
      <div className="p-4 border-t border-slate-700 flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 px-4 py-2 rounded-lg bg-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />

        <button
          onClick={sendMessage}
          className="px-6 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 transition font-semibold"
        >
          Send
        </button>
      </div>
    </main>
  );
}
