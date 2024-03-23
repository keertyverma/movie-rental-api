import { Router } from "express";
import {
  createCustomer,
  deleteCustomerById,
  getAllCustomer,
  getCustomerById,
  updateCustomer,
} from "../controllers/customer.controller";
import auth from "../middlewares/auth.middleware";

const router = Router();

router.route("/").get(getAllCustomer).post(auth, createCustomer);
router
  .route("/:id")
  .get(getCustomerById)
  .patch(auth, updateCustomer)
  .delete(auth, deleteCustomerById);

export default router;
