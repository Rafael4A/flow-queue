import cookieParser from "cookie-parser";
import express from "express";
import path from "node:path";
import { Server } from "socket.io";
import { apiRouter } from "./api/api";
import { SOCKETIO_KEY } from "./api/constants";
import { socketHandler } from "./api/sockets";

const app = express();
const PORT = process.env.PORT || 3001;
app.use(express.json());
app.use(cookieParser());

app.use("/api", apiRouter);

app.use(express.static(path.join(process.cwd(), "../front-end/dist")));

app.get("/health", (req, res) => {
  res.status(200).send("OK");
});

app.get("/{*any}", (req, res) => {
  // Don't serve index.html for API routes
  if (req.path.startsWith("/api")) {
    return res.status(404).send("Not found");
  }

  res.sendFile(path.join(process.cwd(), "../front-end/dist/index.html"));
});

const server = app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
});

const io = new Server(server, { path: "/api/socket.io" });
socketHandler(io);
app.set(SOCKETIO_KEY, io);
