// import { motion } from "framer-motion";

// export default function CardBack({ packColor }: { packColor?: string }) {
//   return (
//     <div
//       className={`absolute inset-0 rounded-3xl bg-gradient-to-br ${packColor} shadow-2xl flex flex-col items-center justify-center p-8`}
//       style={{
//         backfaceVisibility: "hidden",
//         WebkitBackfaceVisibility: "hidden",
//       }}
//     >
//       <div className="absolute inset-0 rounded-3xl pattern-dots opacity-20" />
//       <motion.div
//         className="relative z-10"
//         animate={{ scale: [1, 1.05, 1] }}
//         transition={{
//           duration: 2,
//           repeat: Infinity,
//           ease: "easeInOut",
//         }}
//       >
//         <span className="text-8xl">🃏</span>
//       </motion.div>
//       <p className="text-foreground/90 font-display font-bold text-xl mt-6 text-center">
//         Tap to reveal
//       </p>
//       <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-2">
//         {[...Array(3)].map((_, i) => (
//           <motion.div
//             key={i}
//             className="w-2 h-2 rounded-full bg-foreground/30"
//             animate={{ opacity: [0.3, 1, 0.3] }}
//             transition={{
//               duration: 1.5,
//               repeat: Infinity,
//               delay: i * 0.2,
//             }}
//           />
//         ))}
//       </div>
//     </div>
//   );
// }

import React from "react";
import { motion } from "framer-motion";
import { Activity } from "lucide-react";

/**
 * CardBack Component
 * A premium card back design featuring high-tech scanning animations,
 * breathing visual accents, and un-collapsed gradient typography.
 */
const CardBack = ({ packColor }: { packColor?: string }) => {
  return (
    <motion.div
      // className="relative w-80 h-[480px] rounded-[2rem] overflow-hidden border shadow-2xl flex flex-col items-center justify-center p-8 bg-gradient-to-br from-neutral-900 via-neutral-950 to-black"
      className={`absolute inset-0 border-primary border border-[hsla(24,85%,60%,0.3)] rounded-3xl bg-gradient-to-br ${""} shadow-2xl flex flex-col items-center justify-center p-8`}
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
          Tap to reveal
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
