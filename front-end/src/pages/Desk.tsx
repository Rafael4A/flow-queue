import {
  AddCircle,
  AssignmentTurnedIn,
  Cancel,
  CheckCircle,
  PlayArrow,
  Replay,
} from "@mui/icons-material";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  Divider,
  IconButton,
  Paper,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { TICKET_STATUS } from "shared-code";
import {
  callNextRequest,
  completeServiceRequest,
  getDeskTicketRequest,
  markAbsentRequest,
  repeatCallRequest,
  requeueRequest,
  startServiceRequest,
} from "../api";
import { useQueueContext } from "../contexts";
import { useSnackAlert } from "../contexts/useSnackAlert";
import { ticketStatusToText } from "../utils";

export function Desk() {
  const { openAlert } = useSnackAlert();

  const { queue, isLoading } = useQueueContext();

  const currentTicketQuery = useQuery({
    queryKey: ["currentTicket"],
    queryFn: () => getDeskTicketRequest(),
  });

  const currentTicket = currentTicketQuery.data;

  const [requeueTicketId, setRequeueTicketId] = useState("");

  const callNextMutation = useMutation({
    mutationFn: callNextRequest,
    onSuccess: (data: any) => {
      if (data?.message)
        openAlert({ content: data.message, severity: "success" });
      currentTicketQuery.refetch();
    },
  });

  const repeatCallMutation = useMutation({
    mutationFn: repeatCallRequest,
    onSuccess: () => currentTicketQuery.refetch(),
  });

  const markAbsentMutation = useMutation({
    mutationFn: markAbsentRequest,
    onSuccess: () => currentTicketQuery.refetch(),
  });

  const startServiceMutation = useMutation({
    mutationFn: startServiceRequest,
    onSuccess: () => currentTicketQuery.refetch(),
  });

  const completeServiceMutation = useMutation({
    mutationFn: completeServiceRequest,
    onSuccess: () => currentTicketQuery.refetch(),
  });

  const requeueMutation = useMutation({
    mutationFn: requeueRequest,
    onSuccess: (data) => {
      setRequeueTicketId("");
      currentTicketQuery.refetch();
      openAlert({
        content: `Ticket ${data.id} requeued successfully`,
        severity: "success",
      });
    },
  });

  if (isLoading) {
    return (
      <Container maxWidth="md" sx={{ mt: 8, textAlign: "center" }}>
        <Typography variant="h6" color="text.secondary">
          Loading...
        </Typography>
      </Container>
    );
  }

  const waitingTickets = queue?.waitingTickets;

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography
        variant="h4"
        sx={{ fontWeight: 700, color: "primary.main", mb: 3 }}
      >
        Staff Desk
      </Typography>

      <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
        <Paper sx={{ p: 2.5, display: "flex", gap: 2, flexWrap: "wrap" }}>
          <Chip
            label={`Standard: ${waitingTickets?.CONVENTIONAL || 0}`}
            color="primary"
            variant="outlined"
          />
          <Chip
            label={`Priority: ${waitingTickets?.PRIORITY || 0}`}
            color="warning"
            variant="outlined"
          />
        </Paper>

        <Card
          sx={{
            bgcolor: currentTicket ? "primary.main" : "grey.100",
            color: currentTicket ? "white" : "text.secondary",
          }}
        >
          <CardContent>
            <Typography variant="subtitle1" sx={{ opacity: 0.9, mb: 1 }}>
              Current Ticket{" "}
              {currentTicket
                ? `(${ticketStatusToText(currentTicket.status)})`
                : ""}
            </Typography>
            {currentTicket ? (
              <>
                <Typography
                  variant="h1"
                  sx={{ fontWeight: 800, fontSize: "clamp(2rem, 5vw, 3.5rem)" }}
                >
                  {currentTicket.id}
                </Typography>
                <Divider sx={{ my: 2, bgcolor: "rgba(255,255,255,0.2)" }} />
                <Typography variant="body2" sx={{ opacity: 0.85 }}>
                  {currentTicket.type} &middot; Call #{currentTicket.callCount}
                </Typography>
              </>
            ) : (
              <Typography variant="h6">No current ticket</Typography>
            )}
          </CardContent>
        </Card>

        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          Actions
        </Typography>

        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            gap: 2,
          }}
        >
          <Tooltip title="Call Next Ticket">
            <Button
              sx={{
                flex: 1,
                minWidth: 140,
                py: 2,
                bgcolor: "primary.main",
                "&:hover": { bgcolor: "primary.dark" },
              }}
              variant="contained"
              color="primary"
              startIcon={<PlayArrow />}
              onClick={() => callNextMutation.mutate()}
              disabled={callNextMutation.isPending || !!currentTicket}
            >
              Call Next
            </Button>
          </Tooltip>

          <Tooltip title="Repeat Call">
            <Button
              sx={{ flex: 1, minWidth: 140, py: 2 }}
              variant="outlined"
              startIcon={<Replay />}
              onClick={() =>
                repeatCallMutation.mutate({
                  ticketId: currentTicket?.id || "",
                })
              }
              disabled={
                !currentTicket ||
                repeatCallMutation.isPending ||
                currentTicket?.callCount >= 3 ||
                currentTicket?.status !== TICKET_STATUS.CALLED
              }
            >
              Repeat Call
            </Button>
          </Tooltip>

          <Tooltip title="Mark Absent">
            <Button
              sx={{ flex: 1, minWidth: 140, py: 2 }}
              variant="outlined"
              color="error"
              startIcon={<Cancel />}
              onClick={() =>
                markAbsentMutation.mutate({
                  ticketId: currentTicket?.id || "",
                })
              }
              disabled={
                !currentTicket ||
                markAbsentMutation.isPending ||
                currentTicket?.status !== TICKET_STATUS.CALLED
              }
            >
              Mark Absent
            </Button>
          </Tooltip>

          <Tooltip title="Start Service">
            <Button
              sx={{ flex: 1, minWidth: 140, py: 2 }}
              variant="outlined"
              color="success"
              startIcon={<CheckCircle />}
              onClick={() =>
                startServiceMutation.mutate({
                  ticketId: currentTicket?.id || "",
                })
              }
              disabled={
                !currentTicket ||
                startServiceMutation.isPending ||
                currentTicket?.status !== TICKET_STATUS.CALLED
              }
            >
              Start Service
            </Button>
          </Tooltip>

          <Tooltip title="Complete Service">
            <Button
              sx={{ flex: 1, minWidth: 140, py: 2 }}
              variant="outlined"
              startIcon={<AssignmentTurnedIn />}
              onClick={() =>
                completeServiceMutation.mutate({
                  ticketId: currentTicket?.id || "",
                })
              }
              disabled={
                !currentTicket ||
                completeServiceMutation.isPending ||
                currentTicket?.status !== TICKET_STATUS.IN_PROGRESS
              }
            >
              Complete
            </Button>
          </Tooltip>

          <Stack direction="column" sx={{ width: "100%", gap: 1 }}>
            <Typography>Requeue Ticket:</Typography>
            <Box sx={{ display: "flex", gap: 1, flex: 1, minWidth: 140 }}>
              <TextField
                fullWidth
                size="small"
                placeholder="Ticket ID"
                value={requeueTicketId}
                onChange={(e) =>
                  setRequeueTicketId(e.target.value.toLocaleUpperCase())
                }
                disabled={requeueMutation.isPending}
                variant="outlined"
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
              />
              <Tooltip title="Requeue Ticket">
                <IconButton
                  color="primary"
                  onClick={() =>
                    requeueMutation.mutate({ ticketId: requeueTicketId })
                  }
                  disabled={!requeueTicketId || requeueMutation.isPending}
                  sx={{
                    bgcolor: "primary.main",
                    color: "white",
                    "&:hover": { bgcolor: "primary.dark" },
                  }}
                >
                  <AddCircle />
                </IconButton>
              </Tooltip>
            </Box>
          </Stack>
        </Box>
      </Box>
    </Container>
  );
}
