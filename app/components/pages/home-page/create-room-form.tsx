import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Input } from "../../ui/input";
import { Button } from "../../ui/button";
import { Dispatch, SetStateAction, useState } from "react";
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
  const { createRoom } = useGame();
  const [isCreating, setIsCreating] = useState(false);

  const handleCreate = () => {
    if (!playerName.trim()) {
      setError("Please enter your name");
      return;
    }
    setIsCreating(true);
    createRoom(playerName.trim(), (res: any) => {
      // Reset loading state if operation failed
      if (!res.success) {
        setIsCreating(false);
      }
    });
  };

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
