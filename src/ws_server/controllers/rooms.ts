import { UserID } from "../types";
import { db } from "../../..";
import { createGame } from "./game";
import { ResponseMessageType } from "../types";
import { sendToAllConnections } from "../utils";

export const createRoom = (playerId: UserID) => {
  return db.createRoom(playerId);
};

export const updateRooms = () => {
  const rooms = db.getAllRooms();
  const message = {
    type: ResponseMessageType.update_room,
    data: JSON.stringify(rooms),
    id: 0,
  };

  sendToAllConnections(message);
};

export const addUserToRoom = (indexRoom: number, playerId: UserID) => {
  const { roomUsers } = db.addUserToRoom(indexRoom, playerId);

  if (roomUsers.length === 2) {
    createGame(roomUsers as [UserID, UserID]);
  }
};
