import express, { Request, Response } from "express";
import config from "config";

import genreRouter from "./routes/genre.route";

const BASE_URL = `/${config.get("appName")}/api/v1`;

const app = express();

app.get(BASE_URL, (req: Request, res: Response) => {
  res.send("Welcome to Movie Rental API.");
});
app.use(`${BASE_URL}/genres`, genreRouter);

export default app;
