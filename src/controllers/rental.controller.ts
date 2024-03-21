import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

import logger from "../utils/logger";
import { APIResponse } from "../types/api-response";
import { IRental, Rental, validateRental } from "../models/rental.model";
import BadRequestError from "../utils/errors/bad-request";
import { Customer } from "../models/customer.model";
import { Movie } from "../models/movie.model";

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

  // store in db
  await rental.save();

  // decrement movie dailyRentalRate by 1
  movie.numberInStock--;
  await movie.save();

  const result: APIResponse = {
    status: "success",
    statusCode: StatusCodes.CREATED,
    data: rental,
  };
  res.status(result.statusCode).json(result);
};

export { getAllRentals, createRental };
