"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { getSocket } from "@/lib/socket";

type ChatMessage = {
  user?: string;
  message: string;
  self?: boolean;
  system?: boolean;
};

export default function RoomPage() {
  const { roomId } = useParams();
  const searchParams = useSearchParams();

  const usernameRef = useRef<string | null>(null);
  const [copied, setCopied] = useState(false);

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const urlUser = searchParams.get("username");
    const storedUser = localStorage.getItem("username");

    usernameRef.current = urlUser ?? storedUser;

    if (!usernameRef.current) {
      alert("Username missing. Go back.");
    }
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    const role = localStorage.getItem("role");
    const username = localStorage.getItem("username");

    if (role === "creator") {
      setMessages([
        {
          message: `${username} created the room`,
          system: true,
        },
      ]);
    }
  }, []);

  useEffect(() => {
    const ws = getSocket();

    const joinRoom = () => {
      if (!usernameRef.current) return;
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
            self: data.user === usernameRef.current,
          },
        ]);
      }

      if (data.type === "system") {
        setMessages((prev) => [
          ...prev,
          { message: data.message, system: true },
        ]);
      }

      if (data.type === "error") {
        alert(data.message);
      }
    };

    return () => {
      ws.onmessage = null;
      ws.onopen = null;
    };
  }, [roomId]);

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

  function copyRoomCode() {
    if (!roomId) return;

    navigator.clipboard.writeText(roomId.toString());

    setCopied(true);

    setTimeout(() => {
      setCopied(false);
    }, 1500);
  }

  return (
    <main className="h-screen bg-linear-to-br from-slate-900 to-black text-white flex flex-col">
      <header className="p-4 border-b border-slate-700 shrink-0 flex items-center justify-between">
        <h1 className="text-xl font-semibold">
          Room <span className="text-blue-400">{roomId}</span>
        </h1>

        <button
          onClick={copyRoomCode}
          className="px-3 py-1 rounded-md bg-slate-700 hover:bg-slate-600 text-sm transition"
        >
          {copied ? "Copied!" : "Copy code"}
        </button>
      </header>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((m, i) => {
          if (m.system) {
            return (
              <div key={i} className="text-center text-sm text-gray-400">
                {m.message}
              </div>
            );
          }

          return (
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
          );
        })}

        <div ref={bottomRef} />
      </div>

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
