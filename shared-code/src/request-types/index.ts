import type { TicketType } from "../constants";
export interface LogInRequestPayload {
  username: string;
  password: string;
}
export interface TicketTypePayload {
  ticketType: TicketType;
}
export interface TicketIdPayload {
  ticketId: string;
}
