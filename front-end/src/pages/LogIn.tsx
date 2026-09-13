import { useMutation } from "@tanstack/react-query";

import { useState } from "react";
import { useNavigate } from "react-router";
import { USER_ROLE } from "shared-code";
import { logInRequest } from "../api";

export function LogIn() {
  const navigate = useNavigate();

  const logInMutation = useMutation({
    mutationFn: logInRequest,
    onSuccess: (data) => {
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

  return (
    <div>
      <h1>Login</h1>

      <input
        type="text"
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <button
        onClick={() => logInMutation.mutate({ username, password })}
        disabled={logInMutation.isPending}
      >
        Log In
      </button>
    </div>
  );
}
