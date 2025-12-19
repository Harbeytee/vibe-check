import { cn } from "@/lib/utils";
import { Player } from "@/types/interface";
import { motion } from "framer-motion";

interface PlayerListProps {
  players: Player[];
  currentTurnIndex?: number;
  showTurn?: boolean;
}

export default function PlayerList({
  players,
  currentTurnIndex,
  showTurn = false,
}: PlayerListProps) {
  const colors = [
    "bg-gradient-to-br from-orange-400 to-amber-500",
    "bg-gradient-to-br from-pink-400 to-rose-500",
    "bg-gradient-to-br from-emerald-400 to-teal-500",
    "bg-gradient-to-br from-blue-400 to-indigo-500",
    "bg-gradient-to-br from-purple-400 to-violet-500",
    "bg-gradient-to-br from-cyan-400 to-sky-500",
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="glass-effect rounded-2xl p-6 mb-6"
    >
      <h2 className="font-display font-bold text-lg mb-4 text-center">
        Players ({players.length})
      </h2>
      <div className="flex flex-wrap gap-3 justify-center">
        {players.map((player, index) => (
          <motion.div
            key={player.id}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            className={cn(
              "flex items-center gap-3 px-4 py-2 rounded-full border-2 transition-all duration-300",
              showTurn && currentTurnIndex === index
                ? "border-primary bg-primary/20 shadow-lg shadow-primary/20"
                : "border-border bg-card/50"
            )}
          >
            <div
              className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white",
                colors[index % colors.length]
              )}
            >
              {player.name.charAt(0).toUpperCase()}
            </div>
            <span className="font-medium text-foreground">
              {player.name}
              {player.isHost && (
                <span className="ml-2 text-xs text-primary">👑</span>
              )}
            </span>
            {showTurn && currentTurnIndex === index && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded-full"
              >
                Turn
              </motion.span>
            )}
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
