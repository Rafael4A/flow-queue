import type { TicketType } from "../constants";

export interface LogInRequestPayload {
  username: string;
  password: string;
}

export interface IssueTicketRequestPayload {
  ticketType: TicketType;
}

export interface CallNextRequestPayload {
  deskId: string;
}

export interface RepeatCallRequestPayload {
  deskId: string;
  ticketId: string;
}

export interface MarkAbsentRequestPayload {
  deskId: string;
  ticketId: string;
}

export interface RequeueTicketRequestPayload {
  ticketId: string;
}

export interface StartServiceRequestPayload {
  deskId: string;
  ticketId: string;
}

export interface CompleteServiceRequestPayload {
  deskId: string;
  ticketId: string;
}
