"use client";
import React, { useState } from "react";
import { motion } from "framer-motion";
import Title from "./title";
import { Mode } from "@/types/types";
import ModeSelection from "./mode-selection";
import CreateRoomForm from "./create-room-form";
import JoinRoomForm from "./join-room-form";
import { useSearchParams } from "next/navigation";

const HomePage: React.FC = () => {
  const searchParams = useSearchParams();
  const roomCode = searchParams.keys().next().value;

  const [mode, setMode] = useState<Mode>(roomCode ? "join" : "select");

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12">
      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-accent/10 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 text-center max-w-lg w-full"
      >
        <Title />
        <ModeSelection mode={mode} setMode={setMode} />
        <CreateRoomForm mode={mode} setMode={setMode} />
        <JoinRoomForm mode={mode} setMode={setMode} />

        {/* Footer */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-12 text-muted-foreground/60 text-sm"
        >
          Play with friends, family, or lovers
        </motion.p>
      </motion.div>
    </div>
  );
};

export default HomePage;
