import { Router } from "express";
import {
  createCustomer,
  getAllCustomer,
  getCustomerById,
} from "../controllers/customer.controller";

const router = Router();

router.route("/").get(getAllCustomer).post(createCustomer);
router.route("/:id").get(getCustomerById);

export default router;
