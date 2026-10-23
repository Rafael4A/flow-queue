import "@testing-library/jest-dom/vitest";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import {
  TEST_DESK_1_ACCOUNT,
  TEST_TOTEM_ACCOUNT,
  TICKET_STATUS,
  TICKET_TYPE,
  USER_ROLE,
} from "shared-code";
import { TEST_DEFAULT_DATE_STRING } from "./testSetup";

export const handlers = [
  http.post("/api/auth/login", async ({ request }) => {
    const body = (await request.json()) as Record<string, any>;
    if (
      body?.username === TEST_DESK_1_ACCOUNT.subject &&
      body?.password === TEST_DESK_1_ACCOUNT.password
    ) {
      return HttpResponse.json({
        sub: TEST_DESK_1_ACCOUNT.subject,
        role: USER_ROLE.DESK,
        deskId: TEST_DESK_1_ACCOUNT.deskId,
      });
    }
    if (
      body?.username === TEST_TOTEM_ACCOUNT.subject &&
      body?.password === TEST_TOTEM_ACCOUNT.password
    ) {
      return HttpResponse.json({
        sub: TEST_TOTEM_ACCOUNT.subject,
        role: USER_ROLE.TOTEM,
      });
    }
    return new HttpResponse(
      JSON.stringify({ message: "Invalid username or password" }),
      { status: 401 },
    );
  }),
  http.get("/api/queue/public", () => {
    return HttpResponse.json({
      currentTicket: undefined,
      recentCalls: [],
      waitingTickets: { CONVENTIONAL: 0, PRIORITY: 0 },
    });
  }),
  http.get("/api/desk/ticket", () => {
    return HttpResponse.json({
      id: "PRI-001",
      type: TICKET_TYPE.PRIORITY,
      status: TICKET_STATUS.CALLED,
      callCount: 1,
      createdAt: new Date(TEST_DEFAULT_DATE_STRING),
    });
  }),
  http.post("/api/desk/tickets/call-next", () => {
    return HttpResponse.json({
      id: "PRI-001",
      type: TICKET_TYPE.PRIORITY,
      status: TICKET_STATUS.CALLED,
      callCount: 1,
      createdAt: new Date(TEST_DEFAULT_DATE_STRING),
    });
  }),
  http.post("/api/desk/tickets/repeat", async ({ request }) => {
    const body = (await request.json()) as Record<string, any>;
    return HttpResponse.json({ id: body?.ticketId, callCount: 2 });
  }),
  http.post("/api/desk/tickets/mark-absent", async ({ request }) => {
    const body = (await request.json()) as Record<string, any>;
    return HttpResponse.json({
      id: body?.ticketId,
      status: TICKET_STATUS.ABSENT,
    });
  }),
  http.post("/api/desk/tickets/start", async ({ request }) => {
    const body = (await request.json()) as Record<string, any>;
    return HttpResponse.json({
      id: body?.ticketId,
      status: TICKET_STATUS.IN_PROGRESS,
    });
  }),
  http.post("/api/desk/tickets/complete", async ({ request }) => {
    const body = (await request.json()) as Record<string, any>;
    return HttpResponse.json({
      id: body?.ticketId,
      status: TICKET_STATUS.COMPLETED,
    });
  }),
  http.post("/api/totem/tickets/issue", async ({ request }) => {
    const body = (await request.json()) as Record<string, any>;
    if (body?.ticketType === TICKET_TYPE.PRIORITY) {
      return HttpResponse.json({
        id: "PRI-001",
        type: body.ticketType,
        status: "ISSUED",
        callCount: 0,
        createdAt: new Date(TEST_DEFAULT_DATE_STRING),
      });
    } else if (body?.ticketType === TICKET_TYPE.CONVENTIONAL) {
      return HttpResponse.json({
        id: "CON-001",
        type: body.ticketType,
        status: "ISSUED",
        callCount: 0,
        createdAt: new Date(TEST_DEFAULT_DATE_STRING),
      });
    }
    return new HttpResponse(
      JSON.stringify({ message: "Invalid ticket type" }),
      { status: 400 },
    );
  }),
  http.post("/api/desk/tickets/requeue", async ({ request }) => {
    const body = (await request.json()) as Record<string, any>;
    return HttpResponse.json({ id: body?.ticketId, status: "ISSUED" });
  }),
  http.get("/api/socket.io/*", async () => {
    return HttpResponse.json();
  }),
];

export const server = setupServer(...handlers);
