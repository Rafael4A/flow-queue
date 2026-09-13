import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  type PropsWithChildren,
  type RefObject,
} from "react";

import { SOCKET_EVENT } from "shared-code";
import type { Socket } from "socket.io-client";

type SocketContextType = {
  socketRef: RefObject<Socket | null>;
  initGlobalListeners: () => void;
};

const SocketContext = createContext<SocketContextType | null>(null);

//eslint-disable-next-line react-refresh/only-export-components
export function useSocketContext() {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useSocketContext must be used within a SocketProvider");
  }
  return context;
}

export function SocketProvider({ children }: Readonly<PropsWithChildren>) {
  const socketRef = useRef<Socket>(null);
  const hasLostConnection = useRef(false);

  const initGlobalListeners = useCallback(() => {
    if (!socketRef.current) return;

    socketRef.current.off(SOCKET_EVENT.DISCONNECT);
    socketRef.current.off(SOCKET_EVENT.CONNECT);

    socketRef.current.on(SOCKET_EVENT.DISCONNECT, (reason?: string) => {
      if (reason !== "io client disconnect") {
        hasLostConnection.current = true;
      }
    });

    socketRef.current.on(SOCKET_EVENT.CONNECT, () => {
      if (hasLostConnection.current) {
        hasLostConnection.current = false;
      }
    });
  }, []);

  useEffect(() => {
    return () => {
      for (const prop in Object.values(SOCKET_EVENT)) {
        //eslint-disable-next-line react-hooks/exhaustive-deps
        socketRef.current?.off(prop);
      }
      socketRef.current?.disconnect();
      hasLostConnection.current = false;
    };
  }, []);

  return (
    <SocketContext.Provider value={{ socketRef, initGlobalListeners }}>
      {children}
    </SocketContext.Provider>
  );
}
