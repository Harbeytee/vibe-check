import { ReactNode } from "react";
import { GameProvider } from "./context/game-context";
import { ToastProvider } from "./context/toast-context";

export default function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ToastProvider>
      <GameProvider>{children}</GameProvider>
    </ToastProvider>
  );
}
