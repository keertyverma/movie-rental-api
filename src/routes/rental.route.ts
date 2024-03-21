import { Router } from "express";
import {
  createRental,
  getAllRentals,
  getRentalById,
} from "../controllers/rental.controller";

const router = Router();

router.route("/").get(getAllRentals).post(createRental);
router.route("/:id").get(getRentalById);

export default router;
