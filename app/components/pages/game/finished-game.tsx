import { motion } from "framer-motion";
import PlayerList from "../lobby/player-list";
import { Button } from "@/components/ui/button";
import { Home, RotateCcw } from "lucide-react";
import { useRouter } from "next/navigation";
import { Player } from "@/types/interface";

export default function FinishedGame({
  players,
  totalQuestions,
}: {
  players: Player[];
  totalQuestions: number;
}) {
  const router = useRouter();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center max-w-lg"
      >
        <motion.span
          className="text-8xl block mb-6"
          animate={{ rotate: [0, 10, -10, 0] }}
          transition={{ duration: 0.5, repeat: 3 }}
        >
          🎉
        </motion.span>
        <h1 className="font-display font-extrabold text-4xl md:text-5xl gradient-text mb-4">
          Game Over!
        </h1>
        <p className="text-muted-foreground text-lg mb-8">
          You answered all {totalQuestions} questions!
        </p>

        <PlayerList players={players} />

        <div className="flex flex-col sm:flex-row gap-4">
          <Button
            variant="outline"
            size="lg"
            className="flex-1 p-2"
            onClick={() => router.push("/")}
          >
            <Home className="w-4 h-4 mr-2" />
            Home
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
