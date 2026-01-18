import { useGame } from "@/context/game-context";
import { Mode } from "@/types/types";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Dispatch,
  SetStateAction,
  useState,
  useEffect,
  useRef,
  useCallback,
} from "react";

export default function useHandleJoinRoom(
  setMode: Dispatch<SetStateAction<Mode>>
) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const existingCode = searchParams.keys().next().value;
  const { joinRoom, room, socket, onOperationError } = useGame();
  const [error, setError] = useState("");
  const [scanning, setScanning] = useState(false);
  const [joinMethod, setJoinMethod] = useState<"code" | "scan">("code");
  const [playerName, setPlayerName] = useState("");
  const [roomCode, setRoomCode] = useState(existingCode || "");
  const [isJoining, setIsJoining] = useState(false);
  const joinTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isJoiningRef = useRef(false);

  const handleJoin = async (code?: string) => {
    setIsJoining(true);
    isJoiningRef.current = true;
    const codeToUse = code || roomCode;
    if (!playerName.trim()) {
      setError("Please enter your name");
      setIsJoining(false);
      isJoiningRef.current = false;
      return;
    }
    if (!codeToUse.trim()) {
      setError("Please enter a room code");
      setIsJoining(false);
      isJoiningRef.current = false;
      return;
    }

    // Clear any existing timeout
    if (joinTimeoutRef.current) {
      clearTimeout(joinTimeoutRef.current);
    }

    // Set timeout to reset loading state if join fails (after 10 seconds)
    joinTimeoutRef.current = setTimeout(() => {
      setIsJoining(false);
      isJoiningRef.current = false;
    }, 10000);

    joinRoom(codeToUse.trim(), playerName.trim());
  };

  const resetJoining = useCallback(() => {
    if (joinTimeoutRef.current) {
      clearTimeout(joinTimeoutRef.current);
      joinTimeoutRef.current = null;
    }
    setIsJoining(false);
    isJoiningRef.current = false;
  }, []);

  // Reset loading state when room is successfully joined (room becomes non-null)
  useEffect(() => {
    if (room && isJoining) {
      resetJoining();
    }
  }, [room, isJoining, resetJoining]);

  // Listen for operation errors (callback failures) to reset loading state
  useEffect(() => {
    const unsubscribe = onOperationError(() => {
      if (isJoiningRef.current) {
        resetJoining();
      }
    });

    return unsubscribe;
  }, [onOperationError, resetJoining]);

  // Listen for socket errors to reset loading state
  useEffect(() => {
    if (!socket) return;

    const handleError = (data: { message: string }) => {
      if (isJoiningRef.current) {
        resetJoining();
      }
    };

    const handleRoomNotFound = ({ roomCode }: { roomCode?: string }) => {
      if (isJoiningRef.current) {
        resetJoining();
      }
    };

    const handleRoomDeleted = () => {
      if (isJoiningRef.current) {
        resetJoining();
      }
    };

    socket.on("error", handleError);
    socket.on("room_not_found", handleRoomNotFound);
    socket.on("room_deleted", handleRoomDeleted);

    return () => {
      socket.off("error", handleError);
      socket.off("room_not_found", handleRoomNotFound);
      socket.off("room_deleted", handleRoomDeleted);
    };
  }, [socket, resetJoining]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (joinTimeoutRef.current) {
        clearTimeout(joinTimeoutRef.current);
      }
    };
  }, []);

  const handleScan = (result: any) => {
    if (result && result[0]?.rawValue) {
      const scannedValue = result[0].rawValue;
      // Extract room code from URL or use directly
      let code = scannedValue;
      if (scannedValue.includes("/lobby/")) {
        code = scannedValue.split("/lobby/").pop() || "";
      }
      if (code) {
        setRoomCode(code.toUpperCase());
        setScanning(false);
        setJoinMethod("code");
        // Auto-join if name is already entered
        if (playerName.trim()) {
          handleJoin(code.toUpperCase());
        }
      }
    }
  };

  const goBack = () => {
    setMode("select");
    setError("");
    setScanning(false);
    setJoinMethod("code");
    router.push("/");
  };

  return {
    handleScan,
    scanning,
    setError,
    setRoomCode,
    joinMethod,
    playerName,
    setPlayerName,
    error,
    setJoinMethod,
    setScanning,
    roomCode,
    handleJoin,
    goBack,
    isJoining,
  };
}
