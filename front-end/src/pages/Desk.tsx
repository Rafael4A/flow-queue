import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import type { Ticket } from "shared-code";
import {
  callNextRequest,
  completeServiceRequest,
  markAbsentRequest,
  repeatCallRequest,
  requeueRequest,
  startServiceRequest,
} from "../api";
import { useAuthContext, useQueueContext } from "../contexts";

export function Desk() {
  const { queue, isLoading } = useQueueContext();
  const { auth } = useAuthContext();

  const [currentTicket, setCurrentTicket] = useState<Ticket>();

  const callNextMutation = useMutation({
    mutationFn: callNextRequest,
    onSuccess: (data) =>
      setCurrentTicket((data as any)?.message ? undefined : (data as Ticket)),
  });

  const repeatCallMutation = useMutation({
    mutationFn: repeatCallRequest,
    onSuccess: (data) => setCurrentTicket(data),
  });

  const markAbsentMutation = useMutation({
    mutationFn: markAbsentRequest,
    onSuccess: (data) => setCurrentTicket(data),
  });

  const startServiceMutation = useMutation({
    mutationFn: startServiceRequest,
    onSuccess: (data) => setCurrentTicket(data),
  });

  const completeServiceMutation = useMutation({
    mutationFn: completeServiceRequest,
    onSuccess: (data) => setCurrentTicket(data),
  });

  const requeueMutation = useMutation({
    mutationFn: requeueRequest,
    onSuccess: (data) => setCurrentTicket(data),
  });

  if (isLoading) {
    return <p>Loading...</p>;
  }

  return (
    <div>
      <h1>Desk</h1>
      <p>
        Waiting Tickets: Standard: {queue?.waitingTickets?.CONVENTIONAL || 0},
        Priority: {queue?.waitingTickets?.PRIORITY || 0}
      </p>

      {currentTicket ? (
        <p>
          Current Ticket: {currentTicket.id} - Type: {currentTicket.type}
        </p>
      ) : (
        <p>No current ticket</p>
      )}

      <button
        onClick={() => callNextMutation.mutate({ deskId: auth?.deskId || "" })}
        disabled={isLoading || callNextMutation.isPending}
      >
        Call Next
      </button>

      <button
        onClick={() =>
          repeatCallMutation.mutate({
            deskId: auth?.deskId || "",
            ticketId: currentTicket?.id || "",
          })
        }
        disabled={isLoading || repeatCallMutation.isPending}
      >
        Repeat Call
      </button>

      <button
        onClick={() =>
          markAbsentMutation.mutate({
            deskId: auth?.deskId || "",
            ticketId: currentTicket?.id || "",
          })
        }
        disabled={isLoading || markAbsentMutation.isPending}
      >
        Mark Absent
      </button>

      <button
        onClick={() =>
          startServiceMutation.mutate({
            deskId: auth?.deskId || "",
            ticketId: currentTicket?.id || "",
          })
        }
        disabled={isLoading || startServiceMutation.isPending}
      >
        Start Service
      </button>

      <button
        onClick={() =>
          completeServiceMutation.mutate({
            deskId: auth?.deskId || "",
            ticketId: currentTicket?.id || "",
          })
        }
        disabled={isLoading || completeServiceMutation.isPending}
      >
        Complete Service
      </button>

      <button
        onClick={() =>
          requeueMutation.mutate({
            ticketId: currentTicket?.id || "",
          })
        }
        disabled={isLoading || requeueMutation.isPending}
      >
        Requeue
      </button>
    </div>
  );
}
