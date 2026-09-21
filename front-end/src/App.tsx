import { Box } from "@mui/material";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider, QueueProvider, SocketProvider } from "./contexts";
import { SnackAlertProvider, useSnackAlert } from "./contexts/useSnackAlert";
import { AppRoutes } from "./routes";

function InnerApp() {
  const { openAlert } = useSnackAlert();

  const queryClient = new QueryClient({
    defaultOptions: {
      mutations: {
        onError: (error) => {
          openAlert({
            content: error.message,
            severity: "error",
          });
        },
      },
    },
  });

  return (
    <SnackAlertProvider>
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
    </SnackAlertProvider>
  );
}

function App() {
  return (
    <SnackAlertProvider>
      <InnerApp />
    </SnackAlertProvider>
  );
}

export default App;
