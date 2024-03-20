import { Schema, model } from "mongoose";

// Create an interface representing a document in MongoDB
interface ICustomer {
  name: string;
  phone: string;
  isGold: boolean;
}

// Create a Schema corresponding to the document interface
const customerSchema = new Schema<ICustomer>({
  name: {
    type: String,
    required: [true, "'name' field is required."],
    trim: true,
    minlength: 5,
    maxlength: 50,
  },
  phone: {
    type: String,
    required: [true, "'phone' field is required."],
    trim: true,
    minlength: 5,
    maxlength: 50,
  },
  isGold: {
    type: Boolean,
    default: false,
  },
});

// Create a Model
const Customer = model("Customer", customerSchema);

export { ICustomer, Customer };
