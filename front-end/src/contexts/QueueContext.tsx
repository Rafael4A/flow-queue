import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createContext,
  useContext,
  useEffect,
  useEffectEvent,
  type PropsWithChildren,
} from "react";
import { SOCKET_EVENT, type PublicQueueView } from "shared-code";
import { getPublicQueueRequest } from "../api";
import { TICKETS_QUERY_KEY } from "../constants";
import { useWebsocket } from "../hooks";
import type { APIError } from "../types";

const QueueContext = createContext<{
  clearData: () => void;
  queue?: PublicQueueView;
  isLoading: boolean;
  refetch: () => void;
}>({
  clearData: () => {
    throw new Error("clearData function not implemented");
  },
  queue: undefined,
  isLoading: false,
  refetch: () => {},
});

//eslint-disable-next-line react-refresh/only-export-components
export function useQueueContext() {
  return useContext(QueueContext);
}

export function QueueProvider({ children }: Readonly<PropsWithChildren>) {
  const queryClient = useQueryClient();

  const { connectSocket, disconnectSocket, registerEvent } = useWebsocket();

  const queue = useQuery({
    queryKey: [TICKETS_QUERY_KEY],
    queryFn: () => getPublicQueueRequest(),
    enabled: true, // TODO: Probably remove this, check how this will work with auth
    retryDelay: 0,
  });

  const clearData = () => {
    queryClient.removeQueries({ queryKey: [TICKETS_QUERY_KEY], exact: true });
    // TODO: ? Create sign out function that clears session storage and redirects to home page

    disconnectSocket();
  };

  const updateConnection = useEffectEvent(() => {
    connectSocket();

    registerEvent(SOCKET_EVENT.UPDATE, () => {
      queue.refetch();
    });

    if (queue.isError) {
      if ((queue.error as APIError)?.status === 404) {
        clearData();
      }
    }
  });

  useEffect(updateConnection, [updateConnection]);

  return (
    <QueueContext
      value={{
        queue: queue.data,
        isLoading: queue.isLoading,
        refetch: queue.refetch,
        clearData,
      }}
    >
      {children}
    </QueueContext>
  );
}
