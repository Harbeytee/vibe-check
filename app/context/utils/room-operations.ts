import { Socket } from "socket.io-client";
import { GameRoom, Player } from "@/types/interface";
import { Toast } from "../toast-context";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

export interface RoomOperationsConfig {
  socket: Socket | null;
  room: GameRoom | null;
  setRoom: (room: GameRoom | null) => void;
  setPlayer: (player: Player | null) => void;
  router: AppRouterInstance;
  startHeartbeat: (roomCode: string) => void;
}

export function createRoom(
  playerName: string,
  config: RoomOperationsConfig,
  callback?: (res: any) => void
) {
  const { socket, setRoom, setPlayer, router, startHeartbeat } = config;

  if (!socket?.connected) {
    Toast.error("You are offline. Please wait for connection...");
    callback?.({
      success: false,
      message: "You are offline. Please wait for connection...",
    });
    return;
  }

  socket.emit("create_room", { playerName }, (res: any) => {
    if (res.success) {
      setRoom(res.room);
      setPlayer(res.player);
      startHeartbeat(res.room.code);
      router.push(`/lobby/${res.room.code}`);
    } else {
      // Show specific toast for high traffic
      if (res.highTraffic) {
        Toast.error("High traffic detected. Please try again in a moment.");
      } else {
        Toast.error(res.message || "Failed to create room");
      }
    }
    callback?.(res);
  });
}

export function joinRoom(
  roomCode: string,
  playerName: string,
  config: RoomOperationsConfig,
  callback?: (res: any) => void
) {
  const { socket, setRoom, setPlayer, router, startHeartbeat } = config;

  if (!socket?.connected) {
    Toast.error("Connecting to server...");
    callback?.({ success: false, message: "Connecting to server..." });
    return;
  }

  socket.emit("join_room", { roomCode, playerName }, (res: any) => {
    if (res.success) {
      setRoom(res.room);
      setPlayer(res.player);
      startHeartbeat(res.room.code);
      router.push(`/lobby/${res.room.code}`);
    } else {
      Toast.error(res.message || "Failed to join room");
    }
    callback?.(res);
  });
}

export function selectPack(packId: string, config: RoomOperationsConfig) {
  const { socket, room, setRoom } = config;

  if (!socket?.connected || !room?.code) return;

  // Optimistic UI update - update selected pack immediately
  setRoom({
    ...room,
    selectedPack: packId as any, // Type assertion for PackType
  });

  // Emit to server (server will sync the real state via room_updated event)
  socket.emit("select_pack", { roomCode: room.code, packId });
}

export function addCustomQuestion(
  question: string,
  config: RoomOperationsConfig
) {
  const { socket, room } = config;

  if (!socket?.connected || !room?.code) return;

  socket.emit("add_custom_question", { roomCode: room.code, question });
}

export function removeCustomQuestion(
  questionId: number,
  config: RoomOperationsConfig
) {
  const { socket, room } = config;

  if (!socket?.connected || !room?.code) return;

  socket.emit("remove_custom_question", {
    roomCode: room.code,
    questionId,
  });
}
