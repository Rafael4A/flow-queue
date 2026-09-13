import type { TicketType } from "../constants";
import type { Ticket } from "./Ticket";

export interface PublicQueueView {
  currentTicket?: Ticket;
  recentCalls?: Ticket[];
  waitingTickets?: Record<TicketType, number>;
}
