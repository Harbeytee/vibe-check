import { Pack } from "@/types/interface";
import { motion } from "framer-motion";

interface HeaderProps {
  selectedPack?: Pack;
  progress: number;
  answeredCount: number;
  totalQuestions: number;
}

export default function Header({
  selectedPack,
  progress,
  answeredCount,
  totalQuestions,
}: HeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center mb-6"
    >
      <div className="flex items-center justify-center gap-2 mb-2">
        <span className="text-2xl">{selectedPack?.icon}</span>
        <span className="font-display font-bold text-lg">
          {selectedPack?.name}
        </span>
      </div>

      {/* Progress Bar */}
      <div className="w-full max-w-md mx-auto h-2 bg-muted rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-primary to-accent"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>
      <p className="text-muted-foreground text-sm mt-2">
        Question {answeredCount} of {totalQuestions}
      </p>
    </motion.div>
  );
}
