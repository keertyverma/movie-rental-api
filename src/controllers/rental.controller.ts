import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import mongoose, { ClientSession, Types } from "mongoose";

import logger from "../utils/logger";
import { APIResponse, APIStatus } from "../types/api-response";
import { IRental, Rental, validateRental } from "../models/rental.model";
import BadRequestError from "../utils/errors/bad-request";
import { Customer } from "../models/customer.model";
import { Movie } from "../models/movie.model";
import NotFoundError from "../utils/errors/not-found";

const getAllRentals = async (req: Request, res: Response) => {
  logger.debug(`GET Request on Route -> ${req.baseUrl}`);

  // get all rental and sort by dateOut in descending order
  const rentals: IRental[] = await Rental.find()
    .sort("-dateOut")
    .select({ __v: 0 });

  const result: APIResponse<IRental> = {
    status: APIStatus.SUCCESS,
    statusCode: StatusCodes.OK,
    data: rentals,
  };
  res.status(result.statusCode).json(result);
};

const createRental = async (req: Request, res: Response) => {
  logger.debug(`POST Request on Route -> ${req.baseUrl}`);
  // validate request body
  const { error } = validateRental(req.body);
  if (error) {
    let errorMessage = error.details[0].message;
    logger.error(`Input Validation Error! \n ${errorMessage}`);
    throw new BadRequestError(errorMessage);
  }
  const { customerId, movieId } = req.body;

  // get customer by id
  const customer = await Customer.findById(customerId);
  if (!customer) {
    throw new BadRequestError(`Invalid customerId = ${customerId}`);
  }

  // get movie by id
  const movie = await Movie.findById(movieId);
  if (!movie) {
    throw new BadRequestError(`Invalid movieId = ${movieId}`);
  }
  if (movie.numberInStock === 0) {
    throw new BadRequestError("Movie not in stock");
  }

  // create rental
  const rental = new Rental({
    customer: {
      _id: customer.id,
      name: customer.name,
      phone: customer.phone,
      isGold: customer.isGold,
    },
    movie: {
      _id: movie.id,
      title: movie.title,
      dailyRentalRate: movie.dailyRentalRate,
    },
  });

  // use transaction to perform rental creation and movie stock updation as single task
  const session: ClientSession = await mongoose.startSession();
  session.startTransaction();
  try {
    // save rentals
    await rental.save({ session });

    // decrement movie dailyRentalRate by 1
    movie.numberInStock--;
    await movie.save({ session });
    // Commit the changes
    await session.commitTransaction();
    const result: APIResponse = {
      status: APIStatus.SUCCESS,
      statusCode: StatusCodes.CREATED,
      data: rental,
    };
    return res.status(result.statusCode).json(result);
  } catch (err) {
    // Rollback any changes made in the database
    await session.abortTransaction();
    logger.error(err);
    throw new Error("Something went wrong!");
  } finally {
    // Ending the session
    session.endSession();
  }
};

const getRentalById = async (req: Request, res: Response) => {
  logger.debug(`GET by Id request on route -> ${req.baseUrl}`);

  const { id } = req.params;
  // check if id is valid
  if (!Types.ObjectId.isValid(id)) {
    throw new BadRequestError(`Invalid id = ${id}`);
  }

  // get rental by id
  const rental: IRental = await Rental.findById(id).select({ __v: 0 });
  if (!rental) {
    throw new NotFoundError(`Rental with id = ${id} was not found.`);
  }

  const result: APIResponse<IRental> = {
    status: APIStatus.SUCCESS,
    statusCode: StatusCodes.OK,
    data: rental,
  };

  res.status(result.statusCode).json(result);
};

export { getAllRentals, createRental, getRentalById };
