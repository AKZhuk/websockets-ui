import { createWsServer } from './src/ws_server';
import { httpServer } from './src/http_server/index';
import { InMemoryDB } from './src/ws_server/database';

const HTTP_PORT = 8181;
console.log(`Start static http server on the ${HTTP_PORT} port!`);
httpServer.listen(HTTP_PORT);
export const db = new InMemoryDB();
createWsServer()