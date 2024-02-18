import { generateID } from "../utils";
import { Game, Users, Room, Winner, User } from "./types";
import {
  AddShipsData,
  Coordinates,
  IndexPlayer,
  UserID,
  createUserRequestData,
} from "../types";

export class InMemoryDB {
  private users: Users;
  private rooms: Room[];
  private winners: { [key: UserID]: number };
  private roomIdCounter: number;
  private gameIdCounter: number;
  private games: Game[];

  constructor() {
    this.users = {};
    this.rooms = [];
    this.winners = {};
    this.games = [];
    this.roomIdCounter = 0;
    this.gameIdCounter = 0;
  }

  createUser(userData: createUserRequestData) {
    const isUserNameNotUniq = Object.values(this.users).some((user) => {
      return user.name === userData.name;
    });

    const id = generateID();
    if (isUserNameNotUniq) {
      return {
        id,
        player: {
          name: userData.name,
          index: 0,
          error: true,
          errorText: "User with this name is already exist",
        },
      };
    }
    this.users[id] = userData;
    return {
      id,
      player: {
        name: userData.name,
        index: 0,
        error: false,
        errorText: "",
      },
    };
  }

  getUserById(id: UserID): User | undefined {
    return this.users[id];
  }

  getAllUsers(): Users {
    return this.users;
  }

  updateWinners(winnerId: UserID): Winner[] {
    if (this.winners[winnerId] === undefined) {
      this.winners[winnerId] = 0;
    } else {
      this.winners[winnerId] += 1;
    }

    return this.getAllWinners();
  }

  getAllWinners(): Winner[] {
    return Object.entries(this.winners).map(([id, wins]) => ({
      name: this.getUserById(id as UserID)?.name!,
      wins: wins,
    }));
  }

  createRoom(playerId: UserID): Room {
    const room: Room = { roomId: this.roomIdCounter++, roomUsers: [playerId] };
    this.rooms.push(room);
    return room;
  }

  addUserToRoom(indexRoom: number, playerId: UserID): Room {
    this.rooms[indexRoom]?.roomUsers.push(playerId);
    return this.rooms[indexRoom]!;
  }

  getRoomById(roomId: number): Room | undefined {
    return this.rooms.find((room) => room.roomId === roomId);
  }

  getAllRooms(): Room[] {
    return this.rooms.reduce<any[]>((newArr, room) => {
      if (room.roomUsers.length === 1) {
        const transformedRoom = {
          roomId: room.roomId,
          roomUsers: room.roomUsers.map((id, index) => {
            return {
              name: this.getUserById(id)?.name,
              index: index,
            };
          }),
        };
        newArr.push(transformedRoom);
      }
      return newArr;
    }, []);
  }

  createGame(playerIds: [UserID, UserID]): Game {
    const game: Game = {
      idGame: this.gameIdCounter++,
      playerIds: playerIds,
      turn: 0,
      ships: [],
      pointsByShip: [{}, {}],
      shotHistory: [[], []],
    };
    this.games.push(game);
    return game;
  }

  deleteGame(gameId: number) {
    this.games.splice(gameId, 1);
  }
  getGame(gameId: number): Game {
    return this.games[gameId]!;
  }

  changeTurn(gameId: number) {
    const game = this.getGame(gameId);
    game.turn = game.turn === 0 ? 1 : 0;
  }

  getTurn(gameId: number): Number {
    return this.games[gameId]!.turn;
  }

  addShips(data: AddShipsData) {
    const { ships, gameId, indexPlayer } = data;

    const g = this.games[gameId]!;
    ships.forEach((ship, index) => {
      const { x, y } = ship.position;
      const direction = ship.direction;
      const length = ship.length;
      const shipPoints = [];

      if (direction) {
        for (let i = 0; i < length; i++) {
          shipPoints.push([x, y + i]);
        }
      } else {
        for (let i = 0; i < length; i++) {
          shipPoints.push([x + i, y]);
        }
      }
      g.pointsByShip[indexPlayer][index] = shipPoints;
    });

    if (!g?.ships) {
      g.ships = [];
    }
    g.ships[indexPlayer] = ships;
  }

  updateShotHistory(
    gameId: IndexPlayer,
    indexPlayer: IndexPlayer,
    coordinates: Coordinates
  ) {
    this.games[gameId]?.shotHistory[indexPlayer].push(coordinates);
  }

  getShotHistory(gameId: IndexPlayer, indexPlayer: IndexPlayer) {
    return this.games[gameId]?.shotHistory[indexPlayer];
  }
}
