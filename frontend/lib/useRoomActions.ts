import { getSocket } from "@/lib/socket";

function waitForSocketOpen(ws: WebSocket) {
  return new Promise<void>((resolve, reject) => {
    if (ws.readyState === WebSocket.OPEN) {
      resolve();
      return;
    }

    if (ws.readyState !== WebSocket.CONNECTING) {
      reject(new Error("WebSocket not available"));
      return;
    }

    const handleOpen = () => {
      ws.removeEventListener("open", handleOpen);
      resolve();
    };

    ws.addEventListener("open", handleOpen);
  });
}

export async function createRoom(username: string) {
  const ws = getSocket();

  await waitForSocketOpen(ws);

  return new Promise<string>((resolve, reject) => {
    const handleMessage = (event: MessageEvent) => {
      const data = JSON.parse(event.data);

      if (data.type === "room-created") {
        ws.removeEventListener("message", handleMessage);
        resolve(data.roomCode);
      }

      if (data.type === "error") {
        ws.removeEventListener("message", handleMessage);
        reject(new Error(data.message));
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

export async function joinRoom(username: string, roomCode: string) {
  const ws = getSocket();

  await waitForSocketOpen(ws);

  return new Promise<void>((resolve, reject) => {
    const handleMessage = (event: MessageEvent) => {
      const data = JSON.parse(event.data);

      if (data.type === "joined") {
        ws.removeEventListener("message", handleMessage);
        resolve();
      }

      if (data.type === "error") {
        ws.removeEventListener("message", handleMessage);
        reject(new Error(data.message));
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
