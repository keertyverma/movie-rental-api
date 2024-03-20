import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { Types } from "mongoose";

import logger from "../utils/logger";
import { APIResponse } from "../types/api-response";
import { Customer, ICustomer } from "../models/customer.model";
import BadRequestError from "../utils/errors/bad-request";
import NotFoundError from "../utils/errors/not-found";

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

const getCustomerById = async (req: Request, res: Response) => {
  logger.debug(`GET by Id request on route -> ${req.baseUrl}`);

  const { id } = req.params;
  // check if id is valid
  if (!Types.ObjectId.isValid(id)) {
    throw new BadRequestError(`Invalid id = ${id}`);
  }

  // get customer by id
  const customer = await Customer.findById(id).select({ __v: 0 });

  if (!customer) {
    throw new NotFoundError(`Customer with id = ${id} was not found.`);
  }

  const result: APIResponse<ICustomer> = {
    status: "success",
    statusCode: StatusCodes.OK,
    data: customer,
  };
  res.status(result.statusCode).json(result);
};

export { getAllCustomer, getCustomerById };
