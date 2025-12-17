import { ReactNode } from "react";
import { GameProvider } from "./context/game-context";

export default function AppProviders({ children }: { children: ReactNode }) {
  return <GameProvider>{children}</GameProvider>;
}
