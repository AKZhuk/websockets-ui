import { ResponseMessageType, UserID, createUserResponse } from "../types";
import { db } from "../../..";
import { sendToAllConnections } from "../utils";

export const registerUser = (data: any): [createUserResponse, UserID] => {
  const { id, player } = db.createUser(data);
  return [
    {
      type: ResponseMessageType.reg,
      data: JSON.stringify(player),
      id: 0,
    },
    id,
  ];
};

export const updateWinners = (userId: UserID) => {
  const winners = db.updateWinners(userId);
  const message = {
    type: ResponseMessageType.update_winners,
    data: JSON.stringify(winners),
    id: 0,
  };
  sendToAllConnections(message);
};
