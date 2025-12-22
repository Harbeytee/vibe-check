"use client";
import { gamePacks } from "@/data/packs";
import { motion } from "framer-motion";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
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

    socket,
    player,
  } = useGame();

  const { code } = useParams();

  useEffect(() => {
    if (room) {
      if (!room.isStarted) {
        router.push(`/lobby/${room.code}`);
      }
    } else {
      if (code) {
        router.push(`/?${code}`);
      } else router.push(`/?${code}`);
    }
  }, [room, router]);

  if (!room) return null;

  const currentTurnPlayer = getCurrentTurnPlayer();
  const selectedPack = gamePacks.find((p) => p.id === room.selectedPack);

  const answeredCount = room.answeredQuestions.length;
  const progress = ((answeredCount + 1) / room.totalQuestions) * 100;
  console.log(currentTurnPlayer);

  // const handleFlip = () => {
  //   if (!isFlipped) {
  //     setIsFlipped(true);
  //   }
  // };

  // const handleNext = () => {
  //   setIsTransitioning(true);
  //   setIsFlipped(false);

  //   setTimeout(() => {
  //     nextQuestion();
  //     setIsTransitioning(false);
  //   }, 400);
  // }

  const canFlip = player?.id == room.players[room.currentPlayerIndex].id;

  const handleFlip = () => {
    // Only the current player should be allowed to flip the card
    if (!canFlip) return;

    if (!room.isFlipped) {
      socket?.emit("flip_card", { roomCode: room.code });
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
