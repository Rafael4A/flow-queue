import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  TextField,
  Typography,
} from "@mui/material";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { useNavigate } from "react-router";
import { USER_ROLE } from "shared-code";
import { logInRequest } from "../api";
import { useAuthContext } from "../contexts";

export function LogIn() {
  const navigate = useNavigate();
  const { refreshAuth } = useAuthContext();

  const logInMutation = useMutation({
    mutationFn: logInRequest,
    onSuccess: (data) => {
      refreshAuth();
      if (data.role === USER_ROLE.DESK) {
        navigate("/desk");
      } else if (data.role === USER_ROLE.TOTEM) {
        navigate("/totem");
      } else {
        alert("Invalid role");
      }
    },
  });

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.SubmitEvent) => {
    e.preventDefault();
    logInMutation.mutate({ username, password });
  };

  return (
    <Container
      maxWidth="sm"
      sx={{ height: "100vh", display: "flex", alignItems: "center" }}
    >
      <Box sx={{ width: "100%" }}>
        <Typography
          variant="h3"
          sx={{
            fontWeight: 700,
            color: "primary.main",
            textAlign: "center",
            mb: 1,
          }}
          data-testid="login-title"
        >
          Sign In
        </Typography>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ textAlign: "center", mb: 4 }}
        >
          Enter your credentials to continue
        </Typography>

        <Card>
          <CardContent sx={{ p: 4 }}>
            <form onSubmit={handleSubmit}>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
                <TextField
                  label="Username"
                  type="text"
                  fullWidth
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  variant="outlined"
                  disabled={logInMutation.isPending}
                />
                <TextField
                  label="Password"
                  type="password"
                  fullWidth
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  variant="outlined"
                  disabled={logInMutation.isPending}
                />
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  size="large"
                  disabled={logInMutation.isPending || !username || !password}
                  sx={{ py: 1.5, fontWeight: 600 }}
                >
                  {logInMutation.isPending ? "Signing in..." : "Sign In"}
                </Button>
              </Box>
            </form>
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
}
