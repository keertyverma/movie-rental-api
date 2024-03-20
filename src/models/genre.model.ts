import { Schema, model } from "mongoose";
import Joi, { ObjectSchema } from "joi";

// Create an interface representing a document in MongoDB
interface IGenre {
  name: string;
}

// Create a Schema corresponding to the document interface
const genreSchema = new Schema<IGenre>({
  name: {
    type: String,
    required: [true, "'name' field is required."],
    trim: true,
    minlength: 5,
    maxlength: 50,
  },
});

// Create a Model
const Genre = model("Genre", genreSchema);

const validateGenre = (genre: IGenre) => {
  const schema: ObjectSchema = Joi.object({
    name: Joi.string().min(5).max(50).required(),
  });

  return schema.validate(genre);
};

export { IGenre, Genre, validateGenre, genreSchema };
