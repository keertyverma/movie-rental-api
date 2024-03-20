import { Router } from "express";
import {
  createCustomer,
  deleteCustomerById,
  getAllCustomer,
  getCustomerById,
  updateCustomer,
} from "../controllers/customer.controller";

const router = Router();

router.route("/").get(getAllCustomer).post(createCustomer);
router
  .route("/:id")
  .get(getCustomerById)
  .patch(updateCustomer)
  .delete(deleteCustomerById);

export default router;
