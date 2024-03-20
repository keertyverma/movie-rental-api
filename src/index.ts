import dotenv from "dotenv";
dotenv.config();
import config from "config";

import app from "./app";
import logger from "./utils/logger";

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  logger.info(`Listening on port ${PORT}`);
  logger.debug(`Node Env = ${process.env.NODE_ENV}`);
  logger.debug(`App name = ${config.get("appName")}`);
});
