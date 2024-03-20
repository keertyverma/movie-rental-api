import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

import logger from "../utils/logger";
import { APIResponse } from "../types/api-response";
import { Customer, ICustomer } from "../models/customer.model";

const getAllCustomer = async (req: Request, res: Response) => {
  logger.debug(`GET Request on Route -> ${req.baseUrl}`);

  const customers = await Customer.find().select({ __v: 0 }).sort("name");

  const result: APIResponse<ICustomer> = {
    status: "success",
    statusCode: StatusCodes.OK,
    data: customers,
  };
  res.status(result.statusCode).json(result);
};

export { getAllCustomer };
