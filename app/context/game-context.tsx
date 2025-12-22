"use client";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { io, Socket } from "socket.io-client";
import { useRouter } from "next/navigation";
import { GameRoom, Player, GameContextType } from "@/types/interface";

const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider = ({ children }: { children: ReactNode }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [room, setRoom] = useState<GameRoom | null>(null);
  const [player, setPlayer] = useState<Player | null>(null);
  const router = useRouter();

  useEffect(() => {
    const newSocket = io(
      process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:4000"
    );
    setSocket(newSocket);

    // --- LISTENERS ---

    newSocket.on("room_updated", (updatedRoom: any /*GameRoom*/) => {
      setRoom(updatedRoom);
      const myData = updatedRoom.players.find(
        (p: any) => p.id === newSocket.id
      );
      if (myData) setPlayer(myData);
    });

    // Native Alert for Host Migration
    newSocket.on("new_host_toast", ({ name }: { name: string }) => {
      alert(`${name} is now the host!`);
    });

    // Native Alert for Errors (The logic we added to the backend)
    newSocket.on("error", (data: { message: string }) => {
      alert(`Error: ${data.message}`);
    });

    // Native Alert for Room Deletion / Game Over
    newSocket.on("room_deleted", (data: { message: string }) => {
      alert(data.message);
      setRoom(null);
      router.push("/");
    });

    newSocket.on("game_started", (startedRoom: GameRoom) => {
      setRoom(startedRoom);
      router.push(`/game/${room?.code}`);
    });

    return () => {
      newSocket.off("room_updated");
      newSocket.off("new_host_toast");
      newSocket.off("error");
      newSocket.off("room_deleted");
      newSocket.off("game_started");
      newSocket.disconnect();
    };
  }, [router]);

  // --- ACTIONS ---

  const createRoom = (playerName: string) => {
    if (!socket?.connected) return alert("You are offline. Please wait.");

    socket.emit("create_room", { playerName }, (res: any) => {
      if (res.success) {
        setRoom(res.room);
        setPlayer(res.player);
        console.log("success");
        router.push(`/lobby/${res.room.code}`);
      } else {
        alert(res.message);
      }
    });
  };

  const joinRoom = (roomCode: string, playerName: string) => {
    if (!socket?.connected) return alert("Trying to reconnect...");

    socket.emit("join_room", { roomCode, playerName }, (res: any) => {
      if (res.success) {
        setRoom(res.room);
        setPlayer(res.player);
        router.push(`/lobby/${res.room.code}`);
      } else {
        alert(res.message);
      }
    });
  };

  const selectPack = (packId: string) => {
    socket?.emit("select_pack", { roomCode: room?.code, packId });
  };

  const startGame = (callback: (res: any) => void) => {
    socket?.emit("start_game", { roomCode: room?.code }, callback);
  };

  const nextQuestion = () => {
    socket?.emit("next_question", { roomCode: room?.code });
  };

  // const resetGame = () => {
  //   socket?.emit("reset_game", { roomCode: room?.code });
  // };

  const addCustomQuestion = (question: string) => {
    socket?.emit("add_custom_questio", { roomCode: room?.code, question });
  };

  const removeCustomQuestion = (questionId: number) => {
    socket?.emit("delete_custom_question", {
      roomCode: room?.code,
      questionId,
    });
  };

  const getCurrentTurnPlayer = (): Player | null => {
    if (!room) return null;
    return room.players[room.currentPlayerIndex] || null;
  };

  return (
    <GameContext.Provider
      value={{
        currentPlayer: getCurrentTurnPlayer(),
        createRoom,
        joinRoom,
        selectPack,
        addCustomQuestion,
        removeCustomQuestion,
        startGame,
        nextQuestion,

        getCurrentTurnPlayer,
        room,
        socket,
        player,
      }}
    >
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) throw new Error("useGame error");
  return context;
};
