import { Queue, Star } from "@mui/icons-material";
import {
  Box,
  Card,
  CardContent,
  Chip,
  Container,
  Paper,
  Typography,
} from "@mui/material";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router";
import { TICKET_TYPE, USER_ROLE } from "shared-code";
import { issueTicketRequest } from "../api";
import { useAuthContext, useQueueContext } from "../contexts";
import { useSnackAlert } from "../contexts/useSnackAlert";

export function Totem() {
  const navigate = useNavigate();
  const { auth } = useAuthContext();
  const { openAlert } = useSnackAlert();

  if (auth?.role !== USER_ROLE.TOTEM) {
    navigate("/login");
  }

  const issueTicketMutation = useMutation({
    mutationFn: issueTicketRequest,
    onSuccess: () =>
      openAlert({
        content: "Ticket issued successfully!",
        severity: "success",
      }),
  });

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

  const waitingTickets = queue?.waitingTickets;

  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <Typography
        variant="h3"
        component="h1"
        sx={{
          fontWeight: 700,
          color: "primary.main",
          textAlign: "center",
          mb: 1,
        }}
      >
        Get a Ticket
      </Typography>
      <Typography
        variant="body1"
        color="text.secondary"
        sx={{ textAlign: "center", mb: 4 }}
      >
        Choose the type of ticket you need
      </Typography>

      <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
        <Card
          sx={{
            cursor: "pointer",
            border: "2px solid",
            borderColor: "primary.main",
            bgcolor: "primary.light",
            color: "white",
            "&:hover": {
              bgcolor: "primary.main",
              borderColor: "primary.dark",
            },
            opacity: issueTicketMutation.isPending ? 0.7 : 1,
            pointerEvents: issueTicketMutation.isPending ? "none" : "auto",
          }}
          onClick={() =>
            issueTicketMutation.mutate({ ticketType: TICKET_TYPE.CONVENTIONAL })
          }
        >
          <CardContent sx={{ py: 5, textAlign: "center" }}>
            <Queue sx={{ fontSize: 64, mb: 2, opacity: 0.9 }} />
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
              Standard Ticket
            </Typography>
            <Typography variant="body1" sx={{ opacity: 0.9 }}>
              {waitingTickets?.CONVENTIONAL || 0} people waiting
            </Typography>
          </CardContent>
        </Card>

        <Card
          sx={{
            cursor: "pointer",
            border: "2px solid",
            borderColor: "warning.main",
            bgcolor: "warning.light",
            color: "white",
            "&:hover": {
              bgcolor: "warning.main",
              borderColor: "warning.dark",
            },
            opacity: issueTicketMutation.isPending ? 0.7 : 1,
            pointerEvents: issueTicketMutation.isPending ? "none" : "auto",
          }}
          onClick={() =>
            issueTicketMutation.mutate({ ticketType: TICKET_TYPE.PRIORITY })
          }
        >
          <CardContent sx={{ py: 5, textAlign: "center" }}>
            <Star sx={{ fontSize: 64, mb: 2, opacity: 0.9 }} />
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
              Priority Ticket
            </Typography>
            <Typography variant="body1" sx={{ opacity: 0.9 }}>
              {waitingTickets?.PRIORITY || 0} people waiting
            </Typography>
          </CardContent>
        </Card>
      </Box>

      <Box sx={{ mt: 4 }}>
        <Paper sx={{ p: 3 }}>
          <Typography
            variant="h6"
            sx={{ fontWeight: 600, mb: 2, textAlign: "center" }}
          >
            Queue Summary
          </Typography>
          <Box sx={{ display: "flex", justifyContent: "center", gap: 3 }}>
            <Chip
              label={`Standard: ${waitingTickets?.CONVENTIONAL || 0}`}
              color="primary"
              variant="outlined"
              sx={{ fontWeight: 600 }}
            />
            <Chip
              label={`Priority: ${waitingTickets?.PRIORITY || 0}`}
              color="warning"
              variant="outlined"
              sx={{ fontWeight: 600 }}
            />
          </Box>
        </Paper>
      </Box>
    </Container>
  );
}
