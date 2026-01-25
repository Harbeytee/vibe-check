import { Socket } from "socket.io-client";
import { GameRoom, Player } from "@/types/interface";
import { Toast } from "../toast-context";

export interface PlayerOperationsConfig {
  socket: Socket | null;
  room: GameRoom | null;
  player: Player | null;
  setRoom: (room: GameRoom | null) => void;
}

export function kickPlayer(
  playerIdToKick: string,
  config: PlayerOperationsConfig
) {
  const { socket, room, player, setRoom } = config;

  if (!socket?.connected || !room?.code) {
    Toast.error("Not connected to room");
    return;
  }

  if (!player?.isHost) {
    Toast.error("Only the host can kick players");
    return;
  }

  // Optimistic UI update - remove player immediately from local state
  const playerToKick = room.players.find((p) => p.id === playerIdToKick);
  const previousRoomState = room; // Save for rollback

  if (playerToKick) {
    const updatedPlayers = room.players.filter((p) => p.id !== playerIdToKick);
    const kickedPlayerIdx = room.players.findIndex((p) => p.id === playerIdToKick);
    let newCurrentPlayerIndex = room.currentPlayerIndex;
    const remainingCount = updatedPlayers.length;

    // Adjust currentPlayerIndex if needed (same logic as backend)
    if (remainingCount > 0) {
      if (kickedPlayerIdx === room.currentPlayerIndex) {
        // The active player was kicked. Move to next player.
        newCurrentPlayerIndex = room.currentPlayerIndex % remainingCount;
      } else if (kickedPlayerIdx < room.currentPlayerIndex) {
        // Someone before the active player was kicked.
        newCurrentPlayerIndex = Math.max(0, room.currentPlayerIndex - 1);
      }
      // If kicked player was after currentPlayerIndex, no adjustment needed
    }

    setRoom({
      ...room,
      players: updatedPlayers,
      currentPlayerIndex: newCurrentPlayerIndex,
      // Reset flipped state if current player was kicked
      isFlipped: kickedPlayerIdx === room.currentPlayerIndex ? false : room.isFlipped,
    });
  }

  // Emit to server (server will sync the real state via room_updated event)
  socket.emit(
    "kick_player",
    { roomCode: room.code, playerIdToKick },
    (res: any) => {
      if (!res.success) {
        // Rollback optimistic update if server rejects
        setRoom(previousRoomState);
        Toast.error(res.message || "Failed to kick player");
      }
    }
  );
}
