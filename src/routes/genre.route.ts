import { Router } from "express";
import { getAllGenre, getGenreById } from "../controllers/genre.controller";

const router = Router();

router.get("/", getAllGenre);
router.get("/:id", getGenreById);

export default router;
