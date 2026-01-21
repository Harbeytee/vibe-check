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
import { GameRoom, Player, GameContextType } from "@/types/interface";
import { Toast } from "./toast-context";
import config from "@/lib/config";

const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider = ({ children }: { children: ReactNode }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [room, setRoom] = useState<GameRoom | null>(null);
  const [player, setPlayer] = useState<Player | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const router = useRouter();
  const heartbeatRef = useRef<NodeJS.Timeout | null>(null);
  const lastHeartbeatTime = useRef<number>(Date.now());
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;
  const HEARTBEAT_INTERVAL = 5000;
  const MAX_TIME_DRIFT = 10000; // 10 seconds - if heartbeat is delayed by more than this, PC likely slept

  // heartbeat management
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
      lastHeartbeatTime.current = Date.now();

      console.log("💓 Starting heartbeat for room:", roomCode);

      heartbeatRef.current = setInterval(() => {
        const now = Date.now();
        const timeSinceLastHeartbeat = now - lastHeartbeatTime.current;

        // Time drift detection: If interval took much longer than expected, PC likely slept
        if (timeSinceLastHeartbeat > HEARTBEAT_INTERVAL + MAX_TIME_DRIFT) {
          console.warn(
            `⚠️ Time drift detected: ${timeSinceLastHeartbeat}ms (expected ~${HEARTBEAT_INTERVAL}ms). PC may have slept.`
          );

          // Check if socket is still connected
          if (socket && !socket.connected) {
            console.log("🔄 Socket disconnected - attempting reconnect...");
            socket.connect();
          } else if (socket?.connected && roomCode) {
            // Socket appears connected but we missed time - verify connection
            socket.emit("heartbeat", { roomCode }, () => {
              // If callback fires, connection is alive
              lastHeartbeatTime.current = Date.now();
            });
          }
        } else {
          // Normal heartbeat
          if (socket?.connected && roomCode) {
            socket.emit("heartbeat", { roomCode });
            lastHeartbeatTime.current = Date.now();
          } else {
            console.warn("⚠️ Cannot send heartbeat - socket disconnected");
          }
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
      reconnectAttempts.current = 0;

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
      // Don't redirect immediately - let reconnection logic handle it
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

    // 🔴 NEW: Periodic check for missing room_state_sync (room deleted)
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
        // Don't disconnect - let them stay connected to receive redirect event
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

    // newSocket.on("game_over", ({ message }: { message: string }) => {
    //   Toast.success(message);
    // });

    // newSocket.on("new_host_toast", ({ name }: { name: string }) => {
    //   Toast.success(`${name} is now the host!`);
    // });

    newSocket.on(
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
        // Show different message if player was kicked vs left voluntarily
        if (kicked) {
          Toast.error(`${leavingPlayer.name} was kicked from the game`);
        } else {
          Toast.error(`${leavingPlayer.name} left the game`);
        }

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
      }
    );

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

    // Player kicked by host
    newSocket.on(
      "player_kicked",
      ({ roomCode, message }: { roomCode: string; message: string }) => {
        console.log("🚫 Kicked from room:", message);
        // Toast removed - player_left event already shows toast to everyone
        stopHeartbeat();
        setRoom(null);
        setPlayer(null);
        // Redirect to home with room code
        router.push(`/?${roomCode}`);
      }
    );

    // --- PC SLEEP/WAKE DETECTION ---
    // Detect when page becomes visible again (PC wakes from sleep)
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        console.log("👁️ Page became visible - checking connection...");

        // Use current state values via closure
        const currentRoom = room;
        const currentPlayer = player;
        const currentIsConnected = isConnected;

        // If we have a room but socket is disconnected, try to reconnect
        if (
          currentRoom?.code &&
          (!newSocket.connected || !currentIsConnected)
        ) {
          console.log("🔄 Reconnecting after wake from sleep...");

          if (!newSocket.connected) {
            newSocket.connect();
          }

          // Verify we're still in the room after reconnection
          if (newSocket.connected && currentRoom.code && currentPlayer?.name) {
            setTimeout(() => {
              newSocket.emit(
                "rejoin_room",
                { roomCode: currentRoom.code, playerName: currentPlayer.name },
                (res: any) => {
                  if (res.success) {
                    console.log("✅ Successfully rejoined room after wake");
                    setRoom(res.room);
                    setPlayer(res.player);
                    startHeartbeat(res.room.code);
                  } else {
                    console.log(
                      "❌ Failed to rejoin room after wake:",
                      res.message
                    );
                    Toast.error("You have been removed from the room");
                    stopHeartbeat();
                    setRoom(null);
                    setPlayer(null);
                    router.push(`/?${currentRoom.code}`);
                  }
                }
              );
            }, 1000); // Wait 1 second for connection to stabilize
          }
        }
      }
    };

    // Listen for visibility changes (PC sleep/wake)
    document.addEventListener("visibilitychange", handleVisibilityChange);

    // Cleanup on unmount
    return () => {
      console.log("🧹 Cleaning up socket connection");
      stopHeartbeat();
      clearInterval(syncCheckInterval);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      newSocket.removeAllListeners();
      newSocket.disconnect();
    };
  }, []); // Only run once on mount

  // Membership check when room changes or socket reconnects
  useEffect(() => {
    if (!room?.code || !socket?.connected) return;

    // Periodic membership check - detects if player was removed after sleep/disconnect
    const membershipCheckInterval = setInterval(() => {
      if (socket?.connected && room?.code) {
        // Check if we're still in the room
        socket.emit("check_membership", { roomCode: room.code }, (res: any) => {
          if (!res.success || !res.inRoom) {
            // Not in room - redirect
            console.log("🚫 Membership check failed - not in room");
            Toast.error("You have been removed from the room");
            stopHeartbeat();
            setRoom(null);
            setPlayer(null);
            router.push(`/?${room.code}`);
          }
        });
      }
    }, 10000); // Check every 10 seconds

    return () => {
      clearInterval(membershipCheckInterval);
    };
  }, [room?.code, socket, router, stopHeartbeat]);

  // --- HELPER FUNCTIONS ---

  const handleRoomNotFound = useCallback(() => {
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
    (playerName: string, callback?: (res: any) => void) => {
      if (!socket?.connected) {
        Toast.error("You are offline. Please wait for connection...");
        callback?.({
          success: false,
          message: "You are offline. Please wait for connection...",
        });
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
          Toast.error(res.message || "Failed to create room");
        }
        callback?.(res);
      });
    },
    [socket, router, startHeartbeat]
  );

  const joinRoom = useCallback(
    (roomCode: string, playerName: string, callback?: (res: any) => void) => {
      if (!socket?.connected) {
        Toast.error("Connecting to server...");
        callback?.({ success: false, message: "Connecting to server..." });
        return;
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
        }
        callback?.(res);
      });
    },
    [socket, router, startHeartbeat]
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
        const errorMsg = "Not connected to room";
        Toast.error(errorMsg);
        callback?.({ success: false, message: errorMsg });
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

  const kickPlayer = useCallback(
    (playerIdToKick: string) => {
      if (!socket?.connected || !room?.code) {
        Toast.error("Not connected to room");
        return;
      }

      if (!player?.isHost) {
        Toast.error("Only the host can kick players");
        return;
      }

      console.log("👢 Kicking player:", playerIdToKick);
      socket.emit(
        "kick_player",
        { roomCode: room.code, playerIdToKick },
        (res: any) => {
          if (res.success) {
            Toast.success(res.message || "Player kicked successfully");
          } else {
            Toast.error(res.message || "Failed to kick player");
          }
        }
      );
    },
    [socket, room, player]
  );

  return (
    <GameContext.Provider
      value={{
        // State
        room,
        player,
        socket,
        currentPlayer: getCurrentTurnPlayer(),

        // Actions
        createRoom,
        joinRoom,
        selectPack,
        startGame,
        flipCard,
        nextQuestion,
        addCustomQuestion,
        removeCustomQuestion,
        kickPlayer,

        getCurrentTurnPlayer,
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
