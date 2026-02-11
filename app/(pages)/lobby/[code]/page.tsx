import type { Metadata } from "next";
import Lobby from "@/components/pages/lobby/lobby";

export const metadata: Metadata = {
  title: "Lobby",
  description:
    "Waiting for players. Share the room code or QR so friends can join, then pick a question pack and start the game.",
};

export default Lobby;
