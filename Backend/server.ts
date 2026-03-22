import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import { connectDB } from "./src/config/db.js";
import aiRoutes from "./src/routes/aiRoutes.js";
import { globalError } from "./src/middleware/globalError.js";
import promptRoutes from "./src/routes/promptRoutes.js";
import { startKeepAlive } from "./src/utils/keepAlive.js";

dotenv.config();

const app = express();

const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

app.use(
  cors({
    origin: FRONTEND_URL,
    credentials: true,
  })
);
app.use(express.json());

const PORT = Number(process.env.PORT || 5000);

app.get("/health", (_req, res) => res.json({ status: "ok" }));

app.use("/api/ask-ai", aiRoutes);
app.use("/api/prompts", promptRoutes);

app.use(globalError);

export const startServer = async () => {
  await connectDB();
  startKeepAlive();

  app.listen(PORT, () => {
    console.log(`Server listening on http://localhost:${PORT}`);
  });
}

startServer();
