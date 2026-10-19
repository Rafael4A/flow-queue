import { Navigate, Outlet, Route, Routes } from "react-router";
import { USER_ROLE, type UserRole } from "shared-code";
import { useAuthContext } from "./contexts";
import { Desk, Display, LogIn, Totem } from "./pages";

export function RequireRole({ allowedRole }: { allowedRole: UserRole }) {
  const { auth } = useAuthContext();

  return auth?.role !== allowedRole ? (
    <Navigate to="/login" replace />
  ) : (
    <Outlet />
  );
}

export function AppRoutes() {
  return (
    <Routes>
      <Route index element={<Display />} />

      <Route path="login" element={<LogIn />} />

      <Route element={<RequireRole allowedRole={USER_ROLE.DESK} />}>
        <Route path="desk" element={<Desk />} />
      </Route>

      <Route element={<RequireRole allowedRole={USER_ROLE.TOTEM} />}>
        <Route path="totem" element={<Totem />} />
      </Route>
    </Routes>
  );
}
