"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { getSocket } from "@/lib/socket";

type ChatMessage = {
  user: string;
  message: string;
  self: boolean;
};

export default function RoomPage() {
  const { roomId } = useParams();
  const searchParams = useSearchParams();
  const username = searchParams.get("username");

  const [currentUser, setCurrentUser] = useState<string | null>(username);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");

  useEffect(() => {
    if (!currentUser) {
      setCurrentUser(localStorage.getItem("username"));
    }
  }, []);

  useEffect(() => {
    const ws = getSocket();

    const joinRoom = () => {
      if (username) {
        ws.send(
          JSON.stringify({
            type: "join",
            roomCode: roomId,
            username,
          })
        );
        setCurrentUser(username);
      }
    };

    if (ws.readyState === WebSocket.OPEN) {
      joinRoom();
    } else {
      ws.onopen = joinRoom;
    }

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (data.type === "chat") {
        setMessages((prev) => [
          ...prev,
          {
            user: data.user,
            message: data.message,
            self: data.user === currentUser,
          },
        ]);
      }

      if (data.type === "error") {
        alert(data.message);
      }
    };
  }, [roomId, username, currentUser]);

  function sendMessage() {
    const ws = getSocket();
    if (ws.readyState !== WebSocket.OPEN || !input.trim()) return;

    ws.send(
      JSON.stringify({
        type: "chat",
        message: input,
      })
    );
    setInput("");
  }

  return (
    <main className="h-screen bg-linear-to-br from-slate-900 to-black text-white flex flex-col">
      {/* Header */}
      <header className="p-4 border-b border-slate-700 shrink-0">
        <h1 className="flex justify-center gap-1 text-xl font-semibold">
          Room <span className="text-blue-400">{roomId}</span>
        </h1>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((m, i) => (
          <div
            key={i}
            className={`flex ${m.self ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-xs px-4 py-2 rounded-xl text-sm
                ${
                  m.self
                    ? "bg-green-600 text-white rounded-br-none"
                    : "bg-slate-800 text-white rounded-bl-none"
                }`}
            >
              {!m.self && (
                <div className="text-xs text-gray-300 mb-1">{m.user}</div>
              )}
              {m.message}
            </div>
          </div>
        ))}
      </div>

      {/* Input */}
      <div className="p-4 border-t border-slate-700 shrink-0 flex gap-2 bg-slate-900">
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
