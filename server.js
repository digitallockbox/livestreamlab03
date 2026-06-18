import dotenv from "dotenv";
dotenv.config();

import express from "express";
import fetch from "node-fetch";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import cookieParser from "cookie-parser";

const app = express();
const PORT = process.env.PORT || 5000;

const ENGINE_KERNEL_URL = process.env.ENGINE_KERNEL_URL;
const ENGINE_LEDGER_URL = process.env.ENGINE_LEDGER_URL;
const ENGINE_STREAM_URL = process.env.ENGINE_STREAM_URL;

import authRoutes from "./auth/routes.js";

app.use(helmet());
app.use(cookieParser());
app.use(express.json());
app.use(
  rateLimit({
    windowMs: 60 * 1000,
    max: 100
  })
);

app.use("/auth", authRoutes);

app.get("/founder/metrics", async (req, res) => {
  try {
    const streams = await fetch(`${ENGINE_KERNEL_URL}/streams/live`).then(r => r.json());
    const creators = await fetch(`${ENGINE_KERNEL_URL}/creators/active`).then(r => r.json());
    const volume = await fetch(`${ENGINE_LEDGER_URL}/volume`).then(r => r.json());
    const block = await fetch(`${ENGINE_LEDGER_URL}/block/latest`).then(r => r.json());

    res.json({
      live_streams: streams.count,
      active_creators: creators.count,
      token_volume: volume.total,
      latest_block: block.number
    });
  } catch (err) {
    res.status(500).json({ error: "metrics_fetch_failed", message: err.message });
  }
});

app.listen(PORT, () => console.log("Backend running on port", PORT));
