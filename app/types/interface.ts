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
  id: string;
  name: string;
  isHost: boolean;
}

export interface GameRoom {
  id: string;
  code: string;
  players: Player[];
  selectedPack: PackType | null;
  customQuestions: string[];
  currentPlayerIndex: number;
  currentQuestionIndex: number;
  isStarted: boolean;
  isFinished: boolean;
}

export interface GameState {
  room: GameRoom | null;
  currentPlayer: Player | null;
}
