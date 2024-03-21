import { Router } from "express";
import { createRental, getAllRentals } from "../controllers/rental.controller";

const router = Router();

router.route("/").get(getAllRentals).post(createRental);

export default router;
