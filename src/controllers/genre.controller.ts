import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

import { Genre, IGenre } from "../models/genre.model";
import logger from "../utils/logger";
import { APIResponse } from "../types/api-response";
import { Types } from "mongoose";
import BadRequestError from "../utils/errors/bad-request";
import NotFoundError from "../utils/errors/not-found";

const getAllGenre = async (req: Request, res: Response) => {
  logger.debug(`GET Request on Route -> ${req.baseUrl}`);

  const genres = await Genre.find().select({ __v: 0 }).sort("name");

  const result: APIResponse<IGenre> = {
    status: "success",
    statusCode: StatusCodes.OK,
    data: genres,
  };
  res.status(result.statusCode).json(result);
};

const getGenreById = async (req: Request, res: Response) => {
  logger.debug(`GET by Id request on route -> ${req.baseUrl}`);

  const { id } = req.params;
  // check if id is valid
  if (!Types.ObjectId.isValid(id)) {
    throw new BadRequestError(`Invalid id = ${id}`);
  }

  // get genre by id
  const genre = await Genre.findById(id).select({ __v: 0 });

  if (!genre) {
    throw new NotFoundError(`Genre with id = ${id} was not found.`);
  }

  const result: APIResponse<IGenre> = {
    status: "success",
    statusCode: StatusCodes.OK,
    data: genre,
  };
  res.status(result.statusCode).json(result);
};

export { getAllGenre, getGenreById };
