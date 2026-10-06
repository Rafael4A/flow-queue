import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router";
import type { AuthPayload } from "shared-code";
import { describe, expect, it, vi } from "vitest";
import { AuthContext, QueueContext, SocketProvider } from "../contexts";
import { Totem } from "./Totem";

const mockNavigate = vi.fn();
const mockIssueTicket = vi.fn();

vi.mock("react-router", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react-router")>();
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

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
  auth: AuthPayload = {
    sub: "totem-main",
    role: "TOTEM",
  },
  queue = {
    currentTicket: undefined,
    recentCalls: [],
    waitingTickets: { CONVENTIONAL: 0, PRIORITY: 0 },
  },
) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <SocketProvider>
          <AuthContext value={{ auth }}>
            <QueueContext
              value={{
                queue,
                isLoading: false,
                refetch: () => {},
                clearData: () => {},
              }}
            >
              {ui}
            </QueueContext>
          </AuthContext>
        </SocketProvider>
      </BrowserRouter>
    </QueryClientProvider>,
  );
}

describe("Totem", () => {
  it("4.2.1 - Totem Renders Ticket Options", () => {
    renderWithProviders(<Totem />);
    expect(screen.getByText("Standard Ticket")).toBeInTheDocument();
    expect(screen.getByText("Priority Ticket")).toBeInTheDocument();
  });

  it("4.2.2 - Totem Redirects When Not Authenticated", () => {
    renderWithProviders(<Totem />, {
      sub: "desk-1",
      role: "DESK",
      deskId: "Desk 1",
    });
    expect(mockNavigate).toHaveBeenCalledWith("/login");
  });

  it("4.2.5 - Totem - Shows Waiting Counts", () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          currentTicket: undefined,
          recentCalls: [],
          waitingTickets: { CONVENTIONAL: 5, PRIORITY: 3 },
        }),
    });

    renderWithProviders(<Totem />);

    waitFor(() => {
      expect(screen.getByText("5 people waiting")).toBeInTheDocument();
      expect(screen.getByText("3 people waiting")).toBeInTheDocument();
    });
  });

  it("4.2.6 - Totem - Queue Summary Chips", () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          currentTicket: undefined,
          recentCalls: [],
          waitingTickets: { CONVENTIONAL: 5, PRIORITY: 3 },
        }),
    });

    renderWithProviders(<Totem />);

    waitFor(() => {
      expect(screen.getByText("Standard: 5")).toBeInTheDocument();
      expect(screen.getByText("Priority: 3")).toBeInTheDocument();
    });
  });

  it("4.2.7 - Card Disabled During Mutation", async () => {
    mockIssueTicket.mockReturnValue({
      promise: {
        then: vi.fn(),
      },
    });

    renderWithProviders(<Totem />);

    const cards = document.querySelectorAll("[role='button'], button");

    fireEvent.click(cards[0] as Element);

    waitFor(() => {
      expect(cards[0]).toBeDisabled();
      expect(cards[1]).toBeDisabled();
    });
  });
});
