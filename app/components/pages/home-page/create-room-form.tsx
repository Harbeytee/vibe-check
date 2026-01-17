import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Input } from "../../ui/input";
import { Button } from "../../ui/button";
import { Dispatch, SetStateAction, useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Mode } from "@/types/types";
import { useGame } from "@/context/game-context";

export default function CreateRoomForm({
  mode,
  setMode,
}: {
  mode: Mode;
  setMode: Dispatch<SetStateAction<Mode>>;
}) {
  const router = useRouter();
  const [playerName, setPlayerName] = useState("");
  const [error, setError] = useState("");
  const { createRoom, room } = useGame();
  const [isCreating, setIsCreating] = useState(false);
  const createTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleCreate = () => {
    setIsCreating(true);
    if (!playerName.trim()) {
      setError("Please enter your name");
      setIsCreating(false);
      return;
    }

    // Clear any existing timeout
    if (createTimeoutRef.current) {
      clearTimeout(createTimeoutRef.current);
    }

    // Set timeout to reset loading state if create fails (after 10 seconds)
    createTimeoutRef.current = setTimeout(() => {
      setIsCreating(false);
    }, 10000);

    createRoom(playerName.trim());
  };

  // Reset loading state when room is successfully created (room becomes non-null)
  useEffect(() => {
    if (room && isCreating) {
      if (createTimeoutRef.current) {
        clearTimeout(createTimeoutRef.current);
        createTimeoutRef.current = null;
      }
      setIsCreating(false);
    }
  }, [room, isCreating]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (createTimeoutRef.current) {
        clearTimeout(createTimeoutRef.current);
      }
    };
  }, []);

  if (mode === "create")
    return (
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="space-y-4"
      >
        <h2 className="font-display font-bold text-2xl mb-6">Create a Room</h2>
        <Input
          placeholder="Enter your name"
          value={playerName}
          onChange={(e) => {
            setPlayerName(e.target.value);
            setError("");
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !isCreating) {
              handleCreate();
            }
          }}
          autoFocus
        />
        {error && <p className="text-destructive text-sm">{error}</p>}
        <div className="flex gap-3">
          <Button
            variant="ghost"
            onClick={() => {
              setMode("select");
              setError("");
              router.push("/");
            }}
          >
            Back
          </Button>
          <Button variant="glow" className="flex-1" onClick={handleCreate}>
            {isCreating ? (
              "Creating..."
            ) : (
              <>
                Create Room <ArrowRight className="w-4 h-4 ml-2" />
              </>
            )}
          </Button>
        </div>
      </motion.div>
    );
}
