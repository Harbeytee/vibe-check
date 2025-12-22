import { AnimatePresence, motion } from "framer-motion";
import CardBack from "./card-back";
import CardFront from "./card-front";
import { GameRoom } from "@/types/interface";

interface CardSectionProps {
  room: GameRoom;
  handleFlip: () => void;
  canFlip: boolean;
}
export default function CardSection({
  room,
  handleFlip,
  canFlip,
}: CardSectionProps) {
  const currentPlayer = room.players[room.currentPlayerIndex]?.name;

  return (
    <div className="flex-1 flex flex-col items-center justify-center">
      <AnimatePresence mode="wait">
        {!room.isTransitioning && room.currentQuestion && (
          <motion.div
            key={room.currentQuestionIndex}
            initial={{ opacity: 0, scale: 0.9, rotateY: -10 }}
            animate={{ opacity: 1, scale: 1, rotateY: 0 }}
            exit={{ opacity: 0, scale: 0.9, x: 100 }}
            transition={{ duration: 0.4 }}
            className="w-full max-w-sm"
          >
            <div
              className="card-3d w-full max-w-md mx-auto"
              style={{ perspective: "1500px" }}
            >
              <motion.div
                className="relative w-full aspect-[3/4] cursor-pointer"
                style={{ transformStyle: "preserve-3d" }}
                animate={{ rotateY: room.isFlipped ? 180 : 0 }}
                transition={{
                  duration: 0.8,
                  ease: [0.175, 0.885, 0.32, 1.275],
                }}
                onClick={handleFlip}
              >
                {/*Front of the card */}
                <CardBack canFlip={canFlip} currentPlayer={currentPlayer} />

                {/* Card Front - contains que3stion*/}
                <CardFront
                  canFlip={canFlip}
                  currentQuestion={room.currentQuestion}
                />
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
