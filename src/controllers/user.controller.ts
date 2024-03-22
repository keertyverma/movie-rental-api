import { Request, Response } from "express";
import bcrypt from "bcrypt";
import logger from "../utils/logger";
import { User, validateUser } from "../models/user.model";
import BadRequestError from "../utils/errors/bad-request";
import { APIResponse, APIStatus } from "../types/api-response";
import { StatusCodes } from "http-status-codes";

const createUser = async (req: Request, res: Response) => {
  logger.debug(`POST Request on Route -> ${req.baseUrl}`);
  // validate request body
  const { error } = validateUser(req.body);
  if (error) {
    let errorMessage = error.details[0].message;
    logger.error(`Input Validation Error! \n ${errorMessage}`);
    throw new BadRequestError(errorMessage);
  }

  const { name, email, password } = req.body;
  // check if user exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new BadRequestError(`User already registered.`);
  }
  // create user
  const user = new User({
    name,
    email,
  });

  // secure password
  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(password, salt);
  await user.save();

  const result: APIResponse = {
    status: APIStatus.SUCCESS,
    statusCode: StatusCodes.CREATED,
    data: { _id: user.id, name: user.name, email: user.email },
  };
  return res.status(result.statusCode).json(result);
};

export { createUser };
