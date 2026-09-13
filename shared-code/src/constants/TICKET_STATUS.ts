export const TICKET_STATUS = {
  ISSUED: "ISSUED",
  CALLED: "CALLED",
  IN_PROGRESS: "IN_PROGRESS",
  COMPLETED: "COMPLETED",
  ABSENT: "ABSENT",
} as const;

export type TicketStatus = (typeof TICKET_STATUS)[keyof typeof TICKET_STATUS];
