"use client";
import { gamePacks } from "@/data/packs";
import { motion } from "framer-motion";
import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import PlayerList from "../lobby/player-list";
import FinishedGame from "./finished-game";
import { useGame } from "@/context/game-context";
import NextButton from "./next-button";
import CardSection from "./card-section";
import Header from "./header";
import TurnIndicator from "./turn-indicator";
import { Toast } from "@/context/toast-context";

export default function Game() {
  const router = useRouter();
  const { room, getCurrentTurnPlayer, nextQuestion, flipCard, player } =
    useGame();

  const { code } = useParams();

  const currentTurnPlayer = getCurrentTurnPlayer();

  useEffect(() => {
    if (room) {
      if (!room.isStarted) {
        router.push(`/lobby/${room.code}`);
      } else if (!room.players.find((user) => user.id == player?.id)) {
        Toast.error("Removed from room");
        router.push(`/?${code}`);
      }
    } else {
      router.push(`/${code ? `?${code}` : ""}`);
    }
  }, [room, player, router, code]);

  if (!room) return null;

  // Check if player is still in the room - if not, let useEffect redirect
  const isPlayerInRoom = room.players.some((user) => user.id === player?.id);
  if (!isPlayerInRoom) {
    return null;
  }

  // Check if currentPlayerIndex is valid - if not, player likely removed
  const currentPlayerAtIndex = room.players[room.currentPlayerIndex];
  if (!currentPlayerAtIndex) {
    // Current player index points to a removed player, redirect
    return null;
  }

  const selectedPack = gamePacks.find((p) => p.id === room.selectedPack);

  const answeredCount = room.answeredQuestions.length;
  const progress = ((answeredCount + 1) / room.totalQuestions) * 100;

  const canFlip = player?.id === currentPlayerAtIndex.id;

  const handleFlip = () => {
    // Only the current player should be allowed to flip the card
    if (!canFlip) return;

    if (!room.isFlipped) {
      flipCard();
    }
  };

  const handleNext = () => {
    // Only the host should be allowed to click next
    if (!canFlip) return;

    nextQuestion();
  };

  // Game Finished Screen
  if (room.isFinished) {
    return (
      <FinishedGame
        players={room.players}
        totalQuestions={room.totalQuestions}
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
        totalQuestions={room.totalQuestions}
      />

      <TurnIndicator canFlip={canFlip} currentTurnPlayer={currentTurnPlayer} />

      <CardSection handleFlip={handleFlip} canFlip={canFlip} room={room} />

      {room.isFlipped && canFlip && <NextButton handleNext={handleNext} />}

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
