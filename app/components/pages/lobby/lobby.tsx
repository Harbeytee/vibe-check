"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useGame } from "@/context/game-context";
import PackSelector from "./pack-selector";
import PlayerList from "./player-list";
import CustomQuestions from "./custom-questions";
import { Play, Settings } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import Header from "./header";
import InvitePlayers from "./invite-players";
import { Toast } from "@/context/toast-context";

export default function Lobby() {
  const router = useRouter();
  const { code } = useParams();
  const [isStarting, setIsStarting] = useState(false);
  const {
    room,
    selectPack,
    addCustomQuestion,
    removeCustomQuestion,
    startGame,
    player,
  } = useGame();

  const [showCustom, setShowCustom] = useState(false);

  useEffect(() => {
    if (room) {
      if (room.isStarted) {
        router.push(`/game/${room.code}`);
      } else if (!room.players.find((user) => user.id == player?.id)) {
        Toast.error("Removed from room");
        router.push(`/?${code}`);
      }
    } else {
      router.push(`/${code ? `?${code}` : ""}`);
    }
  }, [room, router, player, code]);

  if (!room) return null;

  const isHost = player?.isHost;

  const canStart = room.selectedPack && room.players.length >= 2;

  const handleStart = () => {
    if (!canStart) {
      Toast.error("Make sure you have at least 2 players and a pack selected!");
    }
    setIsStarting(true);
    startGame((res: any) => {
      // This logic only runs for the Host who clicked
      if (!res.success) {
        Toast.error(res.message);
        setIsStarting(false);
      }
    });
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
              disabled={!canStart || isStarting}
            >
              <Play className="w-5 h-5 mr-2" />
              {isStarting ? "Starting..." : "Start Game"}
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
