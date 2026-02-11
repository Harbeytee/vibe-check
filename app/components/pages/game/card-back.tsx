import { motion } from "framer-motion";
import { Activity } from "lucide-react";

const CardBack = ({
  canFlip,
  currentPlayer,
}: {
  canFlip: boolean;
  currentPlayer: string;
}) => {
  return (
    <motion.div
      className={`absolute z-[0] inset-0 border-primary border border-[hsla(24,85%,60%,0.3)] rounded-3xl bg-gradient-to-br ${""} shadow-2xl flex flex-col items-center justify-center p-8`}
      style={{
        backfaceVisibility: "hidden",
        WebkitBackfaceVisibility: "hidden",
      }}
    >
      {/* Shared CSS Variables & Typography Classes */}
      <style>{`
        // :root {
        //   --primary: 24 85% 60%;
        //   --accent: 340 70% 60%;
        //   --text-muted: #f5f5f5;
        // }
        
      `}</style>

      {/* Visual Accents - Dot Grid */}
      <div
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(circle, white 1px, transparent 1px)",
          backgroundSize: "20px 20px",
        }}
      />

      {/* Scanning Animation Line */}
      {/* <motion.div
        animate={{ y: [-500, 500] }}
        transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
        className="absolute inset-x-0 h-[2px] bg-[hsl(var(--primary))] opacity-30 blur-sm z-0"
      /> */}

      {/* Breathing Ring */}
      <motion.div
        animate={{ scale: [1, 1.15, 1], opacity: [0.05, 0.2, 0.05] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="absolute  w-72 h-72 border border-[hsl(var(--primary))] rounded-full z-0"
      />

      {/* Main Branding Content */}
      <div className="relative z-10 flex flex-col items-center w-full">
        {/* Floating Icon with Glow */}
        <motion.div
          animate={{ y: [0, -12, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          className="mb-8 bg-white/5 p-6 rounded-[2.5rem] backdrop-blur-xl border border-white/10 shadow-xl"
        >
          <Activity size={56} style={{ color: "hsl(var(--primary))" }} />
        </motion.div>

        {/* Un-collapsed Typography with Gradient */}
        <h2 className="font-black text-4xl tracking-tighter uppercase italic text-center leading-none w-full">
          <span className="gradient-text drop-shadow-[0_0_15px_hsla(var(--primary),0.2)] whitespace-nowrap">
            Vibe Check
          </span>
        </h2>
      </div>

      {/* Footer Branding & Interaction Hint */}
      <div className="absolute bottom-10 z-20 flex flex-col items-center gap-3">
        <p
          className="text-[10px] font-bold tracking-[0.4em] uppercase animate-pulse"
          style={{ color: "var(--text-muted)" }}
        >
          {canFlip ? "Tap to reveal" : `${currentPlayer} is revealing...`}
        </p>

        <div className="flex gap-1.5">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
              className="w-1.5 h-1.5 rounded-full"
              style={{ backgroundColor: "hsl(var(--primary))" }}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default CardBack;
