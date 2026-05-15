import cors from "cors";
import express from "express";
import { forcesRouter } from "./routes/forces.routes";

export const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/forces", forcesRouter);

app.use((_req, res) => {
  res.status(404).json({ message: "Route not found" });
});

app.use(
  (
    error: unknown,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction,
  ) => {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  },
);
