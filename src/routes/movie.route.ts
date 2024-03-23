import { Router } from "express";
import {
  getAllMovies,
  getMovieById,
  createMovie,
  updateMovie,
  deleteMovie,
} from "../controllers/movie.controller";
import auth from "../middlewares/auth.middleware";

const router = Router();

router.route("/").get(getAllMovies).post(auth, createMovie);
router
  .route("/:id")
  .get(getMovieById)
  .put(auth, updateMovie)
  .delete(auth, deleteMovie);

export default router;
