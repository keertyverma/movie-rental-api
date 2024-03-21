import { Schema, model } from "mongoose";

// Create an interface representing a document in MongoDB
interface IRental {
  customer: {
    name: string;
    phone: string;
    isGold: boolean;
  };
  movie: {
    title: string;
    dailyRentalRate: number;
  };
  dateOut: Date;
  dateReturned?: Date;
  rentalFee?: number;
}

// Create a Schema corresponding to the document interface
const rentalSchema = new Schema({
  customer: {
    type: new Schema({
      name: {
        type: String,
        required: [true, "customer 'name' field is required."],
        trim: true,
        minlength: 5,
        maxlength: 50,
      },
      phone: {
        type: String,
        required: [true, "customer 'phone' field is required."],
        trim: true,
        minlength: 5,
        maxlength: 50,
      },
      isGold: {
        type: Boolean,
        default: false,
      },
    }),
    required: [true, "customer field is required."],
  },
  movie: {
    type: new Schema({
      title: {
        type: String,
        required: [true, "movie 'title' field is required."],
        trim: true,
        minlength: 1,
        maxlength: 255,
      },
      dailyRentalRate: {
        type: Number,
        required: [true, "movie 'dailyRentalRate' field is required."],
        min: 0,
        max: 255,
      },
    }),
    required: ["true", "movie field is required."],
  },
  dateOut: {
    type: Date,
    required: ["true", "dateOut field is required"],
    default: Date.now,
  },
  dateReturned: {
    type: Date,
  },
  rentalFee: {
    type: Number,
    min: 0,
  },
});

// Create a Model
const Rental = model("Rental", rentalSchema);

export { Rental, IRental };
