import { ConnectOptions, connect } from "mongoose";
import config from "config";
import logger from "../utils/logger";

const MONGODB_URI: string = config.get("mongodbURI");

const options: ConnectOptions = {
  readPreference: "secondary", // read queries should be executed on secondary instance
};

const connectDB = async () => {
  try {
    await connect(`${MONGODB_URI}`, options);
    logger.info(`MongoDB connected. DB HOST: ${MONGODB_URI}`);
  } catch (err) {
    logger.error(`MongoDB connection FAILED !! ${err}`);
  }
};

export default connectDB;
