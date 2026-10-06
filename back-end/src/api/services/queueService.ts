import {
  MAX_CALL_ATTEMPTS,
  PRIORITY_RATIO,
  TICKET_STATUS,
  type PublicQueueView,
  type QueueState,
  type Ticket,
  type TicketStatus,
  type TicketType,
} from "shared-code";
import { loadState, saveState } from "../../storage/jsonStorage";
import { generateTicketId, timePropSort } from "../../utils";

let state: QueueState = loadState();

export function resetStateForTesting(): void {
  state = loadState();
}

export function issueTicket(type: TicketType): Ticket {
  state.sequences[type] += 1;

  const ticket: Ticket = {
    id: generateTicketId(type, state.sequences[type]),
    type,
    status: TICKET_STATUS.ISSUED,
    callCount: 0,
    createdAt: new Date(),
  };
  state.tickets.push(ticket);
  saveState(state);
  return ticket;
}

export function getDeskTicket(deskId: string): Ticket | undefined {
  const workingStatuses = [
    TICKET_STATUS.CALLED,
    TICKET_STATUS.IN_PROGRESS,
  ] as TicketStatus[];

  return state.tickets.find(
    (ticket) =>
      ticket.deskId === deskId && workingStatuses.includes(ticket.status),
  );
}

export function callNext(deskId: string): Ticket | undefined {
  const deskHasTicket = getDeskTicket(deskId) !== undefined;
  if (deskHasTicket) {
    throw new Error(
      `Desk ${deskId} already has a ticket in progress or called.`,
    );
  }

  const { CONVENTIONAL: pendingConventional, PRIORITY: pendingPriority } =
    state.tickets.reduce<Record<TicketType, Ticket[]>>(
      (acc, t) => ({
        ...acc,
        [t.type]: [
          ...(t.status === TICKET_STATUS.ISSUED
            ? [...acc[t.type], t]
            : acc[t.type]),
        ],
      }),
      { CONVENTIONAL: [], PRIORITY: [] } as Record<TicketType, Ticket[]>,
    );

  const sortedPendingConventional = pendingConventional.toSorted(
    timePropSort("createdAt"),
  );
  const sortedPendingPriority = pendingPriority.toSorted(
    timePropSort("createdAt"),
  );

  let ticketToCall: Ticket | undefined;
  if (
    state.priorityCounter < PRIORITY_RATIO &&
    sortedPendingPriority.length > 0
  ) {
    ticketToCall = sortedPendingPriority[0]!;
    state.priorityCounter += 1;
  } else if (sortedPendingConventional.length > 0) {
    ticketToCall = sortedPendingConventional[0]!;
    state.priorityCounter = 0;
  } else if (sortedPendingPriority.length > 0) {
    ticketToCall = sortedPendingPriority[0]!;
  } else {
    ticketToCall = undefined;
  }

  if (ticketToCall) {
    ticketToCall.status = TICKET_STATUS.CALLED;
    ticketToCall.deskId = deskId;
    ticketToCall.calledAt = new Date();
    ticketToCall.callCount += 1;
  }

  saveState(state);
  return ticketToCall;
}

export function repeatCall(ticketId: string, deskId: string): Ticket {
  const ticket = state.tickets.find((ticket) => ticket.id === ticketId);
  if (!ticket) {
    throw new Error(`Ticket with ID ${ticketId} not found.`);
  }
  if (ticket.deskId !== deskId) {
    throw new Error(
      `Ticket with ID ${ticketId} is not assigned to desk ${deskId}.`,
    );
  }
  if (ticket.status !== TICKET_STATUS.CALLED) {
    throw new Error(`Ticket with ID ${ticketId} is not in a called state.`);
  }
  if (ticket.callCount >= MAX_CALL_ATTEMPTS) {
    throw new Error(
      `Ticket with ID ${ticketId} has reached the maximum number of call attempts.`,
    );
  }

  ticket.callCount += 1;
  ticket.calledAt = new Date();
  saveState(state);
  return ticket;
}

export function markAbsent(ticketId: string, deskId: string): Ticket {
  const ticket = state.tickets.find((ticket) => ticket.id === ticketId);
  if (!ticket) {
    throw new Error(`Ticket with ID ${ticketId} not found.`);
  }
  if (ticket.deskId !== deskId) {
    throw new Error(
      `Ticket with ID ${ticketId} is not assigned to desk ${deskId}.`,
    );
  }
  if (ticket.status !== TICKET_STATUS.CALLED) {
    throw new Error(`Ticket with ID ${ticketId} is not in a called state.`);
  }

  ticket.status = TICKET_STATUS.ABSENT;

  saveState(state);
  return ticket;
}

export function requeueTicket(ticketId: string): Ticket {
  const ticket = state.tickets.find((ticket) => ticket.id === ticketId);
  if (!ticket) {
    throw new Error(`Ticket with ID ${ticketId} not found.`);
  }
  if (ticket.status !== TICKET_STATUS.ABSENT) {
    throw new Error(`Ticket with ID ${ticketId} is not in an absent state.`);
  }

  ticket.status = TICKET_STATUS.ISSUED;
  ticket.deskId = undefined;
  ticket.calledAt = undefined;
  ticket.callCount = 0;
  ticket.createdAt = new Date();

  saveState(state);
  return ticket;
}

export function startService(ticketId: string, deskId: string): Ticket {
  const ticket = state.tickets.find((ticket) => ticket.id === ticketId);
  if (!ticket) {
    throw new Error(`Ticket with ID ${ticketId} not found.`);
  }
  if (ticket.deskId !== deskId) {
    throw new Error(
      `Ticket with ID ${ticketId} is not assigned to desk ${deskId}.`,
    );
  }
  if (ticket.status !== TICKET_STATUS.CALLED) {
    throw new Error(`Ticket with ID ${ticketId} is not in a called state.`);
  }

  ticket.status = TICKET_STATUS.IN_PROGRESS;
  ticket.startedAt = new Date();

  saveState(state);
  return ticket;
}

export function completeService(ticketId: string, deskId: string): Ticket {
  const ticket = state.tickets.find((ticket) => ticket.id === ticketId);
  if (!ticket) {
    throw new Error(`Ticket with ID ${ticketId} not found.`);
  }
  if (ticket.deskId !== deskId) {
    throw new Error(
      `Ticket with ID ${ticketId} is not assigned to desk ${deskId}.`,
    );
  }
  if (ticket.status !== TICKET_STATUS.IN_PROGRESS) {
    throw new Error(`Ticket with ID ${ticketId} is not in a progress state.`);
  }

  ticket.status = TICKET_STATUS.COMPLETED;
  ticket.completedAt = new Date();

  saveState(state);
  return ticket;
}

export function getPublicState(): PublicQueueView {
  const statusesToFilter: TicketStatus[] = [
    TICKET_STATUS.CALLED,
    TICKET_STATUS.ABSENT,
  ]; //TODO CHECK IF THESE ARE THE CORRECT STATUSES -> CONSIDER THE FILTER BY CALLED AT

  const filteredTickets = state.tickets
    .filter((t) => statusesToFilter.includes(t.status) && !!t.calledAt)
    .toSorted(timePropSort("calledAt", false));

  const currentTicket =
    filteredTickets[0]?.status === TICKET_STATUS.CALLED
      ? filteredTickets[0]
      : undefined;
  const recentCallsSliceRanges = currentTicket ? [1, 6] : [0, 5];
  const recentCalls = filteredTickets.slice(...recentCallsSliceRanges);

  const waitingTickets = state.tickets.reduce<Record<TicketType, number>>(
    (acc, t) => ({
      ...acc,
      [t.type]:
        t.status === TICKET_STATUS.ISSUED ? acc[t.type] + 1 : acc[t.type],
    }),
    { CONVENTIONAL: 0, PRIORITY: 0 } as Record<TicketType, number>,
  );

  return {
    currentTicket,
    recentCalls,
    waitingTickets,
  };
}
