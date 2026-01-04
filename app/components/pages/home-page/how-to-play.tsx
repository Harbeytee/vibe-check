import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { motion } from "framer-motion";
import { HelpCircle } from "lucide-react";

export default function HowToPlay() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.4 }}
    >
      <Dialog>
        <DialogTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-foreground gap-1 hover:bg-transparent"
          >
            <HelpCircle className="w-4 h-4 mr-0.5" />
            How to Play
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl font-display flex items-center gap-2">
              🃏 How to Play
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="flex gap-3">
              <span className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold">
                1
              </span>
              <div>
                <h4 className="font-semibold">Create or Join a Room</h4>
                <p className="text-sm text-muted-foreground">
                  One player creates a room and shares the code or QR with
                  friends.
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <span className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold">
                2
              </span>
              <div>
                <h4 className="font-semibold">Choose Question Packs</h4>
                <p className="text-sm text-muted-foreground">
                  Select fun categories like Icebreakers, Deep Talk, or Spicy
                  questions.
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <span className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold">
                3
              </span>
              <div>
                <h4 className="font-semibold">Take Turns</h4>
                <p className="text-sm text-muted-foreground">
                  Each round, a player draws a card and answers the question
                  honestly.
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <span className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold">
                4
              </span>
              <div>
                <h4 className="font-semibold">Have Fun!</h4>
                <p className="text-sm text-muted-foreground">
                  Laugh, learn, and connect with your friends through meaningful
                  conversations.
                </p>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
