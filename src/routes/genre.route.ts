import { Router } from "express";
import {
  getAllGenre,
  getGenreById,
  createGenre,
  updateGenre,
  deleteGenreById,
} from "../controllers/genre.controller";
import auth from "../middlewares/auth.middleware";
import admin from "../middlewares/admin.middleware";

const router = Router();

router.route("/").get(getAllGenre).post(auth, createGenre);
router
  .route("/:id")
  .get(getGenreById)
  .patch(auth, updateGenre)
  .delete([auth, admin], deleteGenreById);

export default router;
