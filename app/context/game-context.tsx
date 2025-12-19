"use client";
import { createContext, useContext, useState, ReactNode } from "react";
import { GameRoom, Player, PackType } from "@/types/interface";
import { nanoid } from "nanoid";
import { gamePacks } from "@/data/packs";

interface GameContextType {
  room: GameRoom | null;
  currentPlayer: Player | null;
  createRoom: (playerName: string) => void;
  joinRoom: (roomCode: string, playerName: string) => boolean;
  selectPack: (packId: PackType) => void;
  addCustomQuestion: (question: string) => void;
  removeCustomQuestion: (index: number) => void;
  startGame: () => void;
  nextQuestion: () => void;
  resetGame: () => void;
  getCurrentQuestion: () => string | null;
  getCurrentTurnPlayer: () => Player | null;
  getAllQuestions: () => string[];
  answeredQuestions: number[];
  currentQuestionIndex: number | null;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

// Simple in-memory storage for demo (in production, use Supabase)
const rooms: Map<string, GameRoom> = new Map();

export const GameProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [room, setRoom] = useState<GameRoom | null>(null);
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null);
  const [answeredQuestions, setAnsweredQuestions] = useState<number[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<
    number | null
  >(null);

  const generateRoomCode = (): string => {
    return nanoid(6).toUpperCase();
  };

  const createRoom = (playerName: string) => {
    const player: Player = {
      id: nanoid(),
      name: playerName,
      isHost: true,
    };

    const newRoom: GameRoom = {
      id: nanoid(),
      code: generateRoomCode(),
      players: [player],
      selectedPack: null,
      customQuestions: [],
      currentPlayerIndex: 0,
      currentQuestionIndex: 0,
      isStarted: false,
      isFinished: false,
    };

    rooms.set(newRoom.code, newRoom);
    setRoom(newRoom);
    setCurrentPlayer(player);
    setAnsweredQuestions([]);
    setCurrentQuestionIndex(null);
  };

  const joinRoom = (roomCode: string, playerName: string): boolean => {
    const existingRoom = rooms.get(roomCode.toUpperCase());
    if (!existingRoom || existingRoom.isStarted) {
      return false;
    }

    const player: Player = {
      id: nanoid(),
      name: playerName,
      isHost: false,
    };

    existingRoom.players.push(player);
    rooms.set(roomCode, existingRoom);
    setRoom({ ...existingRoom });
    setCurrentPlayer(player);
    return true;
  };

  const selectPack = (packId: PackType) => {
    if (!room) return;
    const updatedRoom = { ...room, selectedPack: packId };
    rooms.set(room.code, updatedRoom);
    setRoom(updatedRoom);
  };

  const addCustomQuestion = (question: string) => {
    if (!room) return;
    const updatedRoom = {
      ...room,
      customQuestions: [...room.customQuestions, question],
    };
    rooms.set(room.code, updatedRoom);
    setRoom(updatedRoom);
  };

  const removeCustomQuestion = (index: number) => {
    if (!room) return;
    const updatedQuestions = [...room.customQuestions];
    updatedQuestions.splice(index, 1);
    const updatedRoom = { ...room, customQuestions: updatedQuestions };
    rooms.set(room.code, updatedRoom);
    setRoom(updatedRoom);
  };

  const getAllQuestions = (): string[] => {
    if (!room || !room.selectedPack) return [];
    const pack = gamePacks.find((p) => p.id === room.selectedPack);
    const packQuestions = pack?.questions || [];
    return [...packQuestions, ...room.customQuestions];
  };

  const getRandomUnansweredIndex = (): number | null => {
    const allQuestions = getAllQuestions();
    const unansweredIndices = allQuestions
      .map((_, index) => index)
      .filter((index) => !answeredQuestions.includes(index));

    if (unansweredIndices.length === 0) return null;

    const randomIndex = Math.floor(Math.random() * unansweredIndices.length);
    return unansweredIndices[randomIndex];
  };

  const startGame = () => {
    if (!room || !room.selectedPack) return;
    const updatedRoom = { ...room, isStarted: true };
    rooms.set(room.code, updatedRoom);
    setRoom(updatedRoom);
    setAnsweredQuestions([]);

    // Pick first random question
    const allQuestions = getAllQuestions();
    if (allQuestions.length > 0) {
      const randomIndex = Math.floor(Math.random() * allQuestions.length);
      setCurrentQuestionIndex(randomIndex);
    }
  };

  const nextQuestion = () => {
    if (!room || currentQuestionIndex === null) return;

    // Mark current question as answered
    const newAnswered = [...answeredQuestions, currentQuestionIndex];
    setAnsweredQuestions(newAnswered);

    const allQuestions = getAllQuestions();
    const unansweredIndices = allQuestions
      .map((_, index) => index)
      .filter((index) => !newAnswered.includes(index));

    if (unansweredIndices.length === 0) {
      const updatedRoom = { ...room, isFinished: true };
      rooms.set(room.code, updatedRoom);
      setRoom(updatedRoom);
      return;
    }

    // Pick random unanswered question
    const randomIndex = Math.floor(Math.random() * unansweredIndices.length);
    setCurrentQuestionIndex(unansweredIndices[randomIndex]);

    // Move to next player
    const nextPlayerIndex = (room.currentPlayerIndex + 1) % room.players.length;
    const updatedRoom = {
      ...room,
      currentPlayerIndex: nextPlayerIndex,
    };
    rooms.set(room.code, updatedRoom);
    setRoom(updatedRoom);
  };

  const getCurrentQuestion = (): string | null => {
    if (!room || currentQuestionIndex === null) return null;
    const allQuestions = getAllQuestions();
    return allQuestions[currentQuestionIndex] || null;
  };

  const getCurrentTurnPlayer = (): Player | null => {
    if (!room) return null;
    return room.players[room.currentPlayerIndex] || null;
  };

  const resetGame = () => {
    if (!room) return;
    const updatedRoom = {
      ...room,
      currentPlayerIndex: 0,
      currentQuestionIndex: 0,
      isStarted: false,
      isFinished: false,
    };
    rooms.set(room.code, updatedRoom);
    setRoom(updatedRoom);
    setAnsweredQuestions([]);
    setCurrentQuestionIndex(null);
  };

  return (
    <GameContext.Provider
      value={{
        room,
        currentPlayer,
        createRoom,
        joinRoom,
        selectPack,
        addCustomQuestion,
        removeCustomQuestion,
        startGame,
        nextQuestion,
        resetGame,
        getCurrentQuestion,
        getCurrentTurnPlayer,
        getAllQuestions,
        answeredQuestions,
        currentQuestionIndex,
      }}
    >
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error("useGame must be used within a GameProvider");
  }
  return context;
};
