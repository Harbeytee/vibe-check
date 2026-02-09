import { ReactNode } from "react";
import { GameProvider } from "./context/game-context";
import { ToastProvider } from "./context/toast-context";
import FeedbackButton from "./components/feedback-button";

export default function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ToastProvider>
      <GameProvider>
        <FeedbackButton />
        {children}
      </GameProvider>
    </ToastProvider>
  );
}
