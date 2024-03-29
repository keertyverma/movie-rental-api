import express, { Request, Response } from "express";
import config from "config";

import errorHandler from "./middlewares/error.middleware";
import routeNotFoundHandler from "./middlewares/route-not-found.middleware";
import genreRouter from "./routes/genre.route";
import customerRouter from "./routes/customer.route";
import movieRouter from "./routes/movie.route";
import rentalRouter from "./routes/rental.route";
import userRouter from "./routes/user.route";
import authRouter from "./routes/auth.route";
import returnRouter from "./routes/return.route";

const BASE_URL = `/${config.get("appName")}/api/v1`;

const app = express();

app.use(express.json());

// configure app routes
app.get(BASE_URL, (req: Request, res: Response) => {
  res.send("Welcome to Movie Rental API.");
});
app.use(`${BASE_URL}/genres`, genreRouter);
app.use(`${BASE_URL}/customers`, customerRouter);
app.use(`${BASE_URL}/movies`, movieRouter);
app.use(`${BASE_URL}/rentals`, rentalRouter);
app.use(`${BASE_URL}/returns`, returnRouter);
app.use(`${BASE_URL}/users`, userRouter);
app.use(`${BASE_URL}/auth`, authRouter);

// configure error handler middleware
app.use(routeNotFoundHandler);
app.use(errorHandler);

export default app;
