"use client";
import { gamePacks } from "@/data/packs";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import PlayerList from "../lobby/player-list";
import FinishedGame from "./finished-game";
import { useGame } from "@/context/game-context";
import ActionButtons from "./action-buttons";
import CardSection from "./card-section";
import Header from "./header";

export default function Game() {
  const router = useRouter();
  const {
    room,
    getCurrentQuestion,
    getCurrentTurnPlayer,
    nextQuestion,
    resetGame,
    getAllQuestions,
    answeredQuestions,
    currentQuestionIndex,
  } = useGame();
  const [isFlipped, setIsFlipped] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    if (!room || !room.isStarted) {
      router.push("/");
    }
  }, [room, router]);

  if (!room) return null;

  const currentQuestion = getCurrentQuestion();
  const currentTurnPlayer = getCurrentTurnPlayer();
  const selectedPack = gamePacks.find((p) => p.id === room.selectedPack);
  const totalQuestions = getAllQuestions().length;
  const answeredCount = answeredQuestions.length;
  const progress = ((answeredCount + 1) / totalQuestions) * 100;

  const handleFlip = () => {
    if (!isFlipped) {
      setIsFlipped(true);
    }
  };

  const handleNext = () => {
    setIsTransitioning(true);
    setIsFlipped(false);

    setTimeout(() => {
      nextQuestion();
      setIsTransitioning(false);
    }, 400);
  };

  const handlePlayAgain = () => {
    resetGame();
    router.push("/lobby");
  };

  // Game Finished Screen
  if (room.isFinished) {
    return (
      <FinishedGame
        handlePlayAgain={handlePlayAgain}
        players={room.players}
        totalQuestions={totalQuestions}
      />
    );
  }

  return (
    <div className="min-h-screen flex flex-col px-4 py-6">
      {/* Header */}
      <Header
        selectedPack={selectedPack}
        progress={progress}
        answeredCount={answeredCount}
        totalQuestions={totalQuestions}
      />

      {/* Current Turn Player */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center mb-6"
      >
        <p className="text-muted-foreground text-sm mb-2">It's your turn</p>
        <motion.div
          key={currentTurnPlayer?.id}
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-primary/20 border-2 border-primary"
        >
          <span className="text-2xl">👤</span>
          <span className="font-display font-bold text-xl text-primary">
            {currentTurnPlayer?.name}
          </span>
        </motion.div>
      </motion.div>

      <CardSection
        isTransitioning={isTransitioning}
        currentQuestion={currentQuestion}
        currentQuestionIndex={currentQuestionIndex}
        isFlipped={isFlipped}
        packColor={selectedPack?.color}
        handleFlip={handleFlip}
      />
      <ActionButtons isFlipped={isFlipped} handleNext={handleNext} />

      {/* Player Order */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="mt-8"
      >
        <p className="text-center text-muted-foreground text-xs mb-3">
          Turn Order
        </p>
        <PlayerList
          players={room.players}
          currentTurnIndex={room.currentPlayerIndex}
          showTurn
        />
      </motion.div>
    </div>
  );
}
