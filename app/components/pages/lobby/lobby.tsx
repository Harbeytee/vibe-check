"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useGame } from "@/context/game-context";
import PackSelector from "./pack-selector";
import PlayerList from "./player-list";
import CustomQuestions from "./custom-questions";
import { Play, Settings } from "lucide-react";
// import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import Header from "./header";
import InvitePlayers from "./invite-players";

export default function Lobby() {
  const router = useRouter();
  const {
    room,
    currentPlayer,
    selectPack,
    addCustomQuestion,
    removeCustomQuestion,
    startGame,
    getAllQuestions,
  } = useGame();

  const [showCustom, setShowCustom] = useState(false);

  useEffect(() => {
    if (!room) {
      router.push("/");
    }
  }, [room, router]);

  if (!room) return null;

  const isHost = currentPlayer?.isHost;
  const canStart = room.selectedPack && room.players.length >= 1;

  const handleStart = () => {
    if (canStart) {
      startGame();
      router.push("/game");
    }
  };

  return (
    <div className="min-h-screen px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <Header />

        {/* invite players section */}
        <InvitePlayers roomCode={room.code} />

        {/* players section */}
        <PlayerList players={room.players} />

        {/* Pack Selection - Host Only */}

        <PackSelector
          isHost={isHost}
          selectedPack={room.selectedPack}
          onSelect={selectPack}
        />

        {/* Custom Questions Toggle */}
        {isHost && room.selectedPack && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mb-6"
          >
            <Button
              variant="glass"
              className="w-full mb-4"
              onClick={() => setShowCustom(!showCustom)}
            >
              <Settings className="w-4 h-4 mr-2" />
              {showCustom ? "Hide" : "Add"} Custom Questions
            </Button>

            {showCustom && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="glass-effect rounded-2xl p-6"
              >
                <CustomQuestions
                  questions={room.customQuestions}
                  onAdd={addCustomQuestion}
                  onRemove={removeCustomQuestion}
                />
              </motion.div>
            )}
          </motion.div>
        )}

        {/* Start Button - Host Only */}
        {isHost && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Button
              variant="glow"
              size="xl"
              className="w-full"
              onClick={handleStart}
              disabled={!canStart}
            >
              <Play className="w-5 h-5 mr-2" />
              Start Game
            </Button>
            {!canStart && (
              <p className="text-center text-muted-foreground text-sm mt-2">
                {!room.selectedPack
                  ? "Select a pack to start"
                  : "Waiting for more players..."}
              </p>
            )}
          </motion.div>
        )}

        {/* Waiting message for non-hosts */}
        {!isHost && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-center"
          >
            <div className="flex items-center justify-center gap-2 text-muted-foreground">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              >
                ⏳
              </motion.div>
              <span>Waiting for host to start the game...</span>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
