import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router";
import { TEST_DESK_1_ACCOUNT, TEST_TOTEM_ACCOUNT } from "shared-code";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AuthContext } from "../contexts";
import { LogIn } from "./LogIn";

const mockNavigate = vi.fn();
const mockRefreshAuth = vi.fn();

vi.mock("react-router", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react-router")>();
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

function renderWithProviders(ui: React.ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthContext value={{ auth: undefined, refreshAuth: mockRefreshAuth }}>
          {ui}
        </AuthContext>
      </BrowserRouter>
    </QueryClientProvider>,
  );
}

describe("LogIn", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("F1.4.1 - Login Form Renders", () => {
    renderWithProviders(<LogIn />);

    expect(screen.getByTestId("login-title")).toBeInTheDocument();
    expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
  });

  it("F1.4.2 - Login - Redirects to /desk for DESK Role", async () => {
    renderWithProviders(<LogIn />);

    const usernameInput = screen.getByLabelText(/username/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const button = screen.getByRole("button", { name: /sign in/i });

    fireEvent.change(usernameInput, {
      target: { value: TEST_DESK_1_ACCOUNT.subject },
    });
    fireEvent.change(passwordInput, {
      target: { value: TEST_DESK_1_ACCOUNT.password },
    });
    fireEvent.click(button);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/desk");
    });
  });

  it("F1.4.3 - Login - Redirects to /totem for TOTEM Role", async () => {
    renderWithProviders(<LogIn />);

    const usernameInput = screen.getByLabelText(/username/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const button = screen.getByRole("button", { name: /sign in/i });

    fireEvent.change(usernameInput, {
      target: { value: TEST_TOTEM_ACCOUNT.subject },
    });
    fireEvent.change(passwordInput, {
      target: { value: TEST_TOTEM_ACCOUNT.password },
    });
    fireEvent.click(button);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/totem");
    });
  });

  it("F1.4.4 - Button Disabled When Fields Empty", () => {
    renderWithProviders(<LogIn />);
    const button = screen.getByRole("button", { name: /sign in/i });
    expect(button).toBeDisabled();
  });

  it("F1.4.5 - Button Shows Loading State", () => {
    renderWithProviders(<LogIn />);

    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: () =>
          new Promise((resolve) =>
            setTimeout(() => resolve({ token: "mockToken" }), 5_000),
          ),
      }),
    );

    const usernameInput = screen.getByLabelText(/username/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const button = screen.getByRole("button", { name: /sign in/i });

    fireEvent.change(usernameInput, {
      target: { value: TEST_DESK_1_ACCOUNT.subject },
    });
    fireEvent.change(passwordInput, {
      target: { value: TEST_DESK_1_ACCOUNT.password },
    });
    fireEvent.click(button);

    waitFor(() => {
      expect(button).toHaveTextContent("Signing in...");
      expect(button).toBeDisabled();
      expect(usernameInput).toBeDisabled();
      expect(passwordInput).toBeDisabled();
    });
  });
});
