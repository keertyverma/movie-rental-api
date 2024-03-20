import { Router } from "express";
import {
  getAllGenre,
  getGenreById,
  createGenre,
} from "../controllers/genre.controller";

const router = Router();

router.route("/").get(getAllGenre).post(createGenre);
router.get("/:id", getGenreById);

export default router;
