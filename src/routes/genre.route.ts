import { Router } from "express";
import { getAllGenre } from "../controllers/genre.controller";

const router = Router();

router.get("/", getAllGenre);

export default router;
