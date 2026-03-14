"use client";

import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Player } from "@/types/interface";
import { motion } from "framer-motion";
import { User, X } from "lucide-react";

interface PlayerListProps {
  players: Player[];
  currentPlayer: Player | null;
  currentTurnIndex?: number;
  showTurn?: boolean;
  onKick?: (playerId: string) => void;
  showKickButton?: boolean;
}

export default function PlayerList({
  players,
  currentPlayer,
  currentTurnIndex,
  showTurn = false,
  onKick,
  showKickButton = false,
}: PlayerListProps) {
  const colors = [
    "bg-gradient-to-br from-orange-400 to-amber-500",
    "bg-gradient-to-br from-pink-400 to-rose-500",
    "bg-gradient-to-br from-emerald-400 to-teal-500",
    "bg-gradient-to-br from-blue-400 to-indigo-500",
    "bg-gradient-to-br from-purple-400 to-violet-500",
    "bg-gradient-to-br from-cyan-400 to-sky-500",
  ];

  const isCurrentPlayer = (player: Player) => player.id === currentPlayer?.id;

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
              "flex items-center gap-3 px-4 py-2 rounded-full border-2 transition-all duration-300 relative group overflow-visible",
              showTurn && currentTurnIndex === index
                ? "border-primary bg-primary/20 shadow-lg shadow-primary/20"
                : isCurrentPlayer(player)
                ? "border-primary/50 bg-primary/10"
                : "border-border bg-card/50"
            )}
          >
            <div
              className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white relative",
                colors[index % colors.length]
              )}
            >
              {player.name.charAt(0).toUpperCase()}
              {isCurrentPlayer(player) && (
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-primary rounded-full flex items-center justify-center border-2 border-background">
                  <User className="w-2.5 h-2.5 text-primary-foreground" />
                </div>
              )}
            </div>
            <div className="flex flex-col">
              <span className="font-medium text-foreground flex items-center gap-1">
                {player.name}
                {player.isHost && (
                  <span className="text-xs text-primary">👑</span>
                )}
              </span>
              {isCurrentPlayer(player) && (
                <span className="text-xs text-primary font-medium">You</span>
              )}
            </div>
            {showTurn && currentTurnIndex === index && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded-full"
              >
                Turn
              </motion.span>
            )}

            {/* Kick - only for host, not for the host themselves. */}
            {showKickButton &&
              !player.isHost &&
              onKick &&
              currentPlayer?.isHost && (
                <Popover>
                  <PopoverTrigger asChild>
                    <button
                      type="button"
                      className="ml-2 text-xs cursor-pointer text-muted-foreground z-50 opacity-60 hover:opacity-100 focus:opacity-100 focus:outline-none p-1 -m-1 rounded"
                      aria-label={`Options for ${player.name}`}
                    >
                      •••
                    </button>
                  </PopoverTrigger>
                  <PopoverContent
                    className="w-auto p-2"
                    align="end"
                    sideOffset={6}
                    onOpenAutoFocus={(e) => e.preventDefault()}
                  >
                    <Button
                      variant="destructive"
                      size="sm"
                      className="w-full text-xs gap-1"
                      aria-label={`Remove ${player.name} from the game`}
                      onClick={(e) => {
                        e.stopPropagation();
                        onKick(String(player.id));
                      }}
                    >
                      <X className="w-3 h-3" aria-hidden="true" />
                      <span>Kick</span>
                    </Button>
                  </PopoverContent>
                </Popover>
              )}
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
