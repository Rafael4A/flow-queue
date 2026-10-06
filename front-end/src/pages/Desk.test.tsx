import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router";
import type { AuthPayload } from "shared-code";
import { describe, expect, it, vi } from "vitest";
import { AuthContext, QueueProvider, SocketProvider } from "../contexts";
import { Desk } from "./Desk";

const mockNavigate = vi.fn();

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
    sub: "desk-1",
    role: "DESK",
    deskId: "Desk 1",
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
            <QueueProvider>{ui}</QueueProvider>
          </AuthContext>
        </SocketProvider>
      </BrowserRouter>
    </QueryClientProvider>,
  );
}

describe("Desk", () => {
  it("4.3.1 - Desk Renders with No Current Ticket", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(null),
    });

    renderWithProviders(<Desk />);
    await screen.findByText("Staff Desk");
    expect(screen.getByText("Staff Desk")).toBeInTheDocument();
  });

  it("4.3.17 - Redirects When Not Authenticated", () => {
    renderWithProviders(<Desk />, {} as AuthPayload);
    expect(mockNavigate).toHaveBeenCalledWith("/login");
  });
});
