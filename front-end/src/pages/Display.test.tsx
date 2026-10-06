import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router";
import { describe, expect, it, vi } from "vitest";
import { QueueProvider } from "../contexts/QueueContext";
import { SocketProvider } from "../contexts/SocketContext";
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
  it("4.4.1 - No Current Ticket", async () => {
    renderWithProviders(<Display />);

    await screen.findByText("Currently Serving");

    expect(screen.getByText("Currently Serving")).toBeInTheDocument();
  });

  it("4.4.5 - Waiting Counts", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          currentTicket: undefined,
          recentCalls: [],
          waitingTickets: { CONVENTIONAL: 5, PRIORITY: 3 },
        }),
    });

    renderWithProviders(<Display />);

    await screen.findByText("Waiting - Standard");

    expect(screen.getByText("Waiting - Standard")).toBeInTheDocument();
    expect(screen.getByText("Waiting - Priority")).toBeInTheDocument();
  });

  it("4.4.7 - No Recent Calls When Empty", async () => {
    renderWithProviders(<Display />);

    await screen.findByText("No recent calls");

    expect(screen.getByText("No recent calls")).toBeInTheDocument();
  });

  it("4.4.9 - Loading State", () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          isLoading: true,
        }),
    });

    renderWithProviders(<Display />);
  });
});
