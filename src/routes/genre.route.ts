import { Router } from "express";
import {
  getAllGenre,
  getGenreById,
  createGenre,
  updateGenre,
} from "../controllers/genre.controller";

const router = Router();

router.route("/").get(getAllGenre).post(createGenre);
router.route("/:id").get(getGenreById).patch(updateGenre);

export default router;
