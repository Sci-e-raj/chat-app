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

  // useEffect(() => {
  //   const savedUsername = localStorage.getItem("username");
  //   if (savedUsername) {
  //     setCreateUsername(savedUsername);
  //     setJoinUsername(savedUsername);
  //   }
  // }, []);

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
    <main className="min-h-screen bg-linear-to-br from-slate-900 to-black flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-slate-800 rounded-2xl shadow-2xl p-8 space-y-6">
        <h1 className="text-3xl font-bold text-center text-white">
          Group Chat
        </h1>

        {error && (
          <div className="bg-red-500/10 border border-red-500 text-red-400 p-3 rounded text-sm">
            {error}
          </div>
        )}

        {/* Create Room */}
        <div className="space-y-3">
          <label className="text-sm text-gray-300">Create room</label>

          <input
            value={createUsername}
            onChange={(e) => setCreateUsername(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleCreate()}
            disabled={loading}
            placeholder="Your name"
            className="w-full px-4 py-2 rounded-lg bg-slate-700 text-white focus:ring-2 focus:ring-blue-500 outline-none"
          />

          <button
            onClick={handleCreate}
            disabled={loading}
            className="w-full py-2 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-50 transition font-semibold"
          >
            {loading ? "Creating..." : "Create room"}
          </button>
        </div>

        <div className="flex items-center gap-3 text-gray-400 text-sm">
          <div className="flex-1 h-px bg-gray-600" />
          OR
          <div className="flex-1 h-px bg-gray-600" />
        </div>

        {/* Join Room */}
        <div className="space-y-3">
          <label className="text-sm text-gray-300">Join room</label>

          <input
            value={joinUsername}
            onChange={(e) => setJoinUsername(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleJoin()}
            disabled={loading}
            placeholder="Your name"
            className="w-full px-4 py-2 rounded-lg bg-slate-700"
          />

          <input
            value={roomCode}
            onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
            onKeyDown={(e) => e.key === "Enter" && handleJoin()}
            disabled={loading}
            placeholder="ROOM CODE"
            className="w-full px-4 py-2 rounded-lg bg-slate-700 tracking-widest"
          />

          <button
            onClick={handleJoin}
            disabled={loading}
            className="w-full py-2 rounded-lg bg-green-600 hover:bg-green-700 disabled:opacity-50 transition font-semibold"
          >
            {loading ? "Joining..." : "Join room"}
          </button>
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
