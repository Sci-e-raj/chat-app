"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { getSocket } from "@/lib/socket";
import { Send } from "lucide-react";

type ChatMessage = {
  user?: string;
  message: string;
  self?: boolean;
  system?: boolean;
  time?: string;
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
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const lastTypingRef = useRef(0);
  /* ---------- username ---------- */
  useEffect(() => {
    const urlUser = searchParams.get("username");
    const storedUser = localStorage.getItem("username");
    usernameRef.current = urlUser ?? storedUser;
    if (!usernameRef.current) alert("Username missing. Go back.");
  }, [searchParams]);

  /* ---------- auto scroll ---------- */
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages]);

  /* ---------- creator system msg ---------- */
  useEffect(() => {
    const role = localStorage.getItem("role");
    const username = localStorage.getItem("username");
    if (role === "creator" && username) {
      setMessages([
        {
          message: `${username} created the room`,
          system: true,
          time: getTime(),
        },
      ]);
    }
  }, []);

  /* ---------- request users ---------- */
  useEffect(() => {
    const ws = getSocket();
    const requestUsers = () => ws.send(JSON.stringify({ type: "get-users" }));
    ws.readyState === WebSocket.OPEN
      ? requestUsers()
      : ws.addEventListener("open", requestUsers);
    return () => ws.removeEventListener("open", requestUsers);
  }, []);

  /* ---------- socket messages ---------- */
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
            time: getTime(),
          },
        ]);
      }

      if (data.type === "system") {
        setMessages((prev) => [
          ...prev,
          { message: data.message, system: true, time: getTime() },
        ]);
      }

      if (data.type === "users") setUsers(data.users);
      if (data.type === "error") alert(data.message);

      if (data.type === "typing") {
        if (!data.active) {
          setTypingUsers((prev) => prev.filter((u) => u !== data.user));
          return;
        }

        // Add user to typingUsers if not already present
        setTypingUsers((prev) =>
          prev.includes(data.user) ? prev : [...prev, data.user],
        );

        // Remove after 2 seconds automatically
        setTimeout(() => {
          setTypingUsers((prev) => prev.filter((u) => u !== data.user));
        }, 2000);
      }
    };

    ws.addEventListener("message", handleMessage);
    return () => ws.removeEventListener("message", handleMessage);
  }, []);

  /* ---------- send ---------- */
  function sendMessage() {
    const ws = getSocket();
    if (ws.readyState !== WebSocket.OPEN || !input.trim()) return;
    ws.send(
      JSON.stringify({
        type: "typing",
        user: usernameRef.current,
        active: false,
      }),
    );
    ws.send(JSON.stringify({ type: "chat", message: input.trim() }));
    setInput("");
  }

  /* ---------- utils ---------- */
  function copyRoomCode() {
    if (!roomId) return;
    navigator.clipboard.writeText(roomId.toString());
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  function getTime() {
    return new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  return (
    <main className="relative h-screen overflow-hidden bg-linear-to-br from-slate-900 via-black to-slate-900 text-white flex flex-col">
      {/* background glow */}
      <div className="absolute -top-40 -left-40 h-96 w-96 bg-blue-500/20 blur-[120px]" />
      <div className="absolute bottom-0 right-0 h-96 w-96 bg-purple-500/20 blur-[140px]" />

      {/* Header */}
      <header className="relative z-10 p-4 border-b border-white/10 backdrop-blur bg-black/40 flex justify-between items-center">
        <div>
          <h1 className="text-lg font-semibold flex items-center gap-2">
            Room
            <span className="px-2 py-1 rounded-lg bg-blue-500/20 text-blue-400">
              {roomId}
            </span>
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          </h1>
        </div>

        <button
          onClick={copyRoomCode}
          className="px-3 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-sm transition"
        >
          {copied ? "Copied!" : "Copy code"}
        </button>
      </header>

      {/* Body */}
      <div className="relative z-10 flex flex-1 overflow-hidden">
        {/* Users */}
        <aside className="w-56 hidden md:block p-4 border-r border-white/10 backdrop-blur bg-white/5">
          <div className="font-semibold mb-3 text-sm">
            Users Online ({users.length})
          </div>
          <ul className="space-y-2 text-gray-300 text-sm">
            {users.map((u) => (
              <li key={u} className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full" />
                {u}
                {u === usernameRef.current && (
                  <span className="text-xs text-blue-400">(you)</span>
                )}
              </li>
            ))}
          </ul>
        </aside>

        {/* Chat */}
        <div className="flex-1 flex flex-col bg-white/5 backdrop-blur-xl">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 chat-scroll relative">
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-gray-500 text-sm">
                <div className="text-4xl mb-2">💬</div>
                Start the conversation
              </div>
            )}

            {messages.map((m, i) =>
              m.system ? (
                <div
                  key={i}
                  className="text-center text-gray-400 text-xs italic"
                >
                  <div
                    style={{
                      whiteSpace: "pre-wrap",
                      overflowWrap: "anywhere",
                      wordBreak: "break-word",
                    }}
                  >
                    {m.message}
                  </div>
                </div>
              ) : (
                <div
                  key={i}
                  className={`flex message-enter ${
                    m.self ? "justify-end" : "justify-start"
                  }`}
                >
                  <div className="flex items-end gap-2 max-w-[75%]">
                    {!m.self && (
                      <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-xs">
                        {m.user?.[0]?.toUpperCase()}
                      </div>
                    )}

                    <div
                      className={`px-4 py-2 rounded-2xl text-sm shadow-md ${
                        m.self
                          ? "bg-linear-to-br from-green-500 to-emerald-600 rounded-br-none"
                          : "bg-linear-to-br from-slate-700 to-slate-800 rounded-bl-none"
                      }`}
                    >
                      {!m.self && (
                        <div className="text-xs text-gray-300 mb-1">
                          {m.user}
                        </div>
                      )}
                      <div
                        style={{
                          whiteSpace: "pre-wrap",
                          overflowWrap: "anywhere",
                          wordBreak: "break-word",
                        }}
                      >
                        {m.message}
                      </div>

                      <div className="text-[10px] text-gray-300 mt-1 text-right">
                        {m.time}
                      </div>
                    </div>
                  </div>
                </div>
              ),
            )}

            {/* Typing indicator */}
            {typingUsers.length > 0 && (
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-xs">
                  {typingUsers[0]?.[0]?.toUpperCase()}
                </div>
                <div className="inline-flex items-center px-4 py-2 rounded-2xl bg-white/10 shadow animate-pulse">
                  <span className="dot-typing"></span>
                  <span className="dot-typing"></span>
                  <span className="dot-typing"></span>
                  <span className="ml-2 text-xs text-gray-300">
                    {typingUsers.length === 1
                      ? `${typingUsers[0]} is typing...`
                      : `${typingUsers.join(", ")} are typing...`}
                  </span>
                </div>
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-white/10 backdrop-blur bg-black/40">
            <div className="flex gap-2">
              <input
                value={input}
                onChange={(e) => {
                  setInput(e.target.value);

                  const username = usernameRef.current;
                  if (!username) return;

                  const now = Date.now();
                  if (now - lastTypingRef.current > 500) {
                    lastTypingRef.current = now;

                    const ws = getSocket();
                    if (ws.readyState === WebSocket.OPEN) {
                      ws.send(
                        JSON.stringify({
                          type: "typing",
                          user: username,
                          active: true,
                        }),
                      );
                    }
                  }
                }}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                placeholder="Type a message..."
                className="flex-1 px-5 py-3 rounded-full bg-white/10 text-white placeholder-gray-400
                 border border-white/10 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
              />

              <button
                onClick={sendMessage}
                disabled={!input.trim()}
                className="
                            flex items-center justify-center
                            w-12 h-12 rounded-full
                            bg-linear-to-br from-blue-600 to-indigo-600
                            hover:from-blue-500 hover:to-indigo-500
                            active:scale-90
                            transition-all
                            disabled:opacity-40
                          "
              >
                <Send className="w-5 h-5 rotate-45" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
