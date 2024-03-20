import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

import logger from "../utils/logger";
import { APIResponse } from "../types/api-response";
import { IMovie, Movie } from "../models/movie.model";

const getAllMovies = async (req: Request, res: Response) => {
  logger.debug(`GET Request on Route -> ${req.baseUrl}`);

  const movies = await Movie.find().select({ __v: 0 });

  const result: APIResponse<IMovie> = {
    status: "success",
    statusCode: StatusCodes.OK,
    data: movies,
  };
  res.status(result.statusCode).json(result);
};

export { getAllMovies };
