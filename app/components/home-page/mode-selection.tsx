import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Sparkles, Users } from "lucide-react";
import { Mode } from "@/types/types";
import { Dispatch, SetStateAction } from "react";

export default function ModeSelection({
  mode,
  setMode,
}: {
  mode: Mode;
  setMode: Dispatch<SetStateAction<Mode>>;
}) {
  if (mode === "select")
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="space-y-4"
      >
        <Button
          variant="glow"
          size="xl"
          className="w-full"
          onClick={() => setMode("create")}
        >
          <Sparkles className="w-5 h-5 mr-2" />
          Create Room
        </Button>
        <Button
          variant="outline"
          size="xl"
          className="w-full"
          onClick={() => setMode("join")}
        >
          <Users className="w-5 h-5 mr-2" />
          Join Room
        </Button>
      </motion.div>
    );
}
