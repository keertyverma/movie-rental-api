import { Schema, model } from "mongoose";

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

export { IGenre, Genre };
