import { SOCKET_EVENT } from "shared-code";
import type { Server, Socket } from "socket.io";

export function socketHandler(io: Server) {
  io.on(SOCKET_EVENT.CONNECTION, (socket: Socket) => {
    // const query = socket.handshake.query as unknown as SocketQuery;
    // const { roomId, playerId } = query;

    // Check auth?
    if (false) return socket.disconnect();

    socket.on("disconnect", () => {});
  });
}
