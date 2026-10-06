import "@testing-library/jest-dom/vitest";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import { TEST_DEFAULT_DATE_STRING } from "./testSetup";

export const handlers = [
  http.post("/api/auth/login", async ({ request }) => {
    const body = (await request.json()) as Record<string, any>;
    if (body?.username === "desk-1" && body?.password === "pwd") {
      return HttpResponse.json({
        sub: "desk-1",
        role: "DESK",
        deskId: "Desk 1",
      });
    }
    if (body?.username === "totem-main" && body?.password === "pwd") {
      return HttpResponse.json({ sub: "totem-main", role: "TOTEM" });
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
      type: "PRIORITY",
      status: "CALLED",
      callCount: 1,
      createdAt: new Date(TEST_DEFAULT_DATE_STRING),
    });
  }),
  http.post("/api/desk/tickets/call-next", () => {
    return HttpResponse.json({
      id: "PRI-001",
      type: "PRIORITY",
      status: "CALLED",
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
    return HttpResponse.json({ id: body?.ticketId, status: "ABSENT" });
  }),
  http.post("/api/desk/tickets/start", async ({ request }) => {
    const body = (await request.json()) as Record<string, any>;
    return HttpResponse.json({ id: body?.ticketId, status: "IN_PROGRESS" });
  }),
  http.post("/api/desk/tickets/complete", async ({ request }) => {
    const body = (await request.json()) as Record<string, any>;
    return HttpResponse.json({ id: body?.ticketId, status: "COMPLETED" });
  }),
  http.post("/api/totem/tickets/issue", async ({ request }) => {
    const body = (await request.json()) as Record<string, any>;
    return HttpResponse.json({
      id: "PRI-001",
      type: body.ticketType,
      status: "ISSUED",
      callCount: 0,
      createdAt: new Date(TEST_DEFAULT_DATE_STRING),
    });
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
