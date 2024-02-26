import { Ship } from "./database/types";
export type RequestMessageType =
  | "reg"
  | "create_room"
  | "add_ships"
  | "add_user_to_room"
  | "randomAttack"
  | "attack"
  | "single_play";

export type UserID = `${string}-${string}-${string}-${string}-${string}`;

export interface Message<T> {
  type: T;
  data: string;
  id: number;
}
export type Coordinate = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

export interface Coordinates {
  x: Coordinate;
  y: Coordinate;
}

export interface createUserRequestData {
  name: string;
  password: string;
}

export type createUserResponse = {
  type: "reg";
  data: string;
  id: 0;
};

export interface AddUserToRoomData {
  indexRoom: number;
}

export interface AddShipsData {
  gameId: number;
  ships: Ship[];
  indexPlayer: IndexPlayer;
}

export interface RandomAttackData {
  gameId: IndexPlayer;
  indexPlayer: IndexPlayer;
}

export interface AttackData extends Coordinates {
  gameId: IndexPlayer;
  indexPlayer: IndexPlayer;
}

export enum AttackStatus {
  miss = "miss",
  killed = "killed",
  shot = "shot",
}

export enum ResponseMessageType {
  reg = "reg",
  update_room = "update_room",
  update_winners = "update_winners",
  create_game = "create_game",
  start_game = "start_game",
  turn = "turn",
  attack = "attack",
  finish = "finish",
}

export type IndexPlayer = 0 | 1;
