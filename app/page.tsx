"use client";
import React, { useState } from "react";
import { motion } from "framer-motion";
import Title from "./components/home-page/title";
import { Mode } from "./types/types";
import ModeSelection from "./components/home-page/mode-selection";
import CreateRoomForm from "./components/home-page/create-room-form";
import JoinRoomForm from "./components/home-page/join-room-form";

const HomePage: React.FC = () => {
  const [mode, setMode] = useState<Mode>("select");

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12">
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
