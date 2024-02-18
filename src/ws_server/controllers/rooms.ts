import { UserID } from "../types";
import { db } from "../../..";
import { createGame } from "./game";
import { ResponseMessageType } from "../types";
import { sendToAllConnections } from "../utils";

export const createRoom = (userId: UserID) => {
  return db.createRoom(userId);
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

export const addUserToRoom = (indexRoom: number, userId: UserID) => {
  if (db.getRoomById(indexRoom)?.roomUsers.some(id => userId === id)) return
  const { roomUsers } = db.addUserToRoom(indexRoom, userId);

  if (roomUsers.length === 2) {
    createGame(roomUsers as [UserID, UserID]);
  }
};
