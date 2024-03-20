import express, { Request, Response } from "express";
import config from "config";

import genreRouter from "./routes/genre.route";
import errorHandler from "./middlewares/error.middleware";
import routeNotFoundHandler from "./middlewares/route-not-found.middleware";

const BASE_URL = `/${config.get("appName")}/api/v1`;

const app = express();

app.use(express.json());

// configure app routes
app.get(BASE_URL, (req: Request, res: Response) => {
  res.send("Welcome to Movie Rental API.");
});
app.use(`${BASE_URL}/genres`, genreRouter);

// configure error handler middleware
app.use(routeNotFoundHandler);
app.use(errorHandler);

export default app;
