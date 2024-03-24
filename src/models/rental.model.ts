import Joi, { ObjectSchema } from "joi";
import moment from "moment";
import { Model, Schema, model, Document } from "mongoose";
import { mongoIdValidator } from "../utils/joi-custom-type";

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

interface IRentalDocument extends IRental, Document {
  return(): void;
}

interface IRentalModel extends Model<IRentalDocument> {
  lookup(customerId: string, movieId: string): Promise<IRentalDocument | null>;
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

rentalSchema.methods.return = function () {
  this.dateReturned = new Date();
  // calculate and set rental fee
  const rentalDays = moment().diff(this.dateOut, "days");
  this.rentalFee = rentalDays * this.movie.dailyRentalRate;
};

rentalSchema.statics.lookup = function (
  customerId: string,
  movieId: string
): Promise<IRentalDocument | null> {
  return this.findOne({
    "customer._id": customerId,
    "movie._id": movieId,
  });
};

// Create a Model
const Rental = model<IRentalDocument, IRentalModel>("Rental", rentalSchema);

const validateRental = (rental: { customerId: string; movieId: string }) => {
  const schema: ObjectSchema = Joi.object({
    customerId: mongoIdValidator.objectId().required(),
    movieId: mongoIdValidator.objectId().required(),
  });

  return schema.validate(rental);
};

export { Rental, IRental, validateRental };
