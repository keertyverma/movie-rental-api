import dotenv from "dotenv";
dotenv.config();
import express, { Request, Response } from "express";
import config from "config";

import logger from "./src/logger";

const app = express();
const PORT = process.env.PORT || 3000;

app.get("/", (req: Request, res: Response) => {
  res.send("Welcome to Movie Rental API.");
});

app.listen(PORT, () => {
  logger.info(`Listening on port ${PORT}`);
  logger.debug(`Node Env = ${process.env.NODE_ENV}`);
  logger.debug(`App name = ${config.get("appName")}`);
});
