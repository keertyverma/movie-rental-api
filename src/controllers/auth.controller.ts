import { Request, Response } from "express";
import Joi from "joi";
import bcrypt from "bcrypt";
import logger from "../utils/logger";
import BadRequestError from "../utils/errors/bad-request";
import { User } from "../models/user.model";
import { APIResponse, APIStatus } from "../types/api-response";
import { StatusCodes } from "http-status-codes";

const validate = (req: { email: string; password: string }) => {
  const schema = Joi.object({
    email: Joi.string().min(5).max(255).required().email(),
    password: Joi.string().min(5).max(1024).required(),
  });

  return schema.validate(req);
};

const authenticateUser = async (req: Request, res: Response) => {
  logger.debug(`POST Request on Route -> ${req.baseUrl}`);
  // validate request body
  const { error } = validate(req.body);
  if (error) {
    let errorMessage = error.details[0].message;
    logger.error(`Input Validation Error! \n ${errorMessage}`);
    throw new BadRequestError(errorMessage);
  }

  // check if user exists
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    throw new BadRequestError("Invalid email or password");
  }

  // verify password
  const isValidPassword = await bcrypt.compare(password, user.password);
  if (!isValidPassword) {
    throw new BadRequestError("Invalid email or password");
  }
  const token = user.generateAuthToken();

  const result: APIResponse = {
    status: APIStatus.SUCCESS,
    statusCode: StatusCodes.OK,
    data: { message: "Logged in successfully", token },
  };
  return res.status(result.statusCode).json(result);
};

export { authenticateUser };
