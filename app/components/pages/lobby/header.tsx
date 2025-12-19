import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "../../ui/button";
import { motion } from "framer-motion";

export default function Header() {
  const router = useRouter();

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center justify-between mb-8"
    >
      <Button variant="ghost" onClick={() => router.push("/")}>
        <ArrowLeft className="w-4 h-4 mr-2" />
        Leave
      </Button>
      <div className="text-center">
        <h1 className="font-display font-bold text-xl">Game Lobby</h1>
        <p className="text-muted-foreground text-sm">Waiting for players...</p>
      </div>
      <div className="w-20" />
    </motion.div>
  );
}
