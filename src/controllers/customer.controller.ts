import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { Types } from "mongoose";

import logger from "../utils/logger";
import { APIResponse } from "../types/api-response";
import {
  Customer,
  ICustomer,
  validateCustomer,
} from "../models/customer.model";
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

const createCustomer = async (req: Request, res: Response) => {
  logger.debug(`POST Request on Route -> ${req.baseUrl}`);

  // validate request body
  const { error } = validateCustomer(req.body);
  if (error) {
    let errorMessage = error.details[0].message;
    logger.error(`Input Validation Error! \n ${errorMessage}`);
    throw new BadRequestError(errorMessage);
  }

  // create customer object
  const { name, phone, isGold } = req.body;
  let customer = new Customer({
    name,
    phone,
    isGold,
  });

  // store in db
  await customer.save();

  const result: APIResponse<ICustomer> = {
    status: "success",
    statusCode: StatusCodes.CREATED,
    data: customer,
  };
  res.status(result.statusCode).json(result);
};

const updateCustomer = async (req: Request, res: Response) => {
  logger.debug(`PATCH request on route -> ${req.baseUrl}`);

  const { id } = req.params;
  // check if id is valid
  if (!Types.ObjectId.isValid(id)) {
    throw new BadRequestError(`Invalid id = ${id}`);
  }

  // check if customer exists and then update the customer
  const updatedCustomer = await Customer.findByIdAndUpdate(id, req.body, {
    new: true,
  }).select({ __v: 0 });
  if (!updatedCustomer) {
    throw new NotFoundError(`Customer with id = ${id} was not found.`);
  }

  const result: APIResponse<ICustomer> = {
    status: "success",
    statusCode: StatusCodes.OK,
    data: updatedCustomer,
  };
  res.status(result.statusCode).json(result);
};

export { getAllCustomer, getCustomerById, createCustomer, updateCustomer };
