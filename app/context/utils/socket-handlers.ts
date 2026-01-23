import { RefObject } from "react";
import { Socket } from "socket.io-client";
import { GameRoom, Player } from "@/types/interface";
import { Toast } from "../toast-context";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

export interface SocketHandlersConfig {
  socket: Socket;
  roomRef: RefObject<GameRoom | null>;
  playerRef: RefObject<Player | null>;
  isConnectedRef: RefObject<boolean>;
  setRoom: (room: GameRoom | null) => void;
  setPlayer: (player: Player | null) => void;
  setIsConnected: (connected: boolean) => void;
  router: AppRouterInstance;
  stopHeartbeat: () => void;
  startHeartbeat: (roomCode: string) => void;
  handleRoomNotFound: () => void;
  handlePlayerRemoved: () => void;
}

export function setupSocketHandlers(config: SocketHandlersConfig) {
  const {
    socket,
    roomRef,
    playerRef,
    isConnectedRef,
    setRoom,
    setPlayer,
    setIsConnected,
    router,
    stopHeartbeat,
    startHeartbeat,
    handleRoomNotFound,
    handlePlayerRemoved,
  } = config;

  let lastSyncTime = Date.now();
  const SYNC_TIMEOUT = 60000; // Increased to 60 seconds - during gameplay, room events may be less frequent

  // Connection Status Handlers
  socket.on("connect", () => {
    setIsConnected(true);
    isConnectedRef.current = true;
    // Reset sync timer on reconnect to give time for events to come through
    lastSyncTime = Date.now();

    // Attempt to rejoin room if we were in one
    const savedRoom = roomRef.current;
    const savedPlayer = playerRef.current;

    if (savedRoom?.code && savedPlayer?.name) {
      socket.emit(
        "rejoin_room",
        { roomCode: savedRoom.code, playerName: savedPlayer.name },
        (res: any) => {
          if (res.success) {
            setRoom(res.room);
            setPlayer(res.player);
            startHeartbeat(res.room.code);
            // Update sync time after successful rejoin
            lastSyncTime = Date.now();
          } else {
            handleRoomNotFound();
          }
        }
      );
    }
  });

  socket.on("disconnect", () => {
    Toast.error("Disconnected from server");
    setIsConnected(false);
    isConnectedRef.current = false;
    stopHeartbeat();
    // Reset sync timer on disconnect to prevent false "room closed" errors
    // The timer will resume when we reconnect and receive events
    lastSyncTime = Date.now();
  });

  // Room state sync - detects if player is removed from room
  socket.on("room_state_sync", (syncedRoom: GameRoom) => {
    lastSyncTime = Date.now();

    // Check if I'm still in the room
    const amIStillInRoom = syncedRoom.players.some(
      (p: any) => p.id === socket.id
    );

    if (!amIStillInRoom) {
      Toast.error("You have been disconnected from the room");
      stopHeartbeat();
      setRoom(null);
      setPlayer(null);
      router.push("/");
      return;
    }

    // Update with latest room state
    setRoom(syncedRoom);
    const myData = syncedRoom.players.find((p: any) => p.id === socket.id);
    if (myData) setPlayer(myData);
  });

  // Periodic check for missing room_state_sync (room deleted)
  // Only check for room_state_sync events, not room_updated (which may be less frequent during gameplay)
  const syncCheckInterval = setInterval(() => {
    const now = Date.now();
    const timeSinceLastSync = now - lastSyncTime;
    const currentRoom = roomRef.current;
    const currentIsConnected = isConnectedRef.current;

    // Only check if we're actually connected - don't trigger on disconnection
    // Only trigger if we haven't received ANY room events (room_state_sync, room_updated, etc.) for 60 seconds
    // This is more lenient during gameplay where events may be less frequent
    if (
      currentRoom?.code &&
      socket.connected &&
      currentIsConnected &&
      timeSinceLastSync > SYNC_TIMEOUT
    ) {
      Toast.error("Room has been closed");
      stopHeartbeat();
      setRoom(null);
      setPlayer(null);
      router.push(`/?${currentRoom.code}`);
    }
  }, 10000); // Check every 10 seconds instead of 5 to be less aggressive

  socket.on("room_updated", (updatedRoom: GameRoom) => {
    // Update lastSyncTime since room_updated also indicates room is active
    lastSyncTime = Date.now();

    const myData = updatedRoom.players.find((p: any) => p.id === socket.id);

    // Check if current player is still in the room if not notify them
    if (!myData) {
      Toast.error("You have been removed from the room");
      stopHeartbeat();
      setRoom(null);
      setPlayer(null);
      const currentRoomCode = updatedRoom.code || roomRef.current?.code;
      if (currentRoomCode) {
        router.push(`/?${currentRoomCode}`);
      } else {
        router.push("/");
      }
      return;
    }

    setRoom(updatedRoom);
    setPlayer(myData);
  });

  socket.on("game_started", (startedRoom: GameRoom) => {
    // Update lastSyncTime since game_started indicates room is active
    lastSyncTime = Date.now();
    setRoom(startedRoom);
    router.push(`/game/${startedRoom.code}`);
  });

  socket.on(
    "player_left",
    ({
      leavingPlayer,
      newHost,
      room,
      kicked,
    }: {
      leavingPlayer: Player;
      newHost?: Player;
      room: GameRoom;
      kicked?: boolean;
    }) => {
      // Update lastSyncTime since player_left indicates room is still active
      lastSyncTime = Date.now();

      // Skip toast if the leaving player is the current user
      const isMeLeaving = leavingPlayer.id === socket.id;

      if (!isMeLeaving) {
        if (kicked) {
          Toast.error(`${leavingPlayer.name} was kicked from the game`);
        } else {
          Toast.error(`${leavingPlayer.name} left the game`);
        }
      }

      if (newHost) {
        Toast.success(`${newHost.name} is now the host`);
      }

      setRoom(room);
      const myData = room.players.find((p: any) => p.id === socket.id);
      if (myData) {
        setPlayer(myData);
      } else {
        handlePlayerRemoved();
      }
    }
  );

  socket.on("connect_error", (error) => {
    console.error("❌ Connection error:", error.message);
    // Don't show toast for connection errors - socket.io will handle reconnection
    // Only update connection state
    setIsConnected(false);
    isConnectedRef.current = false;
    // Reset sync timer to prevent false "room closed" errors during connection issues
    lastSyncTime = Date.now();
  });

  socket.on("error", (data: { message: string }) => {
    console.error("❌ Server error:", data.message);
    Toast.error(`Error: ${data.message}`);
  });

  socket.on("room_not_found", ({ roomCode }: { roomCode?: string }) => {
    Toast.error(`❌ Room ${roomCode} not found`);
    if (roomCode) {
      router.push(`/?${roomCode}`);
    } else {
      handleRoomNotFound();
    }
  });

  socket.on("room_deleted", (data: { message: string }) => {
    Toast.error(data.message);
    handleRoomNotFound();
  });

  socket.on(
    "player_removed_from_room",
    ({ roomCode, message }: { roomCode: string; message: string }) => {
      Toast.error(message || "You have been removed from the room");
      stopHeartbeat();
      setRoom(null);
      setPlayer(null);
      router.push(`/?${roomCode}`);
    }
  );

  socket.on(
    "player_kicked",
    ({ roomCode, message }: { roomCode: string; message: string }) => {
      Toast.error(message || "You have been kicked from the room");
      stopHeartbeat();
      setRoom(null);
      setPlayer(null);
      router.push(`/?${roomCode}`);
    }
  );

  // PC Sleep/Wake Detection
  const handleVisibilityChange = () => {
    if (document.visibilityState === "visible") {
      const currentRoom = roomRef.current;
      const currentPlayer = playerRef.current;
      const currentIsConnected = isConnectedRef.current;

      if (currentRoom?.code && (!socket.connected || !currentIsConnected)) {
        if (!socket.connected) {
          socket.connect();
        }

        if (socket.connected && currentRoom.code && currentPlayer?.name) {
          setTimeout(() => {
            socket.emit(
              "rejoin_room",
              { roomCode: currentRoom.code, playerName: currentPlayer.name },
              (res: any) => {
                if (res.success) {
                  setRoom(res.room);
                  setPlayer(res.player);
                  startHeartbeat(res.room.code);
                } else {
                  Toast.error("You have been removed from the room");
                  stopHeartbeat();
                  setRoom(null);
                  setPlayer(null);
                  router.push(`/?${currentRoom.code}`);
                }
              }
            );
          }, 1000);
        }
      }
    }
  };

  document.addEventListener("visibilitychange", handleVisibilityChange);

  // Cleanup function
  return () => {
    stopHeartbeat();
    clearInterval(syncCheckInterval);
    document.removeEventListener("visibilitychange", handleVisibilityChange);
    socket.removeAllListeners();
  };
}
