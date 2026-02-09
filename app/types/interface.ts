import { Socket } from "socket.io-client";
import type {
  CreateRoomResponse,
  JoinRoomResponse,
  StartGameResponse,
} from "./socket-responses";

export type PackType =
  | "friends"
  | "family"
  | "couples"
  | "work"
  | "party"
  | "deep";

export interface Pack {
  id: PackType;
  name: string;
  description: string;
  icon: string;
  color: string;
  questions: string[];
}

export interface Player {
  id: string | number;
  name: string;
  isHost: boolean;
}

interface CustomQuestion {
  id: number;
  text: string;
}

export interface GameRoom {
  id: string;
  code: string;
  players: Player[];
  selectedPack: PackType | null;
  customQuestions: CustomQuestion[];
  currentPlayerIndex: number;
  currentQuestionIndex: number;
  currentQuestion: string;
  isStarted: boolean;
  isFinished: boolean;
  isFlipped: boolean;
  isTransitioning: boolean;
  totalQuestions: number;
  answeredQuestions: number[];
}

export interface GameState {
  room: GameRoom | null;
  currentPlayer: Player | null;
}

export interface GameContextType {
  room: GameRoom | null;
  currentPlayer: Player | null;
  createRoom: (
    playerName: string,
    callback?: (res: CreateRoomResponse) => void
  ) => void;
  joinRoom: (
    roomCode: string,
    playerName: string,
    callback?: (res: JoinRoomResponse) => void
  ) => void;
  selectPack: (packId: PackType) => void;
  addCustomQuestion: (question: string) => void;
  removeCustomQuestion: (index: number) => void;
  startGame: (callback?: (res: StartGameResponse) => void) => void;
  nextQuestion: () => void;
  flipCard: () => void;
  kickPlayer: (playerId: string) => void;
  getCurrentTurnPlayer: () => Player | null;
  socket: Socket | null;
  player: Player | null;
}
