import { useCallback } from "react";
import io from "socket.io-client";
import { useSocketContext } from "../contexts/SocketContext";

export function useWebsocket() {
  const { socketRef, initGlobalListeners } = useSocketContext();

  const connectSocket = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.disconnect();
    }

    socketRef.current = io(location.origin, {
      path: "/api/socket.io",
    });

    initGlobalListeners();
  }, [socketRef, initGlobalListeners]);

  const disconnectSocket = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.disconnect();
    }
  }, [socketRef]);

  const registerEvent = (
    event: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    callback: (...args: any[]) => void,
  ) => {
    socketRef.current?.on(event, callback);
  };

  const emitEvent = (event: string, ...args: unknown[]) => {
    socketRef.current?.emit(event, ...args);
  };

  return {
    connectSocket,
    disconnectSocket,
    registerEvent,
    emitEvent,
    socketRef,
  };
}
