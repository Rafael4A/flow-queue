import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router";
import { TICKET_TYPE, type PublicQueueView } from "shared-code";
import { describe, expect, it, vi } from "vitest";
import { QueueContext, SocketProvider } from "../contexts";
import { Totem } from "./Totem";

const mockIssueTicket = vi.fn();

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
  queue: PublicQueueView = {
    currentTicket: undefined,
    recentCalls: [],
    waitingTickets: { CONVENTIONAL: 0, PRIORITY: 0 },
  },
  isLoading = false,
) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <SocketProvider>
          <QueueContext
            value={{
              queue,
              isLoading,
              refetch: () => {},
              clearData: () => {},
            }}
          >
            {ui}
          </QueueContext>
        </SocketProvider>
      </BrowserRouter>
    </QueryClientProvider>,
  );
}

describe("Totem", () => {
  it("F1.1.1 - Totem Renders Ticket Options", () => {
    renderWithProviders(<Totem />);
    expect(screen.getByText("Standard Ticket")).toBeInTheDocument();
    expect(screen.getByText("Priority Ticket")).toBeInTheDocument();
  });

  it("F1.1.2 - Totem - Conventional Ticket Issue", async () => {
    vi.spyOn(globalThis, "fetch");
    renderWithProviders(<Totem />);

    await waitFor(() => {
      const cards = screen.getAllByRole("button");

      fireEvent.click(cards[0]);
    });

    expect(fetch).toHaveBeenCalledWith("/api/totem/tickets/issue", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ticketType: TICKET_TYPE.CONVENTIONAL }),
      credentials: "include",
    });
  });

  it("F1.1.3 - Totem - Priority Ticket Issue", async () => {
    vi.spyOn(globalThis, "fetch");
    renderWithProviders(<Totem />);

    await waitFor(() => {
      const cards = screen.getAllByRole("button");

      fireEvent.click(cards[1]);
    });

    expect(fetch).toHaveBeenCalledWith("/api/totem/tickets/issue", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ticketType: TICKET_TYPE.PRIORITY }),
      credentials: "include",
    });
  });

  it("F1.1.4 - Totem - Shows Waiting Counts", () => {
    renderWithProviders(<Totem />, {
      currentTicket: undefined,
      recentCalls: [],
      waitingTickets: { CONVENTIONAL: 5, PRIORITY: 3 },
    });

    expect(screen.getByText("5 people waiting")).toBeInTheDocument();
    expect(screen.getByText("3 people waiting")).toBeInTheDocument();
  });

  it("F1.1.5 - Totem - Queue Summary Chips", () => {
    renderWithProviders(<Totem />, {
      currentTicket: undefined,
      recentCalls: [],
      waitingTickets: { CONVENTIONAL: 5, PRIORITY: 3 },
    });

    expect(screen.getByText("Standard: 5")).toBeInTheDocument();
    expect(screen.getByText("Priority: 3")).toBeInTheDocument();
  });

  it("F1.1.6 - Card Disabled During Mutation", () => {
    mockIssueTicket.mockReturnValue({
      promise: {
        then: vi.fn(),
      },
    });

    renderWithProviders(<Totem />);

    const cards = screen.getAllByRole("button");

    fireEvent.click(cards[0] as Element);

    waitFor(() => {
      expect(cards[0]).toBeDisabled();
      expect(cards[1]).toBeDisabled();
    });
  });

  it("F1.1.7 - Totem - Loading State", () => {
    renderWithProviders(<Totem />, {}, true);

    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });
});
