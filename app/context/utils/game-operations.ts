import { Socket } from "socket.io-client";
import { GameRoom, Player } from "@/types/interface";
import { Toast } from "../toast-context";
import { analytics } from "./analytics";
import { getPackById } from "@/data/packs";
import type { StartGameResponse } from "@/types/socket-responses";

export interface GameOperationsConfig {
  socket: Socket | null;
  room: GameRoom | null;
}

export function startGame(
  config: GameOperationsConfig,
  callback?: (res: StartGameResponse) => void
) {
  const { socket, room } = config;

  if (!socket?.connected || !room?.code) {
    const errorMsg = "Not connected to room";
    Toast.error(errorMsg);
    callback?.({ success: false, message: errorMsg });
    return;
  }

  socket.emit(
    "start_game",
    { roomCode: room.code },
    (res: StartGameResponse) => {
      if (res.success) {
        // Game started successfully
        const pack = getPackById(room.selectedPack || "");
        const packName = pack?.name || room.selectedPack || "";
        const hasCustomQuestions = (room.customQuestions?.length || 0) > 0;
        analytics.gameStarted(packName, hasCustomQuestions);
      } else {
        Toast.error(res.message || "Failed to start game");
      }
      callback?.(res);
    }
  );
}

export function flipCard(config: GameOperationsConfig) {
  const { socket, room } = config;

  if (!socket?.connected || !room?.code) {
    Toast.error("Not connected to room");
    return;
  }

  socket.emit("flip_card", { roomCode: room.code });
}

export function nextQuestion(config: GameOperationsConfig) {
  const { socket, room } = config;

  if (!socket?.connected || !room?.code) {
    Toast.error("Not connected to room");
    return;
  }

  socket.emit("next_question", { roomCode: room.code });
}

export function getCurrentTurnPlayer(room: GameRoom | null): Player | null {
  if (!room || room.currentPlayerIndex === undefined) return null;
  return room.players[room.currentPlayerIndex] || null;
}
