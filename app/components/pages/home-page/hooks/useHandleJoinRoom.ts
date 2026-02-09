import { useGame } from "@/context/game-context";
import { Mode } from "@/types/types";
import { useRouter, useSearchParams } from "next/navigation";
import { Dispatch, SetStateAction, useState } from "react";

export default function useHandleJoinRoom(
  setMode: Dispatch<SetStateAction<Mode>>
) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const existingCode = searchParams.keys().next().value;
  const { joinRoom } = useGame();
  const [error, setError] = useState("");
  const [scanning, setScanning] = useState(false);
  const [joinMethod, setJoinMethod] = useState<"code" | "scan">("code");
  const [playerName, setPlayerName] = useState("");
  const [roomCode, setRoomCode] = useState(existingCode || "");
  const [isJoining, setIsJoining] = useState(false);

  const handleJoin = async (code?: string) => {
    const codeToUse = code || roomCode;
    if (!playerName.trim()) {
      setError("Please enter your name");
      return;
    }
    if (!codeToUse.trim()) {
      setError("Please enter a room code");
      return;
    }

    setIsJoining(true);
    joinRoom(codeToUse.trim(), playerName.trim(), (res) => {
      // Reset loading state if operation failed
      if (!res.success) {
        setIsJoining(false);
      }
    });
  };

  const handleScan = (result: { rawValue: string }[] | undefined) => {
    if (result?.[0]?.rawValue) {
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
