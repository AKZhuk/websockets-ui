import { WebSocket } from "ws";
import {
  Coordinate,
  Coordinates,
  IndexPlayer,
  ResponseMessageType,
} from "./types";
import { AttackStatus } from "./database/types";
import { getRandomCoordinates } from "./utils";

export class WebSocketBot {
  private ws: WebSocket;
  private serverUrl: string;
  private idGame: number;
  private idPlayer: IndexPlayer;
  private boardSize: number;
  private board: any[][];
  private target: {
    cells: Coordinates[];
    direction: boolean;
  };
  constructor(serverUrl: string) {
    this.boardSize = 10;
    this.board = this.createBoard();
    this.serverUrl = serverUrl;
    this.ws = new WebSocket(this.serverUrl);
    this.target = {
      cells: [],
      direction: false,
    };
  }

  sendMessage(message: any) {
    this.ws.send(JSON.stringify(message));
  }

  send(message: string) {
    const { type, data } = JSON.parse(message);
    const parsedData = JSON.parse(data);

    switch (type as ResponseMessageType) {
      case "create_game":
        this.idPlayer = parsedData.idPlayer;
        this.idGame = parsedData.idGame;
        this.sendShipPosition();
        break;
      case ResponseMessageType.turn:
        if (parsedData.currentPlayer !== this.idPlayer) return;
        this.target.cells.length > 0 ? this.fireByTarget() : this.sendAttack();
        break;
      case ResponseMessageType.attack:
        const { currentPlayer, position, status } = parsedData as {
          currentPlayer: IndexPlayer;
          position: Coordinates;
          status: AttackStatus;
        };
        if (currentPlayer !== this.idPlayer) return;
        if (status === "shot") {
          this.target.cells.push(position);
          if (position.y < 9 && position.x < 9)
            this.board[position.x + 1]![position.y + 1] = 1;
          if (position.y > 0 && position.x < 9)
            this.board[position.x + 1]![position.y - 1] = 1;
          if (position.y < 9 && position.x > 0)
            this.board[position.x - 1]![position.y + 1] = 1;
          if (position.y > 0 && position.x > 0)
            this.board[position.x - 1]![position.y - 1] = 1;
        }
        if (status === "killed") {
          this.target.cells.push(position);
          this.target.cells.forEach((cell) => {
            if (cell.y < 9) this.board[cell.x]![cell.y + 1] = 1;
            if (cell.y > 0) this.board[cell.x]![cell.y - 1] = 1;
            if (cell.x > 0) this.board[cell.x - 1]![cell.y] = 1;
            if (cell.x < 9) this.board[cell.x + 1]![cell.y] = 1;
          });
          this.target = { cells: [], direction: false };
        }
        break;
      default:
        break;
    }
  }

  private sendAttack(coordinates?: Coordinates) {
    const coord = coordinates || this.fireRandomly();
    this.board[coord.x]![coord.y] = 1;

    const message = {
      type: "attack",
      data: JSON.stringify({
        ...coord,
        gameId: this.idGame,
        indexPlayer: this.idPlayer,
      }),
      id: 0,
    };
    setTimeout(() => {
      this.sendMessage(message);
    }, 1000);
  }

  private fireByTarget() {
    const { cells } = this.target;
    const coordinates: Coordinates = { ...cells[0]! };
    if (cells.length === 1 && cells[0]) {
      if (this.board[cells[0].x]![cells[0].y + 1] === 0) {
        coordinates.y = (cells[0].y + 1) as Coordinate;
      } else if (this.board[cells[0].x - 1]![cells[0].y] === 0) {
        coordinates.x = (cells[0].x - 1) as Coordinate;
      } else if (this.board[cells[0].x]![cells[0].y - 1] === 0) {
        coordinates.y = (cells[0].y - 1) as Coordinate;
      } else {
        coordinates.x = (cells[0].x + 1) as Coordinate;
      }
    } else if (cells.length >= 2) {
      this.target.direction = cells[0]?.x === cells[1]?.x;
      if (this.target.direction) {
        const minY = Math.min(...cells.map((cell) => cell!.y as number));
        if (this.board[cells[0]!.x]![minY - 1] === 0) {
          coordinates.y = (minY - 1) as Coordinate;
        } else {
          coordinates.y = (minY + this.target.cells.length) as Coordinate;
        }
      } else {
        const minX = Math.min(...cells.map((cell) => cell!.x as number));
        if (this.board[minX - 1] && this.board[minX - 1]![cells[0]!.y] === 0) {
          coordinates.x = (minX - 1) as Coordinate;
        } else {
          coordinates.x = (minX + this.target.cells.length) as Coordinate;
        }
      }
    }
    this.sendAttack(coordinates);
  }

  private fireRandomly() {
    let coordinates: Coordinates = {
      x: 0,
      y: 0,
    };
    do {
      coordinates = getRandomCoordinates();
    } while (this.board[coordinates.x]![coordinates.y] === 1);
    return coordinates;
  }

  private sendShipPosition() {
    const message = {
      type: "add_ships",
      data: JSON.stringify({
        gameId: this.idGame,
        ships: this.generateShipPositions(),
        indexPlayer: this.idPlayer,
      }),
      id: 0,
    };
    this.sendMessage(message);
  }

  private createBoard() {
    const board = [];
    for (let i = 0; i < this.boardSize; i++) {
      board.push(Array(this.boardSize).fill(0));
    }
    return board;
  }

  private generateShipPositions() {
    const ships = [
      {
        position: {
          x: 3,
          y: 8,
        },
        direction: false,
        type: "huge",
        length: 4,
      },
      {
        position: {
          x: 0,
          y: 4,
        },
        direction: false,
        type: "large",
        length: 3,
      },
      {
        position: {
          x: 5,
          y: 4,
        },
        direction: false,
        type: "large",
        length: 3,
      },
      {
        position: {
          x: 7,
          y: 6,
        },
        direction: false,
        type: "medium",
        length: 2,
      },
      {
        position: {
          x: 3,
          y: 6,
        },
        direction: false,
        type: "medium",
        length: 2,
      },
      {
        position: {
          x: 3,
          y: 1,
        },
        direction: false,
        type: "medium",
        length: 2,
      },
      {
        position: {
          x: 0,
          y: 1,
        },
        direction: false,
        type: "small",
        length: 1,
      },
      {
        position: {
          x: 7,
          y: 1,
        },
        direction: false,
        type: "small",
        length: 1,
      },
      {
        position: {
          x: 9,
          y: 3,
        },
        direction: false,
        type: "small",
        length: 1,
      },
      {
        position: {
          x: 9,
          y: 1,
        },
        direction: false,
        type: "small",
        length: 1,
      },
    ];
    return ships;
  }
}
