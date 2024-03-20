import { Router } from "express";
import {
  getAllCustomer,
  getCustomerById,
} from "../controllers/customer.controller";

const router = Router();

router.route("/").get(getAllCustomer);
router.route("/:id").get(getCustomerById);

export default router;
