import { updateWinners } from "./controllers/users";
import { registerUser } from "./controllers/users";
import { WebSocket } from "ws";
import {
  AddUserToRoomData,
  Message,
  RequestMessageType,
  UserID,
} from "./types";
import { addUserToRoom, createRoom, updateRooms } from "./controllers/rooms";
import { addShips, handleAttack, handleRandomAttach } from "./controllers/game";
import { getUserIdByWs } from "./utils";

export const CONNECTIONS = new Map<WebSocket, UserID>();

function handleMessage(message: Message<RequestMessageType>, ws: WebSocket) {
  const playerId = getUserIdByWs(ws);
  let data: any = "";
  try {
    data = JSON.parse(message.data);
  } catch (error) {
    data = "";
  }

  switch (message.type) {
    case "reg":
      const [user, userId] = registerUser(data);
      CONNECTIONS.set(ws, userId);
      ws.send(JSON.stringify(user));
      updateRooms();
      updateWinners(userId);
      break;
    case "create_room":
      createRoom(playerId!);
      updateRooms();
      break;
    case "add_user_to_room":
      const { indexRoom } = data as AddUserToRoomData;
      addUserToRoom(indexRoom, playerId!);
      updateRooms();
      break;
    case "add_ships":
      addShips(data);
      break;
    case "attack":
      handleAttack(data);
      break;
    case "randomAttack":
      handleRandomAttach({ ...data });
      break;
    default:
      console.log(`Unknown message type: ${message.type}`);
      break;
  }
}

export const createWsServer = () => {
  try {
    const wss = new WebSocket.Server({ port: 3000 });
    console.log("Start webSocket server on the 3000 port");

    wss.on("connection", function connection(ws) {
      console.log("Client connected");

      ws.on("message", function incoming(message: string) {
        try {
          const parsedMessage = JSON.parse(message) as Message<
            RequestMessageType
          >;
          handleMessage(parsedMessage, ws);
        } catch (error) {
          console.error("Error parsing message:", error);
        }
      });

      ws.on("close", function close() {
        console.log("Client disconnected");
        CONNECTIONS.delete(ws);
      });
    });
  } catch (error) {
    console.error("Something went wrong", error);
  }
};
