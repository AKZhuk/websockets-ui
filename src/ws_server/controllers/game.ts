import {
  getRandomCoordinates,
  getWSByUserId,
  sendToGamePlayers,
} from "../utils";
import { db } from "../../..";
import { Game } from "../database/types";
import {
  AddShipsData,
  AttackData,
  AttackStatus,
  IndexPlayer,
  RandomAttackData,
  ResponseMessageType,
  UserID,
} from "../types";
import { updateWinners } from "./users";

export const createGame = (roomUsers: [UserID, UserID]) => {
  const game = db.createGame(roomUsers);

  roomUsers.forEach((userId, index) => {
    getWSByUserId(userId)?.send(
      JSON.stringify({
        type: ResponseMessageType.create_game,
        data: JSON.stringify({ idGame: game.idGame, idPlayer: index }),
        id: 0,
      })
    );
  });
};

export const startGame = (game: Game) => {
  game.playerIds.forEach((userId, index) => {
    const ships = game.ships ? game.ships[index] : [];
    getWSByUserId(userId)?.send(
      JSON.stringify({
        type: ResponseMessageType.start_game,
        data: JSON.stringify({
          ships: ships,
          currentPlayerIndex: index,
        }),
        id: 0,
      })
    );

    getWSByUserId(userId)?.send(JSON.stringify(getTurn(game.idGame)));
  });
};

export const changeTurn = (gameId: number) => {
  db.changeTurn(gameId);
};

export const getTurn = (gameId: number) => {
  return {
    type: ResponseMessageType.turn,
    data: JSON.stringify({
      currentPlayer: db.getTurn(gameId),
    }),
    id: 0,
  };
};

export const validateTurn = (gameId: number, turn: IndexPlayer) => {
  return db.getTurn(gameId) === turn;
};

export const addShips = (data: AddShipsData) => {
  db.addShips(data);
  const game = db.getGame(data.gameId);
  const shouldStartGame = game.ships[0] && game.ships[1];

  if (shouldStartGame) {
    startGame(game);
  }
};

const checkIsPlayerWin = (enemyShips: any) => {
  return Object.values(enemyShips).flat().length === 0;
};

const finishGame = (gameId: number, indexPlayer: IndexPlayer) => {
  const game = db.getGame(gameId);
  sendToGamePlayers(game.playerIds, {
    type: ResponseMessageType.finish,
    data: JSON.stringify({
      winPlayer: indexPlayer,
    }),
    id: 0,
  });
};

const checkIsRepeatShot = ({
  gameId,
  indexPlayer,
  ...coordinates
}: AttackData) => {
  return db
    .getShotHistory(gameId, indexPlayer)
    ?.some(
      (historyShot) =>
        historyShot.x === coordinates.x && historyShot.y === coordinates.y
    );
};

export const handleAttack = ({
  gameId,
  indexPlayer,
  ...coordinates
}: AttackData) => {
  const { playerIds, pointsByShip } = db.getGame(gameId);
  if (!validateTurn(gameId, indexPlayer)) {
    return;
  }

  let status = AttackStatus.miss;
  const enemyIndex = indexPlayer ? 0 : 1;
  const enemyShips = pointsByShip[enemyIndex];
  for (const shipIndex in enemyShips) {
    const shotIdx = enemyShips[shipIndex].findIndex(
      (elem: [number, number]) =>
        elem[0] === coordinates.x && elem[1] === coordinates.y
    );
    if (shotIdx !== -1) {
      enemyShips[shipIndex].splice(shotIdx, 1);
      status =
        enemyShips[shipIndex].length === 0
          ? AttackStatus.killed
          : AttackStatus.shot;
    }
  }
  db.updateShotHistory(gameId, indexPlayer, coordinates);
  sendToGamePlayers(playerIds, {
    type: ResponseMessageType.attack,
    data: JSON.stringify({
      position: coordinates,
      currentPlayer: indexPlayer,
      status: status,
    }),
    id: 0,
  });

  status === AttackStatus.miss && changeTurn(gameId);
  sendToGamePlayers(playerIds, getTurn(gameId));

  const isPlayerWin = checkIsPlayerWin(enemyShips);
  if (isPlayerWin) {
    finishGame(gameId, indexPlayer);
    updateWinners(playerIds[indexPlayer]);
  }
};

export const handleRandomAttach = (data: RandomAttackData) => {
  let randomCoordinates = getRandomCoordinates();
  while (checkIsRepeatShot({ ...data, ...randomCoordinates })) {
    randomCoordinates = getRandomCoordinates();
  }
  handleAttack({ ...data, ...randomCoordinates });
};
