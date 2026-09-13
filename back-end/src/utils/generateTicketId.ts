import { TICKET_TYPE, type TicketType } from "shared-code";

export function generateTicketId(type: TicketType, sequence: number): string {
  const paddedSequence = sequence.toString().padStart(3, "0");
  switch (type) {
    case TICKET_TYPE.CONVENTIONAL:
      return `CON-${paddedSequence}`;
    case TICKET_TYPE.PRIORITY:
      return `PRI-${paddedSequence}`;
    default:
      throw new Error(`Invalid ticket type: ${type}`);
  }
}
