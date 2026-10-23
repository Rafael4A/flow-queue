import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router";
import { TICKET_STATUS, TICKET_TYPE, type Ticket } from "shared-code";
import { afterEach, describe, expect, it, vi } from "vitest";
import { QueueProvider } from "../contexts/QueueContext";
import { SocketProvider } from "../contexts/SocketContext";
import { TEST_DEFAULT_DATE_STRING } from "../testSetup";
import { Display } from "./Display";

vi.mock("socket.io-client", () => ({
  default: vi.fn(() => ({
    on: vi.fn(),
    off: vi.fn(),
    disconnect: vi.fn(),
    emit: vi.fn(),
  })),
}));

function renderWithProviders(ui: React.ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <SocketProvider>
          <QueueProvider>{ui}</QueueProvider>
        </SocketProvider>
      </BrowserRouter>
    </QueryClientProvider>,
  );
}

describe("Display", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("F1.3.1 - No Current Ticket", async () => {
    renderWithProviders(<Display />);

    await screen.findByText("Currently Serving");

    expect(screen.getByText("Currently Serving")).toBeInTheDocument();
    expect(screen.getByText("—")).toBeInTheDocument();
  });

  it("F1.3.2 - Shows Current Ticket", async () => {
    const mockTicket: Ticket = {
      id: "PRI-001",
      type: TICKET_TYPE.PRIORITY,
      status: TICKET_STATUS.CALLED,
      callCount: 1,
      createdAt: new Date(TEST_DEFAULT_DATE_STRING),
    };

    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({
            currentTicket: mockTicket,
            recentCalls: [],
            waitingTickets: { CONVENTIONAL: 0, PRIORITY: 0 },
          }),
      }),
    );

    renderWithProviders(<Display />);

    await waitFor(() => {
      expect(screen.getByText("PRI-001")).toBeInTheDocument();
      expect(screen.getByText(/PRIORITY/)).toHaveTextContent(
        "PRIORITY · Call #1",
      );
    });
  });

  it("F1.3.3 - Shows In Service for IN_PROGRESS", async () => {
    const mockTicket: Ticket = {
      id: "PRI-001",
      type: TICKET_TYPE.PRIORITY,
      status: TICKET_STATUS.IN_PROGRESS,
      callCount: 1,
      createdAt: new Date(TEST_DEFAULT_DATE_STRING),
    };

    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({
            currentTicket: mockTicket,
            recentCalls: [],
            waitingTickets: { CONVENTIONAL: 0, PRIORITY: 0 },
          }),
      }),
    );

    renderWithProviders(<Display />);

    await waitFor(() => {
      expect(screen.getByText("PRI-001")).toBeInTheDocument();
    });

    expect(screen.getByText(/In Service/)).toBeInTheDocument();
  });

  it("F1.3.4 - Shows Absent for ABSENT Ticket", async () => {
    const mockTicket: Ticket = {
      id: "PRI-001",
      type: TICKET_TYPE.PRIORITY,
      status: TICKET_STATUS.ABSENT,
      callCount: 1,
      createdAt: new Date(TEST_DEFAULT_DATE_STRING),
    };

    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({
            currentTicket: mockTicket,
            recentCalls: [],
            waitingTickets: { CONVENTIONAL: 0, PRIORITY: 0 },
          }),
      }),
    );

    renderWithProviders(<Display />);

    await screen.findByText("PRI-001");
    expect(screen.getByText(/Absent/)).toBeInTheDocument();
  });

  it("F1.3.5 - Waiting Counts", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({
            currentTicket: undefined,
            recentCalls: [],
            waitingTickets: { CONVENTIONAL: 5, PRIORITY: 3 },
          }),
      }),
    );

    renderWithProviders(<Display />);

    const waitingStandard = await screen.findByText("Waiting - Standard");
    const waitingPriority = await screen.findByText("Waiting - Priority");

    expect(waitingStandard.parentElement).toHaveTextContent(
      "Waiting - Standard5",
    );
    expect(waitingPriority.parentElement).toHaveTextContent(
      "Waiting - Priority3",
    );
  });

  it("F1.3.6 - Recent Calls List", async () => {
    const mockRecentCalls: Ticket[] = [
      {
        id: "CON-001",
        type: TICKET_TYPE.CONVENTIONAL,
        status: TICKET_STATUS.COMPLETED,
        callCount: 1,
        createdAt: new Date(TEST_DEFAULT_DATE_STRING),
        calledAt: new Date("2026-01-01T01:00:00.000Z"),
      },
      {
        id: "PRI-002",
        type: TICKET_TYPE.PRIORITY,
        status: TICKET_STATUS.COMPLETED,
        callCount: 2,
        createdAt: new Date(TEST_DEFAULT_DATE_STRING),
        calledAt: new Date("2026-01-01T02:00:00.000Z"),
      },
      {
        id: "CON-003",
        type: TICKET_TYPE.CONVENTIONAL,
        status: TICKET_STATUS.COMPLETED,
        callCount: 1,
        createdAt: new Date(TEST_DEFAULT_DATE_STRING),
        calledAt: new Date("2026-01-01T03:00:00.000Z"),
      },
    ];

    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({
            currentTicket: undefined,
            recentCalls: mockRecentCalls,
            waitingTickets: { CONVENTIONAL: 0, PRIORITY: 0 },
          }),
      }),
    );

    renderWithProviders(<Display />);

    const tickets = await screen.findAllByText(/CON-001|PRI-002|CON-003/);

    expect(tickets).toHaveLength(3);
    expect(tickets[0]).toHaveTextContent("CON-001");
    expect(tickets[1]).toHaveTextContent("PRI-002");
    expect(tickets[2]).toHaveTextContent("CON-003");
  });

  it("F1.3.7 - No Recent Calls When Empty", async () => {
    renderWithProviders(<Display />);

    await screen.findByText("Queue Status");

    await waitFor(() => {
      expect(screen.getByText("No recent calls")).toBeInTheDocument();
    });
  });

  it("F1.3.8 - ABSENT Ticket Highlighted in Recent Calls", async () => {
    const mockRecentCalls: Ticket[] = [
      {
        id: "PRI-001",
        type: TICKET_TYPE.PRIORITY,
        status: TICKET_STATUS.ABSENT,
        callCount: 1,
        createdAt: new Date(TEST_DEFAULT_DATE_STRING),
        calledAt: new Date("2026-01-01T01:00:00.000Z"),
      },
    ];

    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({
            currentTicket: undefined,
            recentCalls: mockRecentCalls,
            waitingTickets: { CONVENTIONAL: 0, PRIORITY: 0 },
          }),
      }),
    );

    renderWithProviders(<Display />);

    const absentChip = await screen.findByText("Absent");

    expect(absentChip).toBeInTheDocument();

    const ticketRow = absentChip.parentElement?.parentElement?.parentElement;

    expect(ticketRow).toHaveStyle("background-color: rgb(239, 83, 80)");
  });

  it("F1.3.9 - Loading State", () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({
            isLoading: true,
          }),
      }),
    );

    renderWithProviders(<Display />);

    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });
});
