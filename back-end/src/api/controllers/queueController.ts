import type { Request, Response } from "express";
import { SOCKET_EVENT, TICKET_TYPE, type TicketType } from "shared-code";
import { SOCKETIO_KEY } from "../constants";
import {
  callNext,
  completeService,
  getPublicState,
  issueTicket,
  markAbsent,
  repeatCall,
  requeueTicket,
  startService,
} from "../services";

export function getPublicStateController(req: Request, res: Response) {
  return res.status(200).json(getPublicState());
}

export function issueTicketController(req: Request, res: Response) {
  const ticketType = req.body?.ticketType as TicketType;
  if (!ticketType || !Object.values(TICKET_TYPE).includes(ticketType)) {
    return res
      .status(400)
      .json({ message: "ticketType is missing or invalid" });
  }

  const ticket = issueTicket(ticketType);

  req.app.get(SOCKETIO_KEY).emit(SOCKET_EVENT.UPDATE);

  return res.status(201).json(ticket);
}

export function callNextController(req: Request, res: Response) {
  const deskId = req.body?.deskId as string;
  if (!deskId || typeof deskId !== "string") {
    return res.status(400).json({ message: "deskId is missing or invalid" });
  }

  try {
    const ticket = callNext(deskId);

    if (!ticket) {
      return res.status(200).json({ message: "No tickets waiting" });
    }

    req.app.get(SOCKETIO_KEY).emit(SOCKET_EVENT.UPDATE);

    return res.status(200).json(ticket);
  } catch (error) {
    return res.status(400).json({ message: (error as Error).message });
  }
}

export function repeatCallController(req: Request, res: Response) {
  const deskId = req.body?.deskId as string;
  const ticketId = req.body?.ticketId as string;
  if (!deskId || typeof deskId !== "string") {
    return res.status(400).json({ message: "deskId is missing or invalid" });
  }
  if (!ticketId || typeof ticketId !== "string") {
    return res.status(400).json({ message: "ticketId is missing or invalid" });
  }

  try {
    const ticket = repeatCall(ticketId, deskId);

    req.app.get(SOCKETIO_KEY).emit(SOCKET_EVENT.UPDATE);

    return res.status(200).json(ticket);
  } catch (error) {
    return res.status(400).json({ message: (error as Error).message });
  }
}

export function markAbsentController(req: Request, res: Response) {
  const deskId = req.body?.deskId as string;
  const ticketId = req.body?.ticketId as string;
  if (!deskId || typeof deskId !== "string") {
    return res.status(400).json({ message: "deskId is missing or invalid" });
  }
  if (!ticketId || typeof ticketId !== "string") {
    return res.status(400).json({ message: "ticketId is missing or invalid" });
  }

  try {
    const ticket = markAbsent(ticketId, deskId);
    req.app.get(SOCKETIO_KEY).emit(SOCKET_EVENT.UPDATE);
    return res.status(200).json(ticket);
  } catch (error) {
    return res.status(400).json({ message: (error as Error).message });
  }
}

export function requeueController(req: Request, res: Response) {
  const ticketId = req.body?.ticketId as string;
  if (!ticketId || typeof ticketId !== "string") {
    return res.status(400).json({ message: "ticketId is missing or invalid" });
  }

  try {
    const ticket = requeueTicket(ticketId);
    req.app.get(SOCKETIO_KEY).emit(SOCKET_EVENT.UPDATE);
    return res.status(200).json(ticket);
  } catch (error) {
    return res.status(400).json({ message: (error as Error).message });
  }
}

export function startServiceController(req: Request, res: Response) {
  const deskId = req.body?.deskId as string;
  const ticketId = req.body?.ticketId as string;
  if (!deskId || typeof deskId !== "string") {
    return res.status(400).json({ message: "deskId is missing or invalid" });
  }
  if (!ticketId || typeof ticketId !== "string") {
    return res.status(400).json({ message: "ticketId is missing or invalid" });
  }

  try {
    const ticket = startService(ticketId, deskId);
    req.app.get(SOCKETIO_KEY).emit(SOCKET_EVENT.UPDATE);
    return res.status(200).json(ticket);
  } catch (error) {
    return res.status(400).json({ message: (error as Error).message });
  }
}

export function completeServiceController(req: Request, res: Response) {
  const deskId = req.body?.deskId as string;
  const ticketId = req.body?.ticketId as string;
  if (!deskId || typeof deskId !== "string") {
    return res.status(400).json({ message: "deskId is missing or invalid" });
  }
  if (!ticketId || typeof ticketId !== "string") {
    return res.status(400).json({ message: "ticketId is missing or invalid" });
  }

  try {
    const ticket = completeService(ticketId, deskId);
    req.app.get(SOCKETIO_KEY).emit(SOCKET_EVENT.UPDATE);
    return res.status(200).json(ticket);
  } catch (error) {
    return res.status(400).json({ message: (error as Error).message });
  }
}
