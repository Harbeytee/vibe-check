"use client";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
  useRef,
  useCallback,
} from "react";
import { io, Socket } from "socket.io-client";
import { useRouter } from "next/navigation";
import {
  GameRoom,
  Player,
  GameContextType,
  TrafficStatus,
} from "@/types/interface";
import { Toast } from "./toast-context";
import config from "@/lib/config";

const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider = ({ children }: { children: ReactNode }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [room, setRoom] = useState<GameRoom | null>(null);
  const [player, setPlayer] = useState<Player | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [trafficStatus, setTrafficStatus] = useState<TrafficStatus | null>(
    null
  );
  const router = useRouter();
  const heartbeatRef = useRef<NodeJS.Timeout | null>(null);
  const maxReconnectAttempts = 5;
  const HEARTBEAT_INTERVAL = 5000;
  const roomRef = useRef<GameRoom | null>(null);
  const playerRef = useRef<Player | null>(null);
  const operationErrorListenersRef = useRef<Set<() => void>>(new Set());

  // Emit operation error to notify components
  const emitOperationError = useCallback(() => {
    operationErrorListenersRef.current.forEach((listener) => listener());
  }, []);

  // Subscribe to operation errors
  const onOperationError = useCallback((listener: () => void) => {
    operationErrorListenersRef.current.add(listener);
    return () => {
      operationErrorListenersRef.current.delete(listener);
    };
  }, []);

  // --- HEARTBEAT MANAGEMENT ---

  const stopHeartbeat = useCallback(() => {
    if (heartbeatRef.current) {
      console.log("💔 Stopping heartbeat");
      clearInterval(heartbeatRef.current);
      heartbeatRef.current = null;
    }
  }, []);

  const startHeartbeat = useCallback(
    (roomCode: string) => {
      stopHeartbeat(); // Clear any existing interval

      console.log("💓 Starting heartbeat for room:", roomCode);

      heartbeatRef.current = setInterval(() => {
        if (socket?.connected && roomCode) {
          socket.emit("heartbeat", { roomCode });
        } else {
          console.warn("⚠️ Cannot send heartbeat - socket disconnected");
        }
      }, HEARTBEAT_INTERVAL);
    },
    [socket, stopHeartbeat]
  );

  // Initialize Socket Connection
  useEffect(() => {
    const newSocket = io(config.socketUrl, {
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: maxReconnectAttempts,
    });

    setSocket(newSocket);

    let lastSyncTime = Date.now();
    const SYNC_TIMEOUT = 25000;

    // Connection Status Handlers
    newSocket.on("connect", () => {
      console.log("✅ Connected to server");
      setIsConnected(true);

      // Attempt to rejoin room if we were in one
      const savedRoom = room;
      const savedPlayer = player;

      if (savedRoom?.code && savedPlayer?.name) {
        console.log("🔄 Attempting to rejoin room after reconnect...");
        newSocket.emit(
          "rejoin_room",
          { roomCode: savedRoom.code, playerName: savedPlayer.name },
          (res: any) => {
            if (res.success) {
              console.log("✅ Successfully rejoined room");
              setRoom(res.room);
              setPlayer(res.player);
              startHeartbeat(res.room.code);
            } else {
              console.log("❌ Failed to rejoin room:", res.message);
              handleRoomNotFound();
            }
          }
        );
      }
    });

    newSocket.on("disconnect", (reason) => {
      Toast.error("Disconnected from server");
      console.log("❌ Disconnected from server:", reason);
      setIsConnected(false);
      stopHeartbeat();
    });

    // --- ROOM EVENT LISTENERS ---

    //  Room state sync - detects if player is removed from room
    newSocket.on("room_state_sync", (syncedRoom: GameRoom) => {
      lastSyncTime = Date.now(); // Update last sync time

      // Check if I'm still in the room
      const amIStillInRoom = syncedRoom.players.some(
        (p: any) => p.id === newSocket.id
      );

      if (!amIStillInRoom) {
        console.log("🚫 Disconnected from room (not in players list)");
        Toast.error("You have been disconnected from the room");

        stopHeartbeat();
        setRoom(null);
        setPlayer(null);
        router.push("/");
        return;
      }

      // Update with latest room state
      setRoom(syncedRoom);
      const myData = syncedRoom.players.find((p: any) => p.id === newSocket.id);
      if (myData) setPlayer(myData);
    });

    //Periodic check for missing room_state_sync (room deleted)
    const syncCheckInterval = setInterval(() => {
      const now = Date.now();
      const timeSinceLastSync = now - lastSyncTime;

      // If we haven't received a sync in 25 seconds, room might be deleted
      if (room?.code && timeSinceLastSync > SYNC_TIMEOUT && isConnected) {
        console.log("🚫 No room sync received - room may be deleted");
        Toast.error("Room has been closed");

        stopHeartbeat();
        setRoom(null);
        setPlayer(null);
        router.push(`/?${room.code}`);
      }
    }, 5000);

    newSocket.on("room_updated", (updatedRoom: GameRoom) => {
      console.log("📦 Room updated:", updatedRoom);

      const myData = updatedRoom.players.find(
        (p: any) => p.id === newSocket.id
      );

      // Check if current player is still in the room if not notify them
      if (!myData) {
        console.log("⚠️ You are no longer in this room");
        Toast.error("You have been removed from the room");
        stopHeartbeat();
        setRoom(null);
        setPlayer(null);
        // Redirect to home with room code
        const currentRoomCode = updatedRoom.code || room?.code;
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

    newSocket.on("game_started", (startedRoom: GameRoom) => {
      console.log("🎮 Game started");
      setRoom(startedRoom);
      router.push(`/game/${startedRoom.code}`);
    });

    newSocket.on("player_left", ({ leavingPlayer, newHost, room }) => {
      Toast.error(`${leavingPlayer.name} left the game`);

      if (newHost) {
        Toast.success(`${newHost.name} is now the host`);
      }

      // Update room state in context/store
      setRoom(room);
      const myData = room.players.find((p: any) => p.id === newSocket.id);
      if (myData) {
        setPlayer(myData);
      } else {
        handlePlayerRemoved();
      }
    });

    newSocket.on("error", (data: { message: string }) => {
      console.error("❌ Server error:", data.message);
      Toast.error(`Error: ${data.message}`);
    });

    newSocket.on("room_not_found", ({ roomCode }: { roomCode?: string }) => {
      Toast.error(`❌ Room ${roomCode} not found`);
      // Redirect to home with room code if provided
      if (roomCode) {
        router.push(`/?${roomCode}`);
      } else {
        handleRoomNotFound();
      }
    });

    newSocket.on("room_deleted", (data: { message: string }) => {
      Toast.error(data.message);
      handleRoomNotFound();
    });

    // Player removed from room - happens when cleanup removes player after sleep/disconnect
    newSocket.on(
      "player_removed_from_room",
      ({ roomCode, message }: { roomCode: string; message: string }) => {
        console.log("🚫 Removed from room:", message);
        Toast.error(message || "You have been removed from the room");
        stopHeartbeat();
        setRoom(null);
        setPlayer(null);
        // Redirect to home with room code
        router.push(`/?${roomCode}`);
      }
    );

    // Traffic status listener - receives updates when traffic is high/critical
    newSocket.on("traffic_status", (status: TrafficStatus) => {
      console.log("🚦 Traffic status update:", status);
      setTrafficStatus(status);

      if (status.level === "critical") {
        Toast.error(
          status.message ||
            "High traffic detected. Some features may be limited."
        );
      } else if (status.level === "high") {
        Toast.error(
          status.message || "High traffic detected. Some delays may occur."
        );
      }
    });

    // Cleanup on unmount
    return () => {
      console.log("🧹 Cleaning up socket connection");
      stopHeartbeat();
      clearInterval(syncCheckInterval);
      newSocket.removeAllListeners();
      newSocket.disconnect();
    };
  }, []); // Only run once on mount

  // --- HELPER FUNCTIONS ---

  const handleRoomNotFound = useCallback(() => {
    Toast.error("Removed from room");
    stopHeartbeat();
    setRoom(null);
    setPlayer(null);
    router.push("/");
  }, [router, stopHeartbeat]);

  const handlePlayerRemoved = useCallback(() => {
    Toast.error("You have been removed from the room");
    const roomCode = room?.code;
    stopHeartbeat();
    setRoom(null);
    setPlayer(null);
    // Redirect to home with room code if available
    if (roomCode) {
      router.push(`/?${roomCode}`);
    } else {
      router.push("/");
    }
  }, [room?.code, router, stopHeartbeat]);

  // --- GAME ACTIONS ---

  const createRoom = useCallback(
    (playerName: string) => {
      if (!socket?.connected) {
        Toast.error("You are offline. Please wait for connection...");
        return;
      }

      // Check if room creation is disabled due to traffic
      if (trafficStatus && !trafficStatus.roomCreationEnabled) {
        const retryMessage =
          trafficStatus.message ||
          "Room creation temporarily paused due to high traffic. Please try again shortly.";
        Toast.error(retryMessage);
        return;
      }

      console.log("🏠 Creating room...");
      socket.emit("create_room", { playerName }, (res: any) => {
        if (res.success) {
          console.log("✅ Room created:", res.room.code);
          setRoom(res.room);
          setPlayer(res.player);
          startHeartbeat(res.room.code);
          router.push(`/lobby/${res.room.code}`);
        } else {
          // Handle traffic status in error response
          if (res.trafficStatus) {
            const trafficInfo = res.trafficStatus;
            setTrafficStatus({
              level: trafficInfo.level,
              activeRooms: 0,
              activeConnections: 0,
              roomCreationEnabled: false,
              message: res.message,
              timestamp: Date.now(),
            });

            // Show error with retry information
            const retryMsg =
              res.message ||
              `Room creation paused. Try again in ${
                trafficInfo.retryAfter || 30
              }s`;
            Toast.error(retryMsg);
          } else {
            Toast.error(res.message || "Failed to create room");
          }
          // Notify components that operation failed
          emitOperationError();
        }
      });
    },
    [socket, router, startHeartbeat, trafficStatus, emitOperationError]
  );

  const joinRoom = useCallback(
    (roomCode: string, playerName: string) => {
      if (!socket?.connected) {
        return Toast.success("Connecting to server...");
      }

      socket.emit("join_room", { roomCode, playerName }, (res: any) => {
        if (res.success) {
          console.log("✅ Joined room:", roomCode);
          setRoom(res.room);
          setPlayer(res.player);
          startHeartbeat(res.room.code);
          router.push(`/lobby/${res.room.code}`);
        } else {
          Toast.error(res.message || "Failed to join room");
          // Notify components that operation failed
          emitOperationError();
        }
      });
    },
    [socket, router, startHeartbeat, emitOperationError]
  );

  const selectPack = useCallback(
    (packId: string) => {
      if (!socket?.connected || !room?.code) return;

      console.log("📦 Selecting pack:", packId);
      socket.emit("select_pack", { roomCode: room.code, packId });
    },
    [socket, room]
  );

  const startGame = useCallback(
    (callback?: (res: any) => void) => {
      if (!socket?.connected || !room?.code) {
        Toast.error("Not connected to room");
        return;
      }

      console.log("🎮 Starting game...");
      socket.emit("start_game", { roomCode: room.code }, (res: any) => {
        if (res.success) {
          console.log("✅ Game started successfully");
        } else {
          Toast.error(res.message || "Failed to start game");
        }
        callback?.(res);
      });
    },
    [socket, room]
  );

  const flipCard = useCallback(() => {
    if (!socket?.connected || !room?.code) {
      Toast.error("Not connected to room");
      return;
    }

    socket.emit("flip_card", { roomCode: room.code });
  }, [socket, room]);

  const nextQuestion = useCallback(() => {
    if (!socket?.connected || !room?.code) {
      Toast.error("Not connected to room");
      return;
    }

    console.log("⏭️ Getting next question...");
    socket.emit("next_question", { roomCode: room.code });
  }, [socket, room]);

  const addCustomQuestion = useCallback(
    (question: string) => {
      if (!socket?.connected || !room?.code) return;

      console.log("➕ Adding custom question");
      socket.emit("add_custom_question", { roomCode: room.code, question });
    },
    [socket, room]
  );

  const removeCustomQuestion = useCallback(
    (questionId: number) => {
      if (!socket?.connected || !room?.code) return;

      console.log("➖ Removing custom question");
      socket.emit("remove_custom_question", {
        roomCode: room.code,
        questionId,
      });
    },
    [socket, room]
  );

  const getCurrentTurnPlayer = useCallback((): Player | null => {
    if (!room || room.currentPlayerIndex === undefined) return null;
    return room.players[room.currentPlayerIndex] || null;
  }, [room]);

  return (
    <GameContext.Provider
      value={{
        // State
        room,
        player,
        socket,
        currentPlayer: getCurrentTurnPlayer(),
        trafficStatus,

        // Actions
        createRoom,
        joinRoom,
        selectPack,
        startGame,
        flipCard,
        nextQuestion,
        addCustomQuestion,
        removeCustomQuestion,

        getCurrentTurnPlayer,
        onOperationError,
      }}
    >
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error("useGame must be used within GameProvider");
  }
  return context;
};
