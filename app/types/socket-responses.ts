import { GameRoom, Player } from "./interface";

export interface SocketResponse {
  success: boolean;
  message?: string;
  highTraffic?: boolean;
}

export interface CreateRoomResponse extends SocketResponse {
  room?: GameRoom;
  player?: Player;
}

export interface JoinRoomResponse extends SocketResponse {
  room?: GameRoom;
  player?: Player;
}

export interface StartGameResponse extends SocketResponse {
  room?: GameRoom;
}

export interface KickPlayerResponse extends SocketResponse {}

export interface CheckMembershipResponse extends SocketResponse {
  inRoom?: boolean;
}

export interface RejoinRoomResponse extends SocketResponse {
  room?: GameRoom;
  player?: Player;
}
