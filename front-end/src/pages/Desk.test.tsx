import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router";
import {
  TICKET_STATUS,
  TICKET_TYPE,
  type PublicQueueView,
  type Ticket,
} from "shared-code";
import { afterEach, describe, expect, it, vi } from "vitest";
import { QueueProvider, SocketProvider } from "../contexts";
import { TEST_DEFAULT_DATE_STRING } from "../testSetup";
import { Desk } from "./Desk";

vi.mock("../contexts/useSnackAlert", () => ({
  useSnackAlert: () => ({ openAlert: vi.fn() }),
}));

vi.mock("socket.io-client", () => ({
  default: vi.fn(() => ({
    on: vi.fn(),
    off: vi.fn(),
    disconnect: vi.fn(),
    emit: vi.fn(),
  })),
}));

function renderWithProviders(
  ui: React.ReactElement,
  mockDeskTicket: Ticket | null = null,
  mockQueueView: PublicQueueView | null = null,
) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  vi.stubGlobal(
    "fetch",
    vi.fn().mockImplementation(async (...args: any[]) => {
      const [url] = args;
      if (typeof url === "string" && url.includes("/api/desk/ticket")) {
        return {
          ok: true,
          json: () => Promise.resolve(mockDeskTicket),
        };
      }
      if (typeof url === "string" && url.includes("/api/queue/public")) {
        return {
          ok: true,
          json: () =>
            Promise.resolve(
              mockQueueView || {
                currentTicket: mockDeskTicket || undefined,
                recentCalls: [],
                waitingTickets: { CONVENTIONAL: 0, PRIORITY: 0 },
              },
            ),
        };
      }
      return { ok: false };
    }),
  );

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

describe("Desk", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("F1.2.1 - Desk Renders with No Current Ticket", async () => {
    renderWithProviders(<Desk />);
    await screen.findByText("Staff Desk");
    expect(screen.getByText("Staff Desk")).toBeInTheDocument();
    expect(screen.getByText("No current ticket")).toBeInTheDocument();
  });

  it("F1.2.2 - Desk - Call Next Button Disabled When Ticket Exists", async () => {
    const mockTicket: Ticket = {
      id: "CON-001",
      type: TICKET_TYPE.CONVENTIONAL,
      status: TICKET_STATUS.CALLED,
      callCount: 1,
      createdAt: new Date(TEST_DEFAULT_DATE_STRING),
    };

    renderWithProviders(<Desk />, mockTicket);

    await screen.findByText("CON-001");
    const callNextBtn = await screen.findByRole("button", {
      name: /call next/i,
    });
    expect(callNextBtn).toBeDisabled();
  });

  it("F1.2.3 - Desk - Call Next Button Enabled When No Ticket", async () => {
    renderWithProviders(<Desk />);

    const callNextBtn = await screen.findByRole("button", {
      name: /call next/i,
    });
    expect(callNextBtn).toBeEnabled();
  });

  it("F1.2.4 - Desk - Repeat Call Enabled for CALLED Ticket with callCount < 3", async () => {
    const mockTicket: Ticket = {
      id: "PRI-001",
      type: TICKET_TYPE.PRIORITY,
      status: TICKET_STATUS.CALLED,
      callCount: 1,
      createdAt: new Date(TEST_DEFAULT_DATE_STRING),
    };

    renderWithProviders(<Desk />, mockTicket);

    await screen.findByText("PRI-001");
    const repeatCallBtn = await screen.findByRole("button", {
      name: /repeat call/i,
    });
    expect(repeatCallBtn).toBeEnabled();
  });

  it("F1.2.5 - Desk - Repeat Call Disabled When callCount = 3", async () => {
    const mockTicket: Ticket = {
      id: "PRI-001",
      type: TICKET_TYPE.PRIORITY,
      status: TICKET_STATUS.CALLED,
      callCount: 3,
      createdAt: new Date(TEST_DEFAULT_DATE_STRING),
    };

    renderWithProviders(<Desk />, mockTicket);

    const repeatCallBtn = await screen.findByRole("button", {
      name: /repeat call/i,
    });
    expect(repeatCallBtn).toBeDisabled();
  });

  it("F1.2.6 - Desk - Repeat Call Disabled When Not CALLED", async () => {
    const mockTicket: Ticket = {
      id: "PRI-001",
      type: TICKET_TYPE.PRIORITY,
      status: TICKET_STATUS.IN_PROGRESS,
      callCount: 1,
      createdAt: new Date(TEST_DEFAULT_DATE_STRING),
    };

    renderWithProviders(<Desk />, mockTicket);

    const repeatCallBtn = await screen.findByRole("button", {
      name: /repeat call/i,
    });
    expect(repeatCallBtn).toBeDisabled();
  });

  it("F1.2.7 - Desk - Mark Absent Enabled for CALLED Ticket", async () => {
    const mockTicket: Ticket = {
      id: "PRI-001",
      type: TICKET_TYPE.PRIORITY,
      status: TICKET_STATUS.CALLED,
      callCount: 1,
      createdAt: new Date(TEST_DEFAULT_DATE_STRING),
    };

    renderWithProviders(<Desk />, mockTicket);

    await screen.findByText("PRI-001");
    const markAbsentBtn = await screen.findByRole("button", {
      name: /mark absent/i,
    });
    expect(markAbsentBtn).toBeEnabled();
  });

  it("F1.2.8 - Desk - Mark Absent Disabled When Not CALLED", async () => {
    const mockTicket: Ticket = {
      id: "PRI-001",
      type: TICKET_TYPE.PRIORITY,
      status: TICKET_STATUS.IN_PROGRESS,
      callCount: 1,
      createdAt: new Date(TEST_DEFAULT_DATE_STRING),
    };

    renderWithProviders(<Desk />, mockTicket);

    const markAbsentBtn = await screen.findByRole("button", {
      name: /mark absent/i,
    });
    expect(markAbsentBtn).toBeDisabled();
  });

  it("F1.2.9 - Desk - Start Service Enabled for CALLED Ticket", async () => {
    const mockTicket: Ticket = {
      id: "PRI-001",
      type: TICKET_TYPE.PRIORITY,
      status: TICKET_STATUS.CALLED,
      callCount: 1,
      createdAt: new Date(TEST_DEFAULT_DATE_STRING),
    };

    renderWithProviders(<Desk />, mockTicket);

    await screen.findByText("PRI-001");
    const startServiceBtn = await screen.findByRole("button", {
      name: /start service/i,
    });
    expect(startServiceBtn).toBeEnabled();
  });

  it("F1.2.10 - Desk - Start Service Disabled When Not CALLED", async () => {
    const mockTicket: Ticket = {
      id: "PRI-001",
      type: TICKET_TYPE.PRIORITY,
      status: TICKET_STATUS.IN_PROGRESS,
      callCount: 1,
      createdAt: new Date(TEST_DEFAULT_DATE_STRING),
    };

    renderWithProviders(<Desk />, mockTicket);

    const startServiceBtn = await screen.findByRole("button", {
      name: /start service/i,
    });
    expect(startServiceBtn).toBeDisabled();
  });

  it("F1.2.11 - Desk - Complete Button Enabled for IN_PROGRESS Ticket", async () => {
    const mockTicket: Ticket = {
      id: "PRI-001",
      type: TICKET_TYPE.PRIORITY,
      status: TICKET_STATUS.IN_PROGRESS,
      callCount: 1,
      createdAt: new Date(TEST_DEFAULT_DATE_STRING),
    };

    renderWithProviders(<Desk />, mockTicket);

    await screen.findByText("PRI-001");
    const completeBtn = await screen.findByRole("button", {
      name: /complete/i,
    });
    expect(completeBtn).toBeEnabled();
  });

  it("F1.2.12 - Desk - Complete Button Disabled When Not IN_PROGRESS", async () => {
    const mockTicket: Ticket = {
      id: "PRI-001",
      type: TICKET_TYPE.PRIORITY,
      status: TICKET_STATUS.CALLED,
      callCount: 1,
      createdAt: new Date(TEST_DEFAULT_DATE_STRING),
    };

    renderWithProviders(<Desk />, mockTicket);

    const completeBtn = await screen.findByRole("button", {
      name: /complete/i,
    });
    expect(completeBtn).toBeDisabled();
  });

  it("F1.2.13 - Desk - Shows Current Ticket Info", async () => {
    const mockTicket: Ticket = {
      id: "PRI-001",
      type: TICKET_TYPE.PRIORITY,
      status: TICKET_STATUS.CALLED,
      callCount: 1,
      createdAt: new Date(TEST_DEFAULT_DATE_STRING),
    };

    renderWithProviders(<Desk />, mockTicket);

    expect(await screen.findByText("PRI-001")).toBeInTheDocument();
    expect(screen.getByText(/PRIORITY · Call #1/)).toBeInTheDocument();
    expect(screen.getByText(/Called/)).toBeInTheDocument();
  });

  it("F1.2.14 - Desk - Call Next Button Calls Correct Mutation", async () => {
    vi.spyOn(globalThis, "fetch");
    renderWithProviders(<Desk />);

    const callNextBtn = await screen.findByRole("button", {
      name: /call next/i,
    });
    fireEvent.click(callNextBtn);

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith("/api/desk/tickets/call-next", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
    });
  });

  it("F1.2.15 - Desk - Repeat Call Button Calls Correct Mutation", async () => {
    const mockTicket: Ticket = {
      id: "CON-001",
      type: TICKET_TYPE.CONVENTIONAL,
      status: TICKET_STATUS.CALLED,
      callCount: 1,
      createdAt: new Date(TEST_DEFAULT_DATE_STRING),
    };

    vi.spyOn(globalThis, "fetch");
    renderWithProviders(<Desk />, mockTicket);

    const repeatCallBtn = await screen.findByRole("button", {
      name: /repeat call/i,
    });

    fireEvent.click(repeatCallBtn);

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith("/api/desk/tickets/repeat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ ticketId: "CON-001" }),
      });
    });
  });

  it("F1.2.16 - Desk - Mark Absent Button Calls Correct Mutation", async () => {
    const mockTicket: Ticket = {
      id: "CON-001",
      type: TICKET_TYPE.CONVENTIONAL,
      status: TICKET_STATUS.CALLED,
      callCount: 1,
      createdAt: new Date(TEST_DEFAULT_DATE_STRING),
    };

    vi.spyOn(globalThis, "fetch");
    renderWithProviders(<Desk />, mockTicket);

    const repeatCallBtn = await screen.findByRole("button", {
      name: /mark absent/i,
    });

    fireEvent.click(repeatCallBtn);

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith("/api/desk/tickets/mark-absent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ ticketId: "CON-001" }),
      });
    });
  });

  it("F1.2.17 - Desk - Start Service Button Calls Correct Mutation", async () => {
    const mockTicket: Ticket = {
      id: "CON-001",
      type: TICKET_TYPE.CONVENTIONAL,
      status: TICKET_STATUS.CALLED,
      callCount: 1,
      createdAt: new Date(TEST_DEFAULT_DATE_STRING),
    };

    vi.spyOn(globalThis, "fetch");
    renderWithProviders(<Desk />, mockTicket);

    const repeatCallBtn = await screen.findByRole("button", {
      name: /start service/i,
    });

    fireEvent.click(repeatCallBtn);

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith("/api/desk/tickets/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ ticketId: "CON-001" }),
      });
    });
  });

  it("F1.2.18 - Desk - Complete Button Calls Correct Mutation", async () => {
    const mockTicket: Ticket = {
      id: "CON-001",
      type: TICKET_TYPE.CONVENTIONAL,
      status: TICKET_STATUS.IN_PROGRESS,
      callCount: 1,
      createdAt: new Date(TEST_DEFAULT_DATE_STRING),
    };

    vi.spyOn(globalThis, "fetch");
    renderWithProviders(<Desk />, mockTicket);

    const repeatCallBtn = await screen.findByRole("button", {
      name: /complete/i,
    });

    fireEvent.click(repeatCallBtn);

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith("/api/desk/tickets/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ ticketId: "CON-001" }),
      });
    });
  });

  it("F1.2.19 - Desk - Requeue Input and Button", async () => {
    vi.spyOn(globalThis, "fetch");
    renderWithProviders(<Desk />);

    const requeueInput = await screen.findByPlaceholderText(/ticket id/i);
    const requeueBtn = await screen.findByRole("button", {
      name: /requeue ticket/i,
    });

    fireEvent.change(requeueInput, { target: { value: "PRI-001" } });
    fireEvent.click(requeueBtn);

    await waitFor(() => {
      expect(requeueInput).toHaveValue("");
      expect(requeueBtn).toBeDisabled();

      expect(fetch).toHaveBeenCalledWith("/api/desk/tickets/requeue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ticketId: "PRI-001" }),
        credentials: "include",
      });
    });
  });

  it("F1.2.20 - Desk - Requeue Button Disabled When Input Empty", async () => {
    renderWithProviders(<Desk />, null);

    const requeueInput = await screen.findByPlaceholderText(/ticket id/i);
    const requeueBtn = await screen.findByRole("button", {
      name: /requeue ticket/i,
    });

    expect(requeueInput).toHaveValue("");
    expect(requeueBtn).toBeDisabled();
  });

  it("F1.2.21 - Desk - Waiting Counts Displayed", async () => {
    renderWithProviders(<Desk />, null, {
      currentTicket: undefined,
      recentCalls: [],
      waitingTickets: { CONVENTIONAL: 4, PRIORITY: 2 },
    });

    await waitFor(() => {
      expect(screen.getByText("Standard: 4")).toBeInTheDocument();
      expect(screen.getByText("Priority: 2")).toBeInTheDocument();
    });
  });
});
