import { AnimatePresence, motion } from "framer-motion";
import CardBack from "./card-back";
import CardFront from "./card-front";

interface CardSectionProps {
  isTransitioning: boolean;
  currentQuestion: string | null;
  currentQuestionIndex: number | null;
  isFlipped: boolean;
  handleFlip: () => void;
  packColor?: string;
}
export default function CardSection({
  isTransitioning,
  currentQuestion,
  currentQuestionIndex,
  isFlipped,
  handleFlip,
  packColor,
}: CardSectionProps) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center">
      <AnimatePresence mode="wait">
        {!isTransitioning && currentQuestion && (
          <motion.div
            key={currentQuestionIndex}
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
                animate={{ rotateY: isFlipped ? 180 : 0 }}
                transition={{
                  duration: 0.8,
                  ease: [0.175, 0.885, 0.32, 1.275],
                }}
                onClick={handleFlip}
              >
                {/*Front of the card */}
                <CardBack packColor={packColor} />

                {/* Card Front (Question) */}
                <CardFront currentQuestion={currentQuestion} />
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
