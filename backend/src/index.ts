import express from "express";
import cors from "cors";
import morgan from "morgan";
import { episodesRouter } from "./routes/episodes.js";

const app = express();
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));


app.get("/health", (_req, res) => res.json({ ok: true }));
app.use("/episodes", episodesRouter);


const port = process.env.PORT ? Number(process.env.PORT) : 4000;
app.listen(port, () => {
  console.log(`API listening on http://localhost:${port}`);
});