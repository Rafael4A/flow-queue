import { Box } from "@mui/material";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider, QueueProvider, SocketProvider } from "./contexts";
import { AppRoutes } from "./routes";

function App() {
  const queryClient = new QueryClient();
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <SocketProvider>
          <Box
            sx={{
              minHeight: "100vh",
              p: 2,
            }}
          >
            <QueueProvider>
              <AppRoutes />
            </QueueProvider>
          </Box>
        </SocketProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
