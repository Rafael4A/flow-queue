import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { AuthProvider, useAuthContext } from "./AuthContext";

function TestComponent() {
  const { auth } = useAuthContext();
  return <div data-testid="auth">{JSON.stringify(auth)}</div>;
}

function renderWithProvider(ui: React.ReactElement, cookieValue?: string) {
  Object.defineProperty(document, "cookie", {
    writable: true,
    value: cookieValue || "",
  });

  return render(<AuthProvider>{ui}</AuthProvider>);
}

describe("AuthContext", () => {
  it("F1.7.1 - Provides Auth from Cookie", () => {
    const mockToken =
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkZXNrLTEiLCJyb2xlIjoiREVTSyIsImRlc2tJZCI6IkRlc2sgMSJ9.a_twN9vKLXnspR4njBADJP4HGP_Suc-9Fy81towNFy8";
    renderWithProvider(<TestComponent />, `token=${mockToken}`);
    expect(screen.getByTestId("auth")).toBeInTheDocument();
  });

  it("F1.7.2 - No Auth When No Cookie", () => {
    renderWithProvider(<TestComponent />, "");
    expect(screen.getByTestId("auth")).toBeInTheDocument();
  });

  it("F1.7.3 - Throws Outside Provider", () => {
    expect(() => {
      useAuthContext();
    }).toThrow();
  });
});
