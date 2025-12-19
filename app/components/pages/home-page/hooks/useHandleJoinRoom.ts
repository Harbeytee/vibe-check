import { useGame } from "@/context/game-context";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function useHandleJoinRoom() {
  const router = useRouter();
  const { joinRoom } = useGame();
  const [error, setError] = useState("");
  const [scanning, setScanning] = useState(false);
  const [joinMethod, setJoinMethod] = useState<"code" | "scan">("code");
  const [playerName, setPlayerName] = useState("");
  const [roomCode, setRoomCode] = useState("");

  const handleJoin = (code?: string) => {
    const codeToUse = code || roomCode;
    if (!playerName.trim()) {
      setError("Please enter your name");
      return;
    }
    if (!codeToUse.trim()) {
      setError("Please enter a room code");
      return;
    }
    const success = joinRoom(codeToUse.trim(), playerName.trim());
    if (success) {
      router.push("/lobby");
    } else {
      setError("Room not found or game already started");
    }
  };

  const handleScan = (result: any) => {
    if (result && result[0]?.rawValue) {
      const scannedValue = result[0].rawValue;
      // Extract room code from URL or use directly
      let code = scannedValue;
      if (scannedValue.includes("/join/")) {
        code = scannedValue.split("/join/").pop() || "";
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
  };
}
