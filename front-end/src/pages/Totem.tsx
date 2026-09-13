import { useMutation } from "@tanstack/react-query";

import { useNavigate } from "react-router";
import { TICKET_TYPE, USER_ROLE } from "shared-code";
import { issueTicketRequest } from "../api";
import { useAuthContext, useQueueContext } from "../contexts";

export function Totem() {
  const navigate = useNavigate();
  const { auth } = useAuthContext();

  if (auth?.role !== USER_ROLE.TOTEM) {
    navigate("/login");
  }

  const issueTicketMutation = useMutation({
    mutationFn: issueTicketRequest,
    onSuccess: () => alert("Ticket issued successfully!"), // TODO TOAST/SNACK?
  });

  const { queue, isLoading } = useQueueContext();

  return (
    <div>
      <h1>Totem</h1>
      <button
        onClick={() =>
          issueTicketMutation.mutate({ ticketType: TICKET_TYPE.CONVENTIONAL })
        }
        disabled={isLoading || issueTicketMutation.isPending}
      >
        Issue Standard Ticket
      </button>
      <button
        onClick={() =>
          issueTicketMutation.mutate({ ticketType: TICKET_TYPE.PRIORITY })
        }
        disabled={isLoading || issueTicketMutation.isPending}
      >
        Issue Priority Ticket
      </button>

      <p>
        Waiting Tickets: Standard: {queue?.waitingTickets?.CONVENTIONAL || 0},
        Priority: {queue?.waitingTickets?.PRIORITY || 0}
      </p>
    </div>
  );
}
