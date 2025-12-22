import { capitalize } from "@/lib/utils";
import { Player } from "@/types/interface";
import { motion } from "framer-motion";

export default function TurnIndicator({
  canFlip,
  currentTurnPlayer,
}: {
  canFlip: boolean;
  currentTurnPlayer: Player | null;
}) {
  const isMyTurn = canFlip;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center mb-6"
    >
      {/* Status text */}
      <motion.p
        className={`text-sm ${isMyTurn ? "" : "mb-3"} font-medium ${
          isMyTurn ? "text-primary" : "text-muted-foreground"
        }`}
        animate={{ scale: isMyTurn ? [1, 1.05, 1] : 1 }}
        transition={{ duration: 0.3 }}
      >
        {isMyTurn
          ? `It's your turn, ${capitalize(currentTurnPlayer?.name)}!`
          : "Waiting for..."}
      </motion.p>

      {/* Player indicator */}
      {!isMyTurn && (
        <motion.div
          key={`other-turn-${currentTurnPlayer?.id}`}
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-muted/50 border border-border"
        >
          <motion.div
            className="flex gap-1"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground" />
            <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground animation-delay-200" />
            <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground animation-delay-400" />
          </motion.div>
          <span className="text-xl opacity-60">👤</span>
          <span className="font-medium text-lg text-muted-foreground">
            {capitalize(currentTurnPlayer?.name)}
          </span>
        </motion.div>
      )}
    </motion.div>
  );
}
