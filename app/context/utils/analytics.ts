import { sendGAEvent } from "@next/third-parties/google";

type GameEventName =
  | "room_created"
  | "room_joined"
  | "game_started"
  | "pack_selected"
  | "game_completed"
  | "custom_question_added";

export const trackEvent = (
  eventName: GameEventName,
  parameters?: Record<string, string | number | boolean>
) => {
  sendGAEvent("event", eventName, parameters ?? {});
};

// Game-specific tracking
export const analytics = {
  // Room Events
  roomCreated: (roomCode: string) => {
    trackEvent("room_created", {
      roomCode,
    });
  },

  roomJoined: (roomCode: string, playerCount: number) => {
    trackEvent("room_joined", { roomCode, playerCount });
  },

  // Game Events
  gameStarted: (selectedPack: string, hasCustomQuestions: boolean) => {
    trackEvent("game_started", { selectedPack, hasCustomQuestions });
  },

  packSelected: (packName: string, playerCount: number) => {
    trackEvent("pack_selected", { packName, playerCount });
  },

  gameCompleted: (
    playerCount: number,
    hasCustomQuestions: boolean,
    totalQuestions: number
  ) => {
    trackEvent("game_completed", {
      playerCount,
      hasCustomQuestions,
      totalQuestions,
    });
  },

  // Custom Questions
  customQuestionAdded: () => {
    trackEvent("custom_question_added");
  },
};
