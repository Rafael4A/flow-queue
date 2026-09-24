import { TICKET_STATUS, type TicketStatus } from "shared-code";

export function ticketStatusToText(status: TicketStatus): string {
  switch (status) {
    case TICKET_STATUS.ISSUED:
      return "Issued";
    case TICKET_STATUS.CALLED:
      return "Called";
    case TICKET_STATUS.IN_PROGRESS:
      return "In Progress";
    case TICKET_STATUS.COMPLETED:
      return "Completed";
    case TICKET_STATUS.ABSENT:
      return "Absent";
    default:
      return status;
  }
}
