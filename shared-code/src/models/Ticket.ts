import type { TicketStatus, TicketType } from "../constants";

export interface Ticket {
  id: string;
  type: TicketType;
  status: TicketStatus;
  deskId?: string;
  callCount: number;
  createdAt: Date;
  calledAt?: Date;
  startedAt?: Date;
  completedAt?: Date;
}
