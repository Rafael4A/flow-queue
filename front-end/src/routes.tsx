import { Route, Routes } from "react-router";
import { Desk, Display, LogIn, Totem } from "./pages";

export function AppRoutes() {
  return (
    <Routes>
      <Route index element={<Display />} />
      <Route path="login" element={<LogIn />} />
      <Route path="desk" element={<Desk />} />
      <Route path="totem" element={<Totem />} />
    </Routes>
  );
}
