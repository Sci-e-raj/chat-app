"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createRoom, joinRoom } from "@/lib/useRoomActions";

// export const metadata = {
//   title: "Group Chat – Realtime Rooms",
//   description: "Create or join realtime chat rooms instantly",
// };

export default function HomePage() {
  const router = useRouter();

  const [createUsername, setCreateUsername] = useState("");
  const [joinUsername, setJoinUsername] = useState("");
  const [roomCode, setRoomCode] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCreate() {
    if (!createUsername.trim()) {
      setError("Username is required");
      return;
    }

    try {
      setError(null);
      setLoading(true);

      const code = await createRoom(createUsername);

      localStorage.setItem("username", createUsername);
      localStorage.setItem("role", "creator");

      router.push(`/room/${code}`);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Something went wrong");
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleJoin() {
    if (!joinUsername.trim() || !roomCode.trim()) {
      setError("Username and room code are required");
      return;
    }

    if (!/^[A-Z0-9]{4}$/.test(roomCode)) {
      setError("Room code must be 4 letters or numbers");
      return;
    }

    try {
      setError(null);
      setLoading(true);

      await joinRoom(joinUsername, roomCode);

      localStorage.setItem("username", joinUsername);
      localStorage.setItem("role", "joiner");

      router.push(`/room/${roomCode}`);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Something went wrong");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-black">
      {/* background effects */}
      <div className="absolute inset-0 bg-linear-to-br from-slate-900 via-black to-slate-900" />
      <div className="absolute -top-40 -left-40 h-96 w-96 rounded-full bg-blue-500/20 blur-3xl" />
      <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-purple-500/20 blur-3xl" />

      {/* content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center px-4">
        {/* glow layer */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="h-96 w-96 rounded-full bg-blue-500/20 blur-[120px]" />
          <div className="absolute h-80 w-80 rounded-full bg-purple-500/20 blur-[120px] -translate-x-24 translate-y-24" />
        </div>

        {/* glass card */}
        <div
          className="
            relative w-full max-w-md rounded-3xl p-8 space-y-6
            bg-white/5 backdrop-blur-2xl
            border border-white/10
            shadow-[0_20px_60px_rgba(0,0,0,0.6)]
          "
        >
          <h1 className="text-3xl font-bold text-center text-white tracking-tight">
            Group Chat
          </h1>

          {error && (
            <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
              {error}
            </div>
          )}

          {/* Create Room */}
          <div className="space-y-3">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-400">
              Create a room
            </h2>

            <input
              value={createUsername}
              onChange={(e) => setCreateUsername(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCreate()}
              disabled={loading}
              placeholder="Your name"
              className="w-full px-4 py-3 rounded-lg bg-slate-800 text-white placeholder-gray-400
                       border border-slate-700
                       focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30
                       transition outline-none"
            />

            <button
              onClick={handleCreate}
              disabled={loading}
              className="w-full py-3 rounded-lg font-semibold
                       bg-linear-to-r from-blue-600 to-indigo-600
                       hover:from-blue-500 hover:to-indigo-500
                       active:scale-[0.98]
                       transition-all disabled:opacity-50"
            >
              {loading ? "Creating..." : "Create room"}
            </button>
          </div>

          <div className="flex items-center gap-3 text-gray-500 text-xs">
            <div className="flex-1 h-px bg-gray-700" />
            OR
            <div className="flex-1 h-px bg-gray-700" />
          </div>

          {/* Join Room */}
          <div className="space-y-3">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-400">
              Join a room
            </h2>

            <input
              value={joinUsername}
              onChange={(e) => setJoinUsername(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleJoin()}
              disabled={loading}
              placeholder="Your name"
              className="w-full px-4 py-3 rounded-lg bg-slate-800 text-white placeholder-gray-400
                       border border-slate-700
                       focus:border-green-500 focus:ring-2 focus:ring-green-500/30
                       transition outline-none"
            />

            {/* uniform input button with the UI */}
            <input
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
              onKeyDown={(e) => e.key === "Enter" && handleJoin()}
              disabled={loading}
              placeholder="Room code"
              className="w-full px-4 py-3 rounded-lg bg-slate-800 text-white
             tracking-widest placeholder:tracking-normal
             placeholder-gray-400
             border border-slate-700
             focus:border-green-500 focus:ring-2 focus:ring-green-500/30
             transition outline-none"
            />
            {/* <input
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
              onKeyDown={(e) => e.key === "Enter" && handleJoin()}
              disabled={loading}
              placeholder="Room Code"
              className="w-full px-4 py-3 rounded-lg bg-slate-800 text-white
             font-mono tracking-[0.25em] placeholder:tracking-normal
             placeholder-gray-400
             border border-slate-700
             focus:border-green-500 focus:ring-2 focus:ring-green-500/30
             transition outline-none"
            /> */}

            <button
              onClick={handleJoin}
              disabled={loading}
              className="w-full py-3 rounded-lg font-semibold
                       bg-linear-to-r from-green-600 to-emerald-600
                       hover:from-green-500 hover:to-emerald-500
                       active:scale-[0.98]
                       transition-all disabled:opacity-50"
            >
              {loading ? "Joining..." : "Join room"}
            </button>
          </div>

          <p className="pt-4 text-center text-xs text-gray-500">
            Realtime chat · No signup · Instant rooms
          </p>
        </div>
      </div>
    </main>
  );
}

// "use client";

// import { useState } from "react";
// import { useRouter } from "next/navigation";
// import { getSocket } from "@/lib/socket";

// export default function HomePage() {
//   const router = useRouter();

//   const [createUsername, setCreateUsername] = useState("");
//   const [joinUsername, setJoinUsername] = useState("");
//   const [roomCode, setRoomCode] = useState("");

//   function createRoom() {
//     if (!createUsername.trim()) {
//       alert("Enter username");
//       return;
//     }

//     const ws = getSocket();

//     ws.onopen = () => {
//       ws.send(
//         JSON.stringify({
//           type: "create",
//           username: createUsername,
//         })
//       );
//     };

//     // ws.onmessage = (event) => {
//     //   const data = JSON.parse(event.data);

//     //   if (data.type === "room-created") {
//     //     localStorage.setItem("username", createUsername);
//     //     localStorage.setItem("role", "creator");
//     //     router.push(`/room/${data.roomCode}`);
//     //   }

//     //   if (data.type === "error") {
//     //     alert(data.message);
//     //   }
//     // };
//     const handleMessage = (event: MessageEvent) => {
//       const data = JSON.parse(event.data);

//       if (data.type === "room-created") {
//         localStorage.setItem("username", createUsername);
//         localStorage.setItem("role", "creator");
//         router.push(`/room/${data.roomCode}`);
//       }

//       if (data.type === "joined") {
//         localStorage.setItem("username", joinUsername);
//         localStorage.setItem("role", "joiner");
//         router.push(`/room/${roomCode}`);
//       }

//       if (data.type === "error") {
//         alert(data.message);
//       }
//     };

//     ws.addEventListener("message", handleMessage);
//   }

//   function joinRoom() {
//     if (!joinUsername.trim() || !roomCode.trim()) {
//       alert("Enter username and room code");
//       return;
//     }

//     const ws = getSocket();

//     ws.onopen = () => {
//       ws.send(
//         JSON.stringify({
//           type: "join",
//           roomCode,
//           username: joinUsername,
//         })
//       );
//     };

//     ws.onmessage = (event) => {
//       const data = JSON.parse(event.data);

//       if (data.type === "joined") {
//         localStorage.setItem("username", joinUsername);
//         localStorage.setItem("role", "joiner");
//         router.push(`/room/${roomCode}`);
//       }

//       if (data.type === "error") {
//         alert(data.message);
//       }
//     };
//   }

//   return (
//     <main className="min-h-screen bg-linear-to-br from-slate-900 to-black flex items-center justify-center text-white">
//       <div className="w-full max-w-md bg-slate-800 rounded-2xl shadow-xl p-8 space-y-8">
//         <h1 className="text-3xl font-bold text-center">Group Chat</h1>

//         <div className="space-y-3">
//           <h2 className="text-lg font-semibold">Create Room</h2>

//           <input
//             className="w-full px-4 py-2 rounded-lg bg-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
//             placeholder="Username"
//             value={createUsername}
//             onChange={(e) => setCreateUsername(e.target.value)}
//           />

//           <button
//             onClick={createRoom}
//             className="w-full py-2 rounded-lg bg-blue-600 hover:bg-blue-700 transition font-semibold"
//           >
//             Create Room
//           </button>
//         </div>

//         <div className="flex items-center gap-4 text-gray-400">
//           <div className="flex-1 h-px bg-gray-600" />
//           OR
//           <div className="flex-1 h-px bg-gray-600" />
//         </div>

//         <div className="space-y-3">
//           <h2 className="text-lg font-semibold">Join Room</h2>

//           <input
//             className="w-full px-4 py-2 rounded-lg bg-slate-700 focus:outline-none focus:ring-2 focus:ring-green-500"
//             placeholder="Username"
//             value={joinUsername}
//             onChange={(e) => setJoinUsername(e.target.value)}
//           />

//           <input
//             className="w-full px-4 py-2 rounded-lg bg-slate-700 focus:outline-none focus:ring-2 focus:ring-green-500 uppercase"
//             placeholder="Room code"
//             value={roomCode}
//             onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
//           />

//           <button
//             onClick={joinRoom}
//             className="w-full py-2 rounded-lg bg-green-600 hover:bg-green-700 transition font-semibold"
//           >
//             Join Room
//           </button>
//         </div>
//       </div>
//     </main>
//   );
// }
