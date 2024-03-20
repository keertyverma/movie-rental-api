import express, { Request, Response } from "express";
import config from "config";

import genreRouter from "./routes/genre.route";
import errorHandler from "./middlewares/error.middleware";

const BASE_URL = `/${config.get("appName")}/api/v1`;

const app = express();

app.get(BASE_URL, (req: Request, res: Response) => {
  res.send("Welcome to Movie Rental API.");
});

// middlewares
app.use(`${BASE_URL}/genres`, genreRouter);

// error handler middleware
app.use(errorHandler);

export default app;
