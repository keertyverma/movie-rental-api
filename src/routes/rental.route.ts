import { Router } from "express";
import { getAllRentals } from "../controllers/rental.controller";

const router = Router();

router.route("/").get(getAllRentals);

export default router;
