import { Socket } from "socket.io-client";
import { RefObject } from "react";

const HEARTBEAT_INTERVAL = 5000;
const MAX_TIME_DRIFT = 10000; // 10 seconds - if heartbeat is delayed by more than this, PC likely slept

export interface HeartbeatRefs {
  heartbeatRef: RefObject<NodeJS.Timeout | null>;
  lastHeartbeatTime: RefObject<number>;
}

export function stopHeartbeat(heartbeatRef: RefObject<NodeJS.Timeout | null>) {
  if (heartbeatRef.current) {
    clearInterval(heartbeatRef.current);
    heartbeatRef.current = null;
  }
}

export function startHeartbeat(
  roomCode: string,
  socket: Socket | null,
  refs: HeartbeatRefs
) {
  stopHeartbeat(refs.heartbeatRef);
  refs.lastHeartbeatTime.current = Date.now();

  refs.heartbeatRef.current = setInterval(() => {
    const now = Date.now();
    const timeSinceLastHeartbeat = now - refs.lastHeartbeatTime.current;

    // Time drift detection: If interval took much longer than expected, PC likely slept
    if (timeSinceLastHeartbeat > HEARTBEAT_INTERVAL + MAX_TIME_DRIFT) {
      console.warn(
        `⚠️ Time drift detected: ${timeSinceLastHeartbeat}ms (expected ~${HEARTBEAT_INTERVAL}ms). PC may have slept.`
      );

      // Check if socket is still connected
      if (socket && !socket.connected) {
        socket.connect();
      } else if (socket?.connected && roomCode) {
        // Socket appears connected but we missed time - verify connection
        socket.emit("heartbeat", { roomCode }, () => {
          // If callback fires, connection is alive
          refs.lastHeartbeatTime.current = Date.now();
        });
      }
    } else {
      // Normal heartbeat
      if (socket?.connected && roomCode) {
        socket.emit("heartbeat", { roomCode });
        refs.lastHeartbeatTime.current = Date.now();
      } else {
        console.warn("⚠️ Cannot send heartbeat - socket disconnected");
      }
    }
  }, HEARTBEAT_INTERVAL);
}
