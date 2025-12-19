import { gamePacks } from "@/data/packs";
import { cn } from "@/lib/utils";
import { PackType } from "@/types/interface";
import { motion } from "framer-motion";

interface PackSelectorProps {
  selectedPack: PackType | null;
  onSelect: (packId: PackType) => void;
  isHost?: boolean;
}

export default function PackSelector({
  selectedPack,
  onSelect,
  isHost,
}: PackSelectorProps) {
  if (isHost)
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="glass-effect rounded-2xl p-6 mb-6"
      >
        <h2 className="font-display font-bold text-lg mb-4 text-center">
          Choose a Pack
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {gamePacks.map((pack, index) => (
            <motion.button
              key={pack.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => onSelect(pack.id)}
              className={cn(
                "relative p-4 rounded-2xl border-2 transition-all duration-300 text-left overflow-hidden group",
                selectedPack === pack.id
                  ? "border-primary bg-primary/10 shadow-lg shadow-primary/20"
                  : "border-border bg-card/50 hover:border-primary/50 "
              )}
            >
              <div
                className={cn(
                  "absolute inset-0 bg-gradient-to-br opacity-10 transition-opacity group-hover:opacity-20",
                  pack.color
                )}
              />
              <div className="relative z-10">
                <span className="text-4xl mb-2 block">{pack.icon}</span>
                <h3 className="font-display font-bold text-foreground text-lg mb-1">
                  {pack.name}
                </h3>
                <p className="text-muted-foreground text-sm">
                  {pack.description}
                </p>
                <p className="text-xs text-muted-foreground/70 mt-2">
                  {pack.questions.length} questions
                </p>
              </div>
              {selectedPack === pack.id && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute top-2 right-2 w-6 h-6 bg-primary rounded-full flex items-center justify-center"
                >
                  <span className="text-primary-foreground text-sm">✓</span>
                </motion.div>
              )}
            </motion.button>
          ))}
        </div>
      </motion.div>
    );
  else if (selectedPack) {
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="glass-effect rounded-2xl p-6 mb-6 text-center"
    >
      <p className="text-muted-foreground mb-2">Selected Pack</p>
      <div className="flex items-center justify-center gap-2">
        <span className="text-3xl">
          {gamePacks.find((p) => p.id === selectedPack)?.icon}
        </span>
        <span className="font-display font-bold text-xl">
          {gamePacks.find((p) => p.id === selectedPack)?.name}
        </span>
      </div>
    </motion.div>;
  }
}
