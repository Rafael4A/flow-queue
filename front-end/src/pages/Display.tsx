import {
  Box,
  Card,
  CardContent,
  Chip,
  Container,
  Divider,
  Paper,
  Typography,
} from "@mui/material";
import { TICKET_STATUS, TICKET_TYPE } from "shared-code";
import { useQueueContext } from "../contexts";

export function Display() {
  const { queue, isLoading } = useQueueContext();

  if (isLoading) {
    return (
      <Container maxWidth="sm" sx={{ mt: 8, textAlign: "center" }}>
        <Typography variant="h6" color="text.secondary">
          Loading...
        </Typography>
      </Container>
    );
  }

  const currentTicket = queue?.currentTicket;
  const waitingTickets = queue?.waitingTickets;

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography
        variant="h3"
        component="h1"
        sx={{
          fontWeight: 700,
          color: "primary.main",
          mb: 4,
          textAlign: "center",
        }}
      >
        Queue Status
      </Typography>

      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 3,
        }}
      >
        <Card
          sx={{
            bgcolor: currentTicket ? "primary.main" : "grey.100",
            color: currentTicket ? "white" : "text.secondary",
            textAlign: "center",
            py: 4,
          }}
        >
          <CardContent>
            <Typography variant="body1" sx={{ mb: 1, opacity: 0.9 }}>
              Currently Serving
            </Typography>
            <Typography
              variant="h1"
              sx={{
                fontWeight: 800,
                fontSize: "clamp(3rem, 8vw, 6rem)",
                lineHeight: 1,
              }}
            >
              {currentTicket?.id || "—"}
            </Typography>
            {currentTicket && (
              <>
                <Divider sx={{ my: 2, bgcolor: "rgba(255,255,255,0.2)" }} />
                <Typography variant="body2" sx={{ opacity: 0.85 }}>
                  {currentTicket.type} &middot; Call #{currentTicket.callCount}
                  {currentTicket.status === TICKET_STATUS.IN_PROGRESS &&
                    " \u2022 In Service"}
                  {currentTicket.status === TICKET_STATUS.ABSENT &&
                    " \u2022 Absent"}
                </Typography>
              </>
            )}
          </CardContent>
        </Card>

        <Box
          sx={{
            display: "flex",
            gap: 3,
            flexWrap: "wrap",
          }}
        >
          <Paper
            sx={{
              flex: 1,
              minWidth: 200,
              p: 3,
              textAlign: "center",
            }}
          >
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              Waiting - Standard
            </Typography>
            <Typography
              variant="h1"
              sx={{ fontWeight: 700, color: "text.primary" }}
            >
              {waitingTickets?.CONVENTIONAL || 0}
            </Typography>
          </Paper>

          <Paper
            sx={{
              flex: 1,
              minWidth: 200,
              p: 3,
              textAlign: "center",
            }}
          >
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              Waiting - Priority
            </Typography>
            <Typography
              variant="h1"
              sx={{ fontWeight: 700, color: "warning.main" }}
            >
              {waitingTickets?.PRIORITY || 0}
            </Typography>
          </Paper>
        </Box>
      </Box>

      <Box sx={{ mt: 4 }}>
        <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
          Recent Calls
        </Typography>

        <Paper variant="outlined">
          {queue?.recentCalls && queue.recentCalls.length > 0 ? (
            queue.recentCalls.map((ticket, index) => (
              <Box key={ticket.id}>
                <Box
                  sx={{
                    p: 2,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    bgcolor:
                      ticket.status === TICKET_STATUS.ABSENT
                        ? "error.light"
                        : "background.default",
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <Chip
                      label={ticket.id}
                      sx={{
                        fontWeight: 700,
                        fontSize: "1rem",
                        bgcolor:
                          ticket.type === TICKET_TYPE.PRIORITY
                            ? "warning.main"
                            : "primary.main",
                        color: "white",
                      }}
                    />
                    <Typography variant="body1">{ticket.type}</Typography>
                  </Box>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      {ticket.calledAt?.toLocaleString() || "N/A"}
                    </Typography>
                    {ticket.status === TICKET_STATUS.ABSENT && (
                      <Chip
                        label="Absent"
                        size="small"
                        color="error"
                        sx={{ fontWeight: 600 }}
                      />
                    )}
                  </Box>
                </Box>
                {index < (queue.recentCalls?.length ?? 1 - 1) && <Divider />}
              </Box>
            ))
          ) : (
            <Box sx={{ p: 3, textAlign: "center" }}>
              <Typography variant="body2" color="text.secondary">
                No recent calls
              </Typography>
            </Box>
          )}
        </Paper>
      </Box>
    </Container>
  );
}
