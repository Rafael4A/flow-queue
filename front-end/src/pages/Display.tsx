import { useQueueContext } from "../contexts";

export function Display() {
  const { queue, isLoading } = useQueueContext();

  if (isLoading) {
    return <p>Loading...</p>;
  }

  return (
    <div>
      <h1>Display</h1>
      <p>Current Ticket: {queue?.currentTicket?.id || "None"}</p>
      <p>
        Waiting Tickets: Standard: {queue?.waitingTickets?.CONVENTIONAL || 0},
        Priority: {queue?.waitingTickets?.PRIORITY || 0}
      </p>
      <h2>Recent Calls</h2>
      <ul>
        {queue?.recentCalls?.map((ticket) => (
          <li key={ticket.id}>
            {ticket.id} - Called At:{" "}
            {ticket.calledAt?.toLocaleString() || "N/A"}
          </li>
        ))}
      </ul>
    </div>
  );
}
