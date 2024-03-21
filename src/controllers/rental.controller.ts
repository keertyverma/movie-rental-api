import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

import logger from "../utils/logger";
import { APIResponse } from "../types/api-response";
import { IRental, Rental } from "../models/rental.model";

const getAllRentals = async (req: Request, res: Response) => {
  logger.debug(`GET Request on Route -> ${req.baseUrl}`);

  // get all rental and sort by dateOut in descending order
  const rentals: IRental[] = await Rental.find()
    .sort("-dateOut")
    .select({ __v: 0 });

  const result: APIResponse<IRental> = {
    status: "success",
    statusCode: StatusCodes.OK,
    data: rentals,
  };
  res.status(result.statusCode).json(result);
};

export { getAllRentals };
