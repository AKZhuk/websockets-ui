import { Coordinate, Coordinates, IndexPlayer, UserID } from "../types";

export interface Users {
  [key: UserID]: User;
}
export interface User {
  name: string;
  password: string;
}

export interface Room {
  roomId: number;
  roomUsers: UserID[];
}

export interface Game {
  idGame: number;
  playerIds: [UserID, UserID];
  ships: [Ship[], Ship[]] | [];
  pointsByShip: [{ [key: number]: any }, { [key: number]: any }];
  turn: IndexPlayer;
  shotHistory: [Coordinates[], Coordinates[]];
}
export interface Winner {
  name: string;
  wins: number;
}

export interface Ship {
  position: {
    x: Coordinate;
    y: Coordinate;
  };
  direction: boolean;
  length: number;
  type: "small" | "medium" | "large" | "huge";
}

export type AttackStatus = "killed" | "shot" | "miss";
