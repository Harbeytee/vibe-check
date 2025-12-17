import { motion } from "framer-motion";

export default function Title() {
  return (
    <motion.div
      initial={{ scale: 0.8 }}
      animate={{ scale: 1 }}
      transition={{ type: "spring", duration: 0.8 }}
      className="mb-8"
    >
      <span className="text-7xl mb-4 block">🃏</span>
      <h1 className="font-display font-extrabold text-5xl md:text-6xl gradient-text mb-3">
        Vibe Check
      </h1>
      <p className="text-muted-foreground text-lg">
        Fun questions, real connections
      </p>
    </motion.div>
  );
}
