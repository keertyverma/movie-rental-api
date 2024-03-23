import { Router } from "express";
import {
  getAllMovies,
  getMovieById,
  createMovie,
  updateMovie,
  deleteMovie,
} from "../controllers/movie.controller";
import auth from "../middlewares/auth.middleware";
import admin from "../middlewares/admin.middleware";

const router = Router();

router.route("/").get(getAllMovies).post(auth, createMovie);
router
  .route("/:id")
  .get(getMovieById)
  .put(auth, updateMovie)
  .delete([auth, admin], deleteMovie);

export default router;
