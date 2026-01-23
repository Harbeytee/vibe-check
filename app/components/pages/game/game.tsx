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

export default function Game() {
  const router = useRouter();
  const {
    room,
    getCurrentTurnPlayer,
    nextQuestion,
    flipCard,
    player,
    kickPlayer,
  } = useGame();

  const { code } = useParams();

  const currentTurnPlayer = getCurrentTurnPlayer();

  useEffect(() => {
    if (room) {
      if (!room.isStarted) {
        router.push(`/lobby/${room.code}`);
      } else if (!room.players.find((user) => user.id == player?.id)) {
        router.push(`/?${code}`);
      }
    } else {
      router.push(`/${code ? `?${code}` : ""}`);
    }
  }, [room, router]);

  // Verify room on mount
  // useRoomVerification();

  if (!room) return null;

  const selectedPack = gamePacks.find((p) => p.id === room.selectedPack);

  const answeredCount = room.answeredQuestions.length;
  const progress = ((answeredCount + 1) / room.totalQuestions) * 100;

  // Safety check: ensure currentPlayerIndex is within bounds
  const currentPlayer = room.players[room.currentPlayerIndex];
  const canFlip = player?.id === currentPlayer?.id;

  const handleFlip = () => {
    // Only the current player should be allowed to flip the card
    if (!canFlip) return;

    if (!room.isFlipped) {
      flipCard();
      //   socket?.emit("flip_card", { roomCode: room.code });
    }
  };

  const handleNext = () => {
    // Only the host should be allowed to click next
    if (!canFlip) return;

    // We just call the function, the server handles the
    // timing of isTransitioning and isFlipped
    nextQuestion();
  };

  // Game Finished Screen
  if (room.isFinished) {
    return (
      <FinishedGame
        players={room.players}
        currentPlayer={player}
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
          currentPlayer={player}
          currentTurnIndex={room.currentPlayerIndex}
          showTurn
          showKickButton
          onKick={kickPlayer}
        />
      </motion.div>
    </div>
  );
}
