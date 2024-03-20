import { Router } from "express";
import {
  getAllMovies,
  getMovieById,
  createMovie,
  updateMovie,
} from "../controllers/movie.controller";

const router = Router();

router.route("/").get(getAllMovies).post(createMovie);
router.route("/:id").get(getMovieById).put(updateMovie);

export default router;
