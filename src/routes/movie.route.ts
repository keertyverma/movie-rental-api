import { Router } from "express";
import { getAllMovies } from "../controllers/movie.controller";

const router = Router();

router.route("/").get(getAllMovies);

export default router;
