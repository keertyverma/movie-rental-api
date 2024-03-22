import "express-async-errors";
import dotenv from "dotenv";
dotenv.config();
import config from "config";

import app from "./app";
import logger from "./utils/logger";
import connectDB from "./db";

const PORT = process.env.PORT || 3000;

if (!config.get("jwtPrivateKey")) {
  logger.error("FATAL ERROR! JWT_PRIVATE_KEY is not defined");
  process.exit(1);
}

// connect to db
connectDB();

const server = app.listen(PORT, () => {
  logger.info(`Listening on port ${PORT}`);
  logger.debug(`Node Env = ${process.env.NODE_ENV}`);
  logger.debug(`App name = ${config.get("appName")}`);
});

export default server;
