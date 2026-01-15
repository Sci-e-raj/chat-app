import { getSocket } from "@/lib/socket";

export function createRoom(username: string) {
  const ws = getSocket();

  return new Promise<string>((resolve, reject) => {
    if (ws.readyState !== WebSocket.OPEN) {
      reject("Connection not ready. Please try again.");
      return;
    }

    const handleMessage = (event: MessageEvent) => {
      const data = JSON.parse(event.data);

      if (data.type === "room-created") {
        ws.removeEventListener("message", handleMessage);
        resolve(data.roomCode);
      }

      if (data.type === "error") {
        ws.removeEventListener("message", handleMessage);
        reject(data.message);
      }
    };

    ws.addEventListener("message", handleMessage);

    ws.send(
      JSON.stringify({
        type: "create",
        username,
      })
    );
  });
}

export function joinRoom(username: string, roomCode: string) {
  const ws = getSocket();

  return new Promise<void>((resolve, reject) => {
    if (ws.readyState !== WebSocket.OPEN) {
      reject("Connection not ready. Please try again.");
      return;
    }

    const handleMessage = (event: MessageEvent) => {
      const data = JSON.parse(event.data);

      if (data.type === "joined") {
        ws.removeEventListener("message", handleMessage);
        resolve();
      }

      if (data.type === "error") {
        ws.removeEventListener("message", handleMessage);
        reject(data.message);
      }
    };

    ws.addEventListener("message", handleMessage);

    ws.send(
      JSON.stringify({
        type: "join",
        roomCode,
        username,
      })
    );
  });
}
