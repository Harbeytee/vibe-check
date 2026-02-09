import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

export default function NextButton({ handleNext }: { handleNext: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-6 max-w-sm mx-auto w-full"
    >
      {
        <Button
          variant="glow"
          size="xl"
          className="w-full"
          onClick={handleNext}
        >
          Next Question
          <ArrowRight className="w-5 h-5 ml-2" />
        </Button>
      }
    </motion.div>
  );
}
