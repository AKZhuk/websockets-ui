import { randomUUID } from "crypto";
import { WebSocket } from "ws";
import { CONNECTIONS } from "./index";
import { Message, ResponseMessageType, UserID } from "./types";

export const generateID = () => {
  const id = randomUUID();
  return id;
};

export const getRandomCoordinates = () => {
  return {
    x: Math.floor(Math.random() * 10),
    y: Math.floor(Math.random() * 10),
  };
};

export const sendToGamePlayers = (
  userIDs: UserID[],
  message: Message<ResponseMessageType>
) => {
  userIDs.forEach((userId) => {
    getWSByUserId(userId)?.send(JSON.stringify(message));
  });
};

export function sendToAllConnections(message: Message<ResponseMessageType>) {
  for (let client of CONNECTIONS.keys()) {
    client.send(JSON.stringify(message));
  }
}
export function getUserIdByWs(ws: WebSocket) {
  return CONNECTIONS.get(ws);
}

export function getWSByUserId(id: string) {
  for (let [ws, userId] of CONNECTIONS.entries()) {
    if (userId === id) {
      return ws;
    }
  }
}
