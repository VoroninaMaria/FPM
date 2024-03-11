import { Sockets, Redis } from "@local/lib/index.js";
import { decodeJwt } from "@local/helpers/index.js";

await Redis.publisher.connect();
await Redis.subscriber.connect();

const onConnection = (wsClient, { headers }, table) => {
  const token = headers["sec-websocket-protocol"].split(", ")[1];
  let decodedToken;

  try {
    decodedToken = decodeJwt(token);
  } catch (e) {
    wsClient.terminate();
  }
  const { id, session_identifier } = decodedToken;
  const listener = (message) => wsClient.send(message);

  if (table === "merchants")
    return Sockets.merchantSocket(id, session_identifier, listener, wsClient);

  if (table === "clients")
    return Sockets.clientSocket(id, session_identifier, listener, wsClient);
};

export { onConnection };
