import { Router } from "express";
import {
  createRental,
  getAllRentals,
  getRentalById,
} from "../controllers/rental.controller";
import auth from "../middlewares/auth.middleware";

const router = Router();

router.route("/").get(getAllRentals).post(auth, createRental);
router.route("/:id").get(getRentalById);

export default router;
