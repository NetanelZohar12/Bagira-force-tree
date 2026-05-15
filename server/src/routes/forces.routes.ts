import { Router } from "express";
import { asyncHandler } from "../asyncHandler";
import {
  getChildren,
  getRootForces,
  searchForces,
} from "../services/forces.service";

export const forcesRouter = Router();

function parseLimit(value: unknown): number {
  const parsed = Number(value ?? 25);

  if (!Number.isFinite(parsed)) {
    return 25;
  }

  return Math.min(Math.max(parsed, 1), 50);
}

function isNumericId(value: string): boolean {
  return /^\d+$/.test(value);
}

forcesRouter.get(
  "/roots",
  asyncHandler(async (_req, res) => {
    const roots = await getRootForces();
    res.json(roots);
  }),
);

forcesRouter.get(
  "/search",
  asyncHandler(async (req, res) => {
    const query = String(req.query.q ?? "").trim();
    const limit = parseLimit(req.query.limit);

    if (query.length < 2) {
      res.json([]);
      return;
    }

    const results = await searchForces(query, limit);
    res.json(results);
  }),
);

forcesRouter.get(
  "/:id/children",
  asyncHandler(async (req, res) => {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

    if (!id || !isNumericId(id)) {
      res.status(400).json({ message: "Invalid id" });
      return;
    }

    const children = await getChildren(id);
    res.json(children);
  }),
);
