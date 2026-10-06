import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router";
import { describe, expect, it, vi } from "vitest";
import { LogIn } from "./LogIn";

const mockNavigate = vi.fn();

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
      <BrowserRouter>{ui}</BrowserRouter>
    </QueryClientProvider>,
  );
}

describe("LogIn", () => {
  it("4.5.1 - Login Form Renders", () => {
    renderWithProviders(<LogIn />);

    expect(screen.getByTestId("login-title")).toBeInTheDocument();
    expect(screen.getByLabelText("Username *")).toBeInTheDocument();
    expect(screen.getByLabelText("Password *")).toBeInTheDocument();
  });

  it("4.5.4 - Button Disabled When Fields Empty", () => {
    renderWithProviders(<LogIn />);
    const button = screen.getByRole("button", { name: /sign in/i });
    expect(button).toBeDisabled();
  });

  it("4.5.5 - Button Shows Loading State", () => {
    renderWithProviders(<LogIn />);

    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () =>
        new Promise((resolve) =>
          setTimeout(() => resolve({ token: "mockToken" }), 5_000),
        ),
    });

    const usernameInput = screen.getByLabelText("Username *");
    const passwordInput = screen.getByLabelText("Password *");
    const button = screen.getByRole("button", { name: /sign in/i });

    fireEvent.change(usernameInput, { target: { value: "desk-1" } });
    fireEvent.change(passwordInput, { target: { value: "pwd" } });
    fireEvent.click(button);

    waitFor(() => {
      expect(button).toHaveTextContent("Signing in...");
      expect(button).toBeDisabled();
      expect(usernameInput).toBeDisabled();
      expect(passwordInput).toBeDisabled();
    });
  });
});
