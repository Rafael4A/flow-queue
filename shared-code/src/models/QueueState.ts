import type { TicketType } from "../constants";
import type { Ticket } from "./Ticket";

export interface QueueState {
  tickets: Ticket[];
  priorityCounter: number;
  sequences: Record<TicketType, number>;
}
