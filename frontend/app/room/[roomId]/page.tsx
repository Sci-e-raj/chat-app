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
  const [users, setUsers] = useState<string[]>([]);

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

    const requestUsers = () => {
      ws.send(JSON.stringify({ type: "get-users" }));
    };

    if (ws.readyState === WebSocket.OPEN) requestUsers();
    else ws.addEventListener("open", requestUsers);

    return () => ws.removeEventListener("open", requestUsers);
  }, []);

  useEffect(() => {
    const ws = getSocket();

    const handleMessage = (event: MessageEvent) => {
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

      if (data.type === "users") {
        setUsers(data.users);
      }

      if (data.type === "error") {
        alert(data.message);
      }
    };

    ws.addEventListener("message", handleMessage);

    return () => {
      ws.removeEventListener("message", handleMessage);
    };
  }, []);

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
      {/* Header */}
      <header className="p-4 border-b border-slate-700 flex justify-between">
        <h1 className="text-xl font-semibold">
          Room <span className="text-blue-400">{roomId}</span>
        </h1>
        <button
          onClick={copyRoomCode}
          className="px-3 py-1 rounded bg-slate-700 text-sm"
        >
          {copied ? "Copied!" : "Copy code"}
        </button>
      </header>

      {/* Body */}
      <div className="flex flex-1 overflow-hidden">
        {/* Users */}
        <aside className="w-48 border-r border-slate-700 p-3 text-sm hidden md:block">
          <div className="font-semibold mb-2">
            Users online ({users.length})
          </div>
          <ul className="space-y-1 text-gray-300">
            {users.map((u) => (
              <li key={u}>• {u}</li>
            ))}
          </ul>
        </aside>

        {/* Chat */}
        <div className="flex-1 flex flex-col">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((m, i) =>
              m.system ? (
                <div key={i} className="text-center text-gray-400 text-sm">
                  {m.message}
                </div>
              ) : (
                <div
                  key={i}
                  className={`flex ${m.self ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-xs px-4 py-2 rounded-xl text-sm ${
                      m.self
                        ? "bg-green-600 rounded-br-none"
                        : "bg-slate-800 rounded-bl-none"
                    }`}
                  >
                    {!m.self && (
                      <div className="text-xs text-gray-300 mb-1">{m.user}</div>
                    )}
                    {m.message}
                  </div>
                </div>
              )
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-slate-700 flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              placeholder="Type a message..."
              className="flex-1 px-4 py-2 rounded bg-slate-700"
            />
            <button
              onClick={sendMessage}
              className="px-6 py-2 rounded bg-blue-600"
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
