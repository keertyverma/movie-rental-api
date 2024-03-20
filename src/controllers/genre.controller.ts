import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

import { Genre, IGenre } from "../models/genre.model";
import logger from "../utils/logger";
import { APIResponse } from "../types/api-response";

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

export { getAllGenre };
