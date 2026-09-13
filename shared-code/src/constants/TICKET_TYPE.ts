export const TICKET_TYPE = {
  PRIORITY: "PRIORITY",
  CONVENTIONAL: "CONVENTIONAL",
} as const;

export type TicketType = (typeof TICKET_TYPE)[keyof typeof TICKET_TYPE];
