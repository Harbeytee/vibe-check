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
import config from "@/lib/config";
import {
  stopHeartbeat as stopHeartbeatUtil,
  startHeartbeat as startHeartbeatUtil,
  HeartbeatRefs,
} from "./utils/heartbeat";
import { setupSocketHandlers } from "./utils/socket-handlers";
import {
  createRoom as createRoomUtil,
  joinRoom as joinRoomUtil,
  selectPack as selectPackUtil,
  addCustomQuestion as addCustomQuestionUtil,
  removeCustomQuestion as removeCustomQuestionUtil,
} from "./utils/room-operations";
import {
  startGame as startGameUtil,
  flipCard as flipCardUtil,
  nextQuestion as nextQuestionUtil,
  getCurrentTurnPlayer as getCurrentTurnPlayerUtil,
} from "./utils/game-operations";
import { kickPlayer as kickPlayerUtil } from "./utils/player-operations";

const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider = ({ children }: { children: ReactNode }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [room, setRoom] = useState<GameRoom | null>(null);
  const [player, setPlayer] = useState<Player | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const router = useRouter();
  const heartbeatRef = useRef<NodeJS.Timeout | null>(null);
  const lastHeartbeatTime = useRef<number>(Date.now());
  const roomRef = useRef<GameRoom | null>(null);
  const playerRef = useRef<Player | null>(null);
  const isConnectedRef = useRef<boolean>(false);
  const maxReconnectAttempts = 5;

  // Heartbeat management
  const stopHeartbeat = useCallback(() => {
    stopHeartbeatUtil(heartbeatRef);
  }, []);

  const startHeartbeat = useCallback(
    (roomCode: string) => {
      const refs: HeartbeatRefs = {
        heartbeatRef,
        lastHeartbeatTime,
      };
      startHeartbeatUtil(roomCode, socket, refs);
    },
    [socket]
  );

  // Helper functions
  const handleRoomNotFound = useCallback(() => {
    stopHeartbeat();
    setRoom(null);
    setPlayer(null);
    router.push("/");
  }, [router, stopHeartbeat]);

  const handlePlayerRemoved = useCallback(() => {
    const roomCode = room?.code;
    stopHeartbeat();
    setRoom(null);
    setPlayer(null);
    if (roomCode) {
      router.push(`/?${roomCode}`);
    } else {
      router.push("/");
    }
  }, [room?.code, router, stopHeartbeat]);

  // Keep refs in sync with state
  useEffect(() => {
    roomRef.current = room;
  }, [room]);

  useEffect(() => {
    playerRef.current = player;
  }, [player]);

  useEffect(() => {
    isConnectedRef.current = isConnected;
  }, [isConnected]);

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

    // Setup socket event handlers
    const cleanup = setupSocketHandlers({
      socket: newSocket,
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
    });

    // Cleanup on unmount
    return () => {
      cleanup();
      newSocket.disconnect();
    };
  }, []); // Only run once on mount

  // Membership check when room changes or socket reconnects
  useEffect(() => {
    if (!room?.code || !socket?.connected) return;

    const membershipCheckInterval = setInterval(() => {
      if (socket?.connected && room?.code) {
        socket.emit("check_membership", { roomCode: room.code }, (res: any) => {
          if (!res.success || !res.inRoom) {
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

  // Room Operations
  const createRoom = useCallback(
    (playerName: string, callback?: (res: any) => void) => {
      createRoomUtil(
        playerName,
        {
          socket,
          room,
          setRoom,
          setPlayer,
          router,
          startHeartbeat,
        },
        callback
      );
    },
    [socket, room, router, startHeartbeat]
  );

  const joinRoom = useCallback(
    (roomCode: string, playerName: string, callback?: (res: any) => void) => {
      joinRoomUtil(
        roomCode,
        playerName,
        {
          socket,
          room,
          setRoom,
          setPlayer,
          router,
          startHeartbeat,
        },
        callback
      );
    },
    [socket, room, router, startHeartbeat]
  );

  const selectPack = useCallback(
    (packId: string) => {
      selectPackUtil(packId, {
        socket,
        room,
        setRoom,
        setPlayer,
        router,
        startHeartbeat,
      });
    },
    [socket, room, router, startHeartbeat]
  );

  const addCustomQuestion = useCallback(
    (question: string) => {
      addCustomQuestionUtil(question, {
        socket,
        room,
        setRoom,
        setPlayer,
        router,
        startHeartbeat,
      });
    },
    [socket, room, router, startHeartbeat]
  );

  const removeCustomQuestion = useCallback(
    (questionId: number) => {
      removeCustomQuestionUtil(questionId, {
        socket,
        room,
        setRoom,
        setPlayer,
        router,
        startHeartbeat,
      });
    },
    [socket, room, router, startHeartbeat]
  );

  // Game Operations
  const startGame = useCallback(
    (callback?: (res: any) => void) => {
      startGameUtil({ socket, room }, callback);
    },
    [socket, room]
  );

  const flipCard = useCallback(() => {
    flipCardUtil({ socket, room });
  }, [socket, room]);

  const nextQuestion = useCallback(() => {
    nextQuestionUtil({ socket, room });
  }, [socket, room]);

  const getCurrentTurnPlayer = useCallback((): Player | null => {
    return getCurrentTurnPlayerUtil(room);
  }, [room]);

  // Player Operations
  const kickPlayer = useCallback(
    (playerIdToKick: string) => {
      kickPlayerUtil(playerIdToKick, {
        socket,
        room,
        player,
        setRoom,
      });
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
