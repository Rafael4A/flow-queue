import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router";
import { describe, expect, it, vi } from "vitest";
import { QueueProvider, useQueueContext } from "./QueueContext";
import { SocketProvider } from "./SocketContext";

function TestComponent() {
  const { queue, isLoading } = useQueueContext();
  return (
    <div>
      <span data-testid="loading">{String(isLoading)}</span>
      {isLoading ? null : (
        <span data-testid="queue">{JSON.stringify(queue)}</span>
      )}
    </div>
  );
}

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

describe("QueueContext", () => {
  it("4.8.4 - Provides Queue Data", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          currentTicket: undefined,
          recentCalls: [],
          waitingTickets: { CONVENTIONAL: 0, PRIORITY: 0 },
        }),
    });

    renderWithProviders(<TestComponent />);

    await screen.findByTestId("queue");

    expect(screen.getByTestId("loading")).toHaveTextContent("false");
    expect(screen.getByTestId("queue")).toHaveTextContent(
      JSON.stringify({
        currentTicket: undefined,
        recentCalls: [],
        waitingTickets: { CONVENTIONAL: 0, PRIORITY: 0 },
      }),
    );
  });
});
