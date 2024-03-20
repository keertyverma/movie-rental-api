import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

import logger from "../utils/logger";
import { APIResponse } from "../types/api-response";
import { IMovie, Movie } from "../models/movie.model";
import { Types } from "mongoose";
import BadRequestError from "../utils/errors/bad-request";
import NotFoundError from "../utils/errors/not-found";

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

const getMovieById = async (req: Request, res: Response) => {
  logger.debug(`GET by Id request on route -> ${req.baseUrl}`);

  const { id } = req.params;
  // check if id is valid
  if (!Types.ObjectId.isValid(id)) {
    throw new BadRequestError(`Invalid id = ${id}`);
  }

  // get movie by id
  const movie = await Movie.findById(id).select({ __v: 0 });

  if (!movie) {
    throw new NotFoundError(`Movie with id = ${id} was not found.`);
  }

  const result: APIResponse<IMovie> = {
    status: "success",
    statusCode: StatusCodes.OK,
    data: movie,
  };

  res.status(result.statusCode).json(result);
};

export { getAllMovies, getMovieById };
