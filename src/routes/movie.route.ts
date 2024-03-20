import { Router } from "express";
import { getAllMovies, getMovieById } from "../controllers/movie.controller";

const router = Router();

router.route("/").get(getAllMovies);
router.route("/:id").get(getMovieById);

export default router;
