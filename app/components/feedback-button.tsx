"use client";
import { Bug, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { motion, AnimatePresence } from "framer-motion";
import useFeedback from "@/hooks/useFeedback";

export default function FeedbackButton() {
  const {
    handleSubmit,
    open,
    setType,
    submitted,
    sending,
    setOpen,
    type,
    setName,
    setMessage,
    message,
    name,
  } = useFeedback();

  return (
    <>
      <div className="fixed bottom-5 right-5 z-[100] group">
        <span
          className="absolute bottom-full right-0 mb-2 px-3 py-2 text-sm font-medium text-primary-foreground bg-primary rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap pointer-events-none"
          role="tooltip"
        >
          Report a bug or suggest improvement
        </span>
        <motion.button
          onClick={() => setOpen(true)}
          title="Report a bug or suggest improvement"
          className="w-12 h-12 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center hover:scale-110 transition-transform"
          whileTap={{ scale: 0.9 }}
          aria-label="Report a bug or suggest improvement"
        >
          <Bug className="w-5 h-5" />
        </motion.button>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-display">Feedback</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Report a bug or suggest an improvement
            </DialogDescription>
          </DialogHeader>

          <AnimatePresence mode="wait">
            {submitted ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="py-8 text-center space-y-2"
              >
                <span className="text-4xl">🎉</span>
                <p className="font-semibold text-lg">
                  Thanks for your feedback!
                </p>
                <p className="text-sm text-muted-foreground">
                  We'll look into it.
                </p>
              </motion.div>
            ) : (
              <motion.form
                key="form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onSubmit={handleSubmit}
                className="space-y-4 pt-2"
              >
                {/* Type toggle */}
                <div className="flex gap-2 p-1 bg-muted/50 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setType("bug")}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg font-medium text-sm transition-all ${
                      type === "bug"
                        ? "bg-card text-foreground shadow-md"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    🐛 Bug Report
                  </button>
                  <button
                    type="button"
                    onClick={() => setType("suggestion")}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg font-medium text-sm transition-all ${
                      type === "suggestion"
                        ? "bg-card text-foreground shadow-md"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    💡 Suggestion
                  </button>
                </div>

                <Input
                  placeholder="Your name (optional)"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />

                <Textarea
                  placeholder={
                    type === "bug"
                      ? "Describe the bug... What happened? What did you expect?"
                      : "Share your idea or suggestion..."
                  }
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={4}
                  required
                  className="resize-none"
                />

                <Button
                  type="submit"
                  variant="glow"
                  className="w-full"
                  disabled={!message.trim() || sending}
                >
                  <Send className="w-4 h-4 mr-2" />
                  {sending ? "Sending..." : "Submit Feedback"}
                </Button>
              </motion.form>
            )}
          </AnimatePresence>
        </DialogContent>
      </Dialog>
    </>
  );
}
