import { Schema, model } from "mongoose";
import Joi, { ObjectSchema } from "joi";

import { IGenre, genreSchema } from "./genre.model";
import { mongoIdValidator } from "../utils/joi-custom-type";

// Create an interface representing a document in MongoDB
interface IMovie {
  title: string;
  genre: IGenre;
  numberInStock: number;
  dailyRentalRate: number;
}

// Create a Schema corresponding to the document interface
const movieSchema = new Schema({
  title: {
    type: String,
    required: [true, "'title' field is required."],
    trim: true,
    minlength: 1,
    maxlength: 255,
  },
  genre: {
    type: genreSchema,
    required: [true, "'genre' field is required."],
  },
  numberInStock: {
    type: Number,
    required: [true, "'numberInStock' field is required."],
    min: 0,
    max: 255,
  },
  dailyRentalRate: {
    type: Number,
    required: [true, "'dailyRentalRate' field is required."],
    min: 0,
    max: 255,
  },
});

// Create a Model
const Movie = model("Movie", movieSchema);

const validateMovie = (movie: any) => {
  const schema: ObjectSchema = Joi.object({
    title: Joi.string().min(1).max(255).required(),
    genreId: mongoIdValidator.objectId().required(),
    numberInStock: Joi.number().min(0).required(),
    dailyRentalRate: Joi.number().min(0).required(),
  });

  return schema.validate(movie);
};

export { IMovie, Movie, validateMovie };
