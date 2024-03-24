import { Request, Response } from "express";
import logger from "../utils/logger";
import Joi, { ObjectSchema } from "joi";
import { mongoIdValidator } from "../utils/joi-custom-type";
import BadRequestError from "../utils/errors/bad-request";
import { Rental } from "../models/rental.model";
import NotFoundError from "../utils/errors/not-found";
import mongoose, { ClientSession } from "mongoose";
import { APIResponse, APIStatus } from "../types/api-response";
import { StatusCodes } from "http-status-codes";
import { Movie } from "../models/movie.model";

const validateReturn = (returnRental: {
  customerId: string;
  movieId: string;
}) => {
  const schema: ObjectSchema = Joi.object({
    customerId: mongoIdValidator.objectId().required(),
    movieId: mongoIdValidator.objectId().required(),
  });

  return schema.validate(returnRental);
};

const returnRental = async (req: Request, res: Response) => {
  logger.debug(`POST Request on Route -> ${req.baseUrl}`);
  // validate request body
  const { error } = validateReturn(req.body);
  if (error) {
    let errorMessage = error.details[0].message;
    logger.error(`Input Validation Error! \n ${errorMessage}`);
    throw new BadRequestError(errorMessage);
  }

  // get rental
  const { customerId, movieId } = req.body;
  const rental = await Rental.lookup(customerId, movieId);
  if (!rental) throw new NotFoundError("Rental not found.");

  // check if rental return is processed
  if (rental.dateReturned)
    throw new BadRequestError("Return already processed.");

  // use transaction to perform rental return and movie stock updation as single task
  const session: ClientSession = await mongoose.startSession();
  session.startTransaction();
  try {
    // return rentals
    rental.return();
    await rental.save({ session });
    // increment movie numberInStock by 1
    await Movie.updateOne(
      { _id: movieId },
      {
        $inc: { numberInStock: 1 },
      },
      { session }
    );

    // Commit the changes
    await session.commitTransaction();
    const result: APIResponse = {
      status: APIStatus.SUCCESS,
      statusCode: StatusCodes.OK,
      data: rental,
    };
    return res.status(result.statusCode).json(result);
  } catch (err) {
    // Rollback any changes made in the database
    await session.abortTransaction();
    logger.error(`${err}`);
    throw new Error("Something went wrong!");
  } finally {
    // Ending the session
    session.endSession();
  }
};

export { returnRental };
