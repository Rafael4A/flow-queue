import { jwtDecode } from "jwt-decode";
import {
  createContext,
  useContext,
  useState,
  type PropsWithChildren,
} from "react";
import type { AuthPayload } from "shared-code";

type AuthContextType = {
  auth?: AuthPayload;
  refreshAuth: () => void;
};

//eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext<AuthContextType | null>(null);

//eslint-disable-next-line react-refresh/only-export-components
export function useAuthContext() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuthContext must be used within a AuthProvider");
  }
  return context;
}

function getCookie(name: string) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(";").shift();
}

export function AuthProvider({ children }: Readonly<PropsWithChildren>) {
  const getAuthFromCookie = () => {
    const token = getCookie("token");
    return token ? jwtDecode<AuthPayload>(token) : undefined;
  };

  const [auth, setAuth] = useState<AuthPayload | undefined>(
    getAuthFromCookie(),
  );

  const refreshAuth = () => {
    setAuth(getAuthFromCookie());
  };

  return <AuthContext value={{ auth, refreshAuth }}>{children}</AuthContext>;
}
