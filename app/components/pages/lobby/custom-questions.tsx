import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "../../ui/input";
import { MessageSquare, Plus, X } from "lucide-react";

interface CustomQuestionsProps {
  questions: { id: number; text: string }[];
  onAdd: (question: string) => void;
  onRemove: (index: number) => void;
}

export default function CustomQuestions({
  questions,
  onAdd,
  onRemove,
}: CustomQuestionsProps) {
  const [newQuestion, setNewQuestion] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  const handleAdd = () => {
    if (newQuestion.trim()) {
      onAdd(newQuestion.trim());
      setNewQuestion("");
      setIsAdding(false);
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-primary" />
          <h3 className="font-display font-bold text-lg">Custom Questions</h3>
          <span className="text-muted-foreground text-sm">
            ({questions.length})
          </span>
        </div>
        {!isAdding && (
          <Button variant="outline" size="sm" onClick={() => setIsAdding(true)}>
            <Plus className="w-4 h-4 mr-1" />
            Add
          </Button>
        )}
      </div>

      <AnimatePresence>
        {isAdding && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-4 overflow-hidden"
          >
            <div className="flex gap-2">
              <Input
                value={newQuestion}
                onChange={(e) => setNewQuestion(e.target.value)}
                placeholder="Type your question..."
                onKeyDown={(e) => e.key === "Enter" && handleAdd()}
                autoFocus
              />
              <Button onClick={handleAdd} disabled={!newQuestion.trim()}>
                Add
              </Button>
              <Button variant="ghost" onClick={() => setIsAdding(false)}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
        <AnimatePresence>
          {questions.map((question) => (
            <motion.div
              key={question.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="flex items-center gap-2 p-3 bg-card/50 rounded-lg border border-border group"
            >
              <span className="flex-1 text-sm text-foreground">
                {question.text}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onRemove(question.id)}
                className="opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-4 h-4 text-muted-foreground hover:text-destructive" />
              </Button>
            </motion.div>
          ))}
        </AnimatePresence>
        {questions.length === 0 && (
          <p className="text-center text-muted-foreground text-sm py-4">
            No custom questions yet. Add your own!
          </p>
        )}
      </div>
    </div>
  );
}
