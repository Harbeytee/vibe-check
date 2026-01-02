// "use client";
// import {
//   createContext,
//   useContext,
//   useEffect,
//   useState,
//   ReactNode,
//   useRef,
// } from "react";
// import { io, Socket } from "socket.io-client";
// import { useRouter } from "next/navigation";
// import { GameRoom, Player, GameContextType } from "@/types/interface";

// const GameContext = createContext<GameContextType | undefined>(undefined);

// export const GameProvider = ({ children }: { children: ReactNode }) => {
//   const [socket, setSocket] = useState<Socket | null>(null);
//   const [room, setRoom] = useState<GameRoom | null>(null);
//   const [player, setPlayer] = useState<Player | null>(null);
//   const router = useRouter();
//   const heartbeatRef = useRef<NodeJS.Timeout | null>(null);
//   const HEARTBEAT_INTERVAL = 5000;

//   useEffect(() => {
//     const newSocket = io(
//       process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:4000"
//     );
//     setSocket(newSocket);

//     // --- LISTENERS ---

//     newSocket.on("room_updated", (updatedRoom: any /*GameRoom*/) => {
//       setRoom(updatedRoom);
//       const myData = updatedRoom.players.find(
//         (p: any) => p.id === newSocket.id
//       );
//       if (myData) setPlayer(myData);
//     });

//     // Native Alert for Host Migration
//     newSocket.on("new_host_toast", ({ name }: { name: string }) => {
//       alert(`${name} is now the host!`);
//     });

//     // Native Alert for Errors (The logic we added to the backend)
//     newSocket.on("error", (data: { message: string }) => {
//       alert(`Error: ${data.message}`);
//     });

//     // Native Alert for Room Deletion / Game Over
//     newSocket.on("room_deleted", (data: { message: string }) => {
//       alert(data.message);
//       setRoom(null);
//       router.push("/");
//     });

//     newSocket.on("game_started", (startedRoom: GameRoom) => {
//       setRoom(startedRoom);
//       router.push(`/game/${room?.code}`);
//     });

//     return () => {
//       // newSocket.off("room_updated");
//       // newSocket.off("new_host_toast");
//       // newSocket.off("error");
//       // newSocket.off("room_deleted");
//       // newSocket.off("game_started");
//       stopHeartbeat();
//       newSocket.removeAllListeners();
//       newSocket.disconnect();
//     };
//   }, [router]);

//   // -----------------------
//   // HEARTBEAT
//   // -----------------------
//   const startHeartbeat = (roomCode: string) => {
//     stopHeartbeat(); // safety

//     heartbeatRef.current = setInterval(() => {
//       if (socket?.connected && roomCode) {
//         socket.emit("heartbeat", { roomCode });
//       }
//     }, HEARTBEAT_INTERVAL);
//   };

//   const stopHeartbeat = () => {
//     if (heartbeatRef.current) {
//       clearInterval(heartbeatRef.current);
//       heartbeatRef.current = null;
//     }
//   };
//   // --- ACTIONS ---

//   const createRoom = (playerName: string) => {
//     if (!socket?.connected) return alert("You are offline. Please wait.");

//     socket.emit("create_room", { playerName }, (res: any) => {
//       if (res.success) {
//         setRoom(res.room);
//         setPlayer(res.player);

//         startHeartbeat(res.room.code);
//         router.push(`/lobby/${res.room.code}`);
//       } else {
//         alert(res.message);
//       }
//     });
//   };

//   const joinRoom = (roomCode: string, playerName: string) => {
//     if (!socket?.connected) return alert("Trying to reconnect...");

//     socket.emit("join_room", { roomCode, playerName }, (res: any) => {
//       if (res.success) {
//         setRoom(res.room);
//         setPlayer(res.player);
//         startHeartbeat(res.room.code);
//         router.push(`/lobby/${res.room.code}`);
//       } else {
//         alert(res.message);
//       }
//     });
//   };

//   const selectPack = (packId: string) => {
//     socket?.emit("select_pack", { roomCode: room?.code, packId });
//   };

//   const startGame = (callback: (res: any) => void) => {
//     socket?.emit("start_game", { roomCode: room?.code }, callback);
//   };

//   const nextQuestion = () => {
//     socket?.emit("next_question", { roomCode: room?.code });
//   };

//   // const resetGame = () => {
//   //   socket?.emit("reset_game", { roomCode: room?.code });
//   // };

//   const addCustomQuestion = (question: string) => {
//     socket?.emit("add_custom_question", { roomCode: room?.code, question });
//   };

//   const removeCustomQuestion = (questionId: number) => {
//     socket?.emit("delete_custom_question", {
//       roomCode: room?.code,
//       questionId,
//     });
//   };

//   const getCurrentTurnPlayer = (): Player | null => {
//     if (!room) return null;
//     return room.players[room.currentPlayerIndex] || null;
//   };

//   return (
//     <GameContext.Provider
//       value={{
//         currentPlayer: getCurrentTurnPlayer(),
//         createRoom,
//         joinRoom,
//         selectPack,
//         addCustomQuestion,
//         removeCustomQuestion,
//         startGame,
//         nextQuestion,

//         getCurrentTurnPlayer,
//         room,
//         socket,
//         player,
//       }}
//     >
//       {children}
//     </GameContext.Provider>
//   );
// };

// export const useGame = () => {
//   const context = useContext(GameContext);
//   if (!context) throw new Error("useGame error");
//   return context;
// };

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

const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider = ({ children }: { children: ReactNode }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [room, setRoom] = useState<GameRoom | null>(null);
  const [player, setPlayer] = useState<Player | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const router = useRouter();
  const heartbeatRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;
  const HEARTBEAT_INTERVAL = 5000;

  // Initialize Socket Connection
  useEffect(() => {
    const newSocket = io(
      process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:4000",
      {
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: maxReconnectAttempts,
      }
    );

    setSocket(newSocket);

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
      console.log("❌ Disconnected from server:", reason);
      setIsConnected(false);
      stopHeartbeat();
    });

    newSocket.on("connect_error", (error) => {
      console.error("Connection error:", error);
      reconnectAttempts.current++;

      if (reconnectAttempts.current >= maxReconnectAttempts) {
        Toast.error("Failed to connect to server. Please refresh the page.");
      }
    });

    // --- ROOM EVENT LISTENERS ---

    newSocket.on("room_updated", (updatedRoom: GameRoom) => {
      console.log("📦 Room updated:", updatedRoom);
      setRoom(updatedRoom);

      // Check if current player is still in the room
      const myData = updatedRoom.players.find(
        (p: any) => p.id === newSocket.id
      );

      if (myData) {
        setPlayer(myData);
      } else {
        // Player was removed from room
        console.log("⚠️ You are no longer in this room");
        handlePlayerRemoved();
      }
    });

    newSocket.on("game_started", (startedRoom: GameRoom) => {
      console.log("🎮 Game started");
      setRoom(startedRoom);
      router.push(`/game/${startedRoom.code}`);
    });

    newSocket.on("game_over", ({ message }: { message: string }) => {
      Toast.success(message);
    });

    newSocket.on("new_host_toast", ({ name }: { name: string }) => {
      Toast.success(`${name} is now the host!`);
    });

    newSocket.on("error", (data: { message: string }) => {
      console.error("❌ Server error:", data.message);
      Toast.error(`Error: ${data.message}`);
    });

    newSocket.on("room_not_found", ({ roomCode }: { roomCode?: string }) => {
      Toast.error(`❌ Room ${roomCode} not found`);
      handleRoomNotFound();
    });

    newSocket.on("room_deleted", (data: { message: string }) => {
      Toast.error(data.message);
      handleRoomNotFound();
    });

    // Cleanup on unmount
    return () => {
      console.log("🧹 Cleaning up socket connection");
      stopHeartbeat();
      newSocket.removeAllListeners();
      newSocket.disconnect();
    };
  }, []); // Only run once on mount

  // --- HELPER FUNCTIONS ---

  const handleRoomNotFound = useCallback(() => {
    stopHeartbeat();
    setRoom(null);
    setPlayer(null);
    router.push("/");
  }, [router]);

  const handlePlayerRemoved = useCallback(() => {
    Toast.error("You have been removed from the room");
    handleRoomNotFound();
  }, [handleRoomNotFound]);

  // --- HEARTBEAT MANAGEMENT ---

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
    [socket]
  );

  const stopHeartbeat = useCallback(() => {
    if (heartbeatRef.current) {
      console.log("💔 Stopping heartbeat");
      clearInterval(heartbeatRef.current);
      heartbeatRef.current = null;
    }
  }, []);

  // --- GAME ACTIONS ---

  const createRoom = useCallback(
    (playerName: string) => {
      if (!socket?.connected) {
        Toast.error;
        return Toast.error("You are offline. Please wait for connection...");
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
      });
    },
    [socket, router, startHeartbeat]
  );

  const joinRoom = useCallback(
    (roomCode: string, playerName: string) => {
      if (!socket?.connected) {
        return Toast.success("Connecting to server...");
      }

      console.log("🚪 Joining room:", roomCode);
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

  const leaveRoom = useCallback(() => {
    console.log("👋 Leaving room");
    stopHeartbeat();
    setRoom(null);
    setPlayer(null);
    router.push("/");
  }, [router, stopHeartbeat]);

  return (
    <GameContext.Provider
      value={{
        // State
        room,
        player,
        socket,
        // isConnected,
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
        // leaveRoom,
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
