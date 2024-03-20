import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { Types } from "mongoose";

import logger from "../utils/logger";
import { APIResponse } from "../types/api-response";
import { IMovie, Movie, validateMovie } from "../models/movie.model";
import BadRequestError from "../utils/errors/bad-request";
import NotFoundError from "../utils/errors/not-found";
import { Genre } from "../models/genre.model";

const getAllMovies = async (req: Request, res: Response) => {
  logger.debug(`GET Request on Route -> ${req.baseUrl}`);

  const movies = await Movie.find().select({ __v: 0 });

  const result: APIResponse<IMovie> = {
    status: "success",
    statusCode: StatusCodes.OK,
    data: movies,
  };
  res.status(result.statusCode).json(result);
};

const getMovieById = async (req: Request, res: Response) => {
  logger.debug(`GET by Id request on route -> ${req.baseUrl}`);

  const { id } = req.params;
  // check if id is valid
  if (!Types.ObjectId.isValid(id)) {
    throw new BadRequestError(`Invalid id = ${id}`);
  }

  // get movie by id
  const movie = await Movie.findById(id).select({ __v: 0 });

  if (!movie) {
    throw new NotFoundError(`Movie with id = ${id} was not found.`);
  }

  const result: APIResponse<IMovie> = {
    status: "success",
    statusCode: StatusCodes.OK,
    data: movie,
  };

  res.status(result.statusCode).json(result);
};

const createMovie = async (req: Request, res: Response) => {
  logger.debug(`POST Request on Route -> ${req.baseUrl}`);

  // validate request body
  const { error } = validateMovie(req.body);
  if (error) {
    let errorMessage = error.details[0].message;
    logger.error(`Input Validation Error! \n ${errorMessage}`);
    throw new BadRequestError(errorMessage);
  }

  const { title, genreId, numberInStock, dailyRentalRate } = req.body;

  // get genre by id
  const genre = await Genre.findById(genreId);
  if (!genre) {
    throw new BadRequestError(`Invalid genreId = ${genreId}`);
  }

  // create movie object
  let movie = new Movie({
    title,
    genre: {
      _id: genre.id,
      name: genre.name,
    },
    numberInStock,
    dailyRentalRate,
  });

  // store in db
  await movie.save();

  const result: APIResponse<IMovie> = {
    status: "success",
    statusCode: StatusCodes.CREATED,
    data: movie,
  };
  res.status(result.statusCode).json(result);
};

const updateMovie = async (req: Request, res: Response) => {
  logger.debug(`PUT request on route -> ${req.baseUrl}`);

  const { id } = req.params;
  // check if id is valid
  if (!Types.ObjectId.isValid(id)) {
    throw new BadRequestError(`Invalid id = ${id}`);
  }

  // validate request body
  const { error } = validateMovie(req.body);
  if (error) {
    logger.error(`Input Validation Error! \n ${error.details[0].message}`);
    throw new BadRequestError(error.details[0].message);
  }

  const { title, genreId, numberInStock, dailyRentalRate } = req.body;
  // get genre by id
  const genre = await Genre.findById(genreId);
  if (!genre) {
    throw new BadRequestError(`Invalid genreId = ${genreId}`);
  }

  // find movie by id and update
  const updatedMovie = await Movie.findByIdAndUpdate(
    id,
    {
      title,
      genre: {
        _id: genre.id,
        name: genre.name,
      },
      numberInStock,
      dailyRentalRate,
    },
    { new: true }
  ).select({ __v: 0 });

  if (!updatedMovie) {
    throw new NotFoundError(`Movie with id = ${id} was not found.`);
  }

  const result: APIResponse<IMovie> = {
    status: "success",
    statusCode: StatusCodes.OK,
    data: updatedMovie,
  };
  res.status(result.statusCode).json(result);
};

export { getAllMovies, getMovieById, createMovie, updateMovie };
