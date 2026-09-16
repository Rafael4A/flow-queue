import express from "express";
import { USER_ROLE } from "shared-code";
import {
  callNextController,
  completeServiceController,
  getDeskTicketController,
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

// Public routes
apiRouter.post("/auth/login", login);

apiRouter.get("/queue/public", getPublicStateController);

// Totem routes
const totemRouter = express.Router();
totemRouter.use(verifyJwt, requireRole([USER_ROLE.TOTEM]));

totemRouter.post("/tickets/issue", issueTicketController);

apiRouter.use("/totem", totemRouter);

// Desk routes
const deskRouter = express.Router();
deskRouter.use(verifyJwt, requireRole([USER_ROLE.DESK]));

deskRouter.get("/ticket", getDeskTicketController);
deskRouter.post("/tickets/call-next", callNextController);
deskRouter.post("/tickets/repeat", repeatCallController);
deskRouter.post("/tickets/start", startServiceController);
deskRouter.post("/tickets/complete", completeServiceController);
deskRouter.post("/tickets/mark-absent", markAbsentController);
deskRouter.post("/tickets/requeue", requeueController);

apiRouter.use("/desk", deskRouter);
