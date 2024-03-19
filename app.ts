import dotenv from "dotenv";
dotenv.config();

import express, { Request, Response } from "express";
import config from "config";

const app = express();
const PORT = process.env.PORT || 3000;

app.get("/", (req: Request, res: Response) => {
  res.send("Welcome to Movie Rental API.");
});

app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
  console.log(`Node Env = ${process.env.NODE_ENV}`);
  console.log(`App name = ${config.get("appName")}`);
});
