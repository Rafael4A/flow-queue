import { Box, ThemeProvider } from "@mui/material";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider, QueueProvider, SocketProvider } from "./contexts";
import { SnackAlertProvider, useSnackAlert } from "./contexts/useSnackAlert";
import { AppRoutes } from "./routes";
import { theme } from "./theme";

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
    <ThemeProvider theme={theme}>
      <SnackAlertProvider>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <SocketProvider>
              <Box
                sx={{
                  minHeight: "100vh",
                  bgcolor: "background.default",
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
    </ThemeProvider>
  );
}

function App() {
  return (
    <ThemeProvider theme={theme}>
      <SnackAlertProvider>
        <InnerApp />
      </SnackAlertProvider>
    </ThemeProvider>
  );
}

export default App;
