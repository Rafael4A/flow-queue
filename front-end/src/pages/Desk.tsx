import { useMutation, useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useNavigate } from "react-router";
import { USER_ROLE } from "shared-code";
import {
  callNextRequest,
  completeServiceRequest,
  getDeskTicketRequest,
  markAbsentRequest,
  repeatCallRequest,
  requeueRequest,
  startServiceRequest,
} from "../api";
import { useAuthContext, useQueueContext } from "../contexts";

export function Desk() {
  const { auth } = useAuthContext();
  const navigate = useNavigate();

  if (auth?.role !== USER_ROLE.DESK) {
    navigate("/login");
  }

  const { queue, isLoading } = useQueueContext();

  const currentTicketQuery = useQuery({
    queryKey: ["currentTicket"],
    queryFn: () => getDeskTicketRequest(),
  });

  const currentTicket = currentTicketQuery.data;

  const [requeueTicketId, setRequeueTicketId] = useState("");

  const callNextMutation = useMutation({
    mutationFn: callNextRequest,
    onSuccess: () => currentTicketQuery.refetch(),
  });

  const repeatCallMutation = useMutation({
    mutationFn: repeatCallRequest,
    onSuccess: () => currentTicketQuery.refetch(),
  });

  const markAbsentMutation = useMutation({
    mutationFn: markAbsentRequest,
    onSuccess: () => currentTicketQuery.refetch(),
  });

  const startServiceMutation = useMutation({
    mutationFn: startServiceRequest,
    onSuccess: () => currentTicketQuery.refetch(),
  });

  const completeServiceMutation = useMutation({
    mutationFn: completeServiceRequest,
    onSuccess: () => currentTicketQuery.refetch(),
  });

  const requeueMutation = useMutation({
    mutationFn: requeueRequest,
    onSuccess: (_data) => {
      setRequeueTicketId("");
      currentTicketQuery.refetch();
    }, // avisar que foi requeuado?
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
          Current Ticket: {currentTicket.id} - Type: {currentTicket.type} - Call
          Count: {currentTicket.callCount} - Status: {currentTicket.status}
        </p>
      ) : (
        <p>No current ticket</p>
      )}

      <button
        onClick={() => callNextMutation.mutate()}
        disabled={isLoading || callNextMutation.isPending}
      >
        Call Next
      </button>

      <button
        onClick={() =>
          repeatCallMutation.mutate({ ticketId: currentTicket?.id || "" })
        }
        disabled={isLoading || repeatCallMutation.isPending}
      >
        Repeat Call
      </button>

      <button
        onClick={() =>
          markAbsentMutation.mutate({ ticketId: currentTicket?.id || "" })
        }
        disabled={isLoading || markAbsentMutation.isPending}
      >
        Mark Absent
      </button>

      <button
        onClick={() =>
          startServiceMutation.mutate({ ticketId: currentTicket?.id || "" })
        }
        disabled={isLoading || startServiceMutation.isPending}
      >
        Start Service
      </button>

      <button
        onClick={() =>
          completeServiceMutation.mutate({ ticketId: currentTicket?.id || "" })
        }
        disabled={isLoading || completeServiceMutation.isPending}
      >
        Complete Service
      </button>

      <input
        type="text"
        placeholder="Requeue Ticket ID"
        value={requeueTicketId}
        onChange={(e) => setRequeueTicketId(e.target.value)}
      />

      <button
        onClick={() => requeueMutation.mutate({ ticketId: requeueTicketId })}
        disabled={isLoading || requeueMutation.isPending}
      >
        Requeue
      </button>
    </div>
  );
}
