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
      const scannedValue = result[0].rawValue.trim();
      let code: string | null = null;

      try {
        if (scannedValue.includes("?")) {
          const url = new URL(scannedValue);
          const params = url.searchParams;
          code = params.get("code") ?? params.keys().next().value ?? null;
        } else {
          code = scannedValue;
        }
      } catch {
        code = scannedValue;
      }

      if (code) {
        setRoomCode(code.toUpperCase());
        setScanning(false);
        setJoinMethod("code");
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
