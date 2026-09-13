import express from "express";
import { USER_ROLE } from "shared-code";
import {
  callNextController,
  completeServiceController,
  getPublicStateController,
  issueTicketController,
  login,
  markAbsentController,
  repeatCallController,
  requeueController,
  startServiceController,
} from "./controllers";
import { requireRole, verifyJwt } from "./middlewares";

export const apiRouter = express.Router();

apiRouter.post("/auth/login", login);

apiRouter.get("/queue/public", getPublicStateController);
apiRouter.post(
  "/totem/tickets/issue",
  verifyJwt,
  requireRole([USER_ROLE.TOTEM]),
  issueTicketController,
);
apiRouter.post(
  "/desk/tickets/call-next",
  verifyJwt,
  requireRole([USER_ROLE.DESK]),
  callNextController,
);
apiRouter.post(
  "/desk/tickets/repeat",
  verifyJwt,
  requireRole([USER_ROLE.DESK]),
  repeatCallController,
);
apiRouter.post(
  "/desk/tickets/start",
  verifyJwt,
  requireRole([USER_ROLE.DESK]),
  startServiceController,
);
apiRouter.post(
  "/desk/tickets/complete",
  verifyJwt,
  requireRole([USER_ROLE.DESK]),
  completeServiceController,
);
apiRouter.post(
  "/desk/tickets/absent",
  verifyJwt,
  requireRole([USER_ROLE.DESK]),
  markAbsentController,
);
apiRouter.post(
  "/desk/tickets/requeue",
  verifyJwt,
  requireRole([USER_ROLE.DESK]),
  requeueController,
);
