import { Router } from "express";
import {
  getAllMovies,
  getMovieById,
  createMovie,
  updateMovie,
  deleteMovie,
} from "../controllers/movie.controller";

const router = Router();

router.route("/").get(getAllMovies).post(createMovie);
router.route("/:id").get(getMovieById).put(updateMovie).delete(deleteMovie);

export default router;
