import { Router } from "express";
import { returnRental } from "../controllers/return.controller";
import auth from "../middlewares/auth.middleware";

const router = Router();

router.post("/", auth, returnRental);

export default router;
