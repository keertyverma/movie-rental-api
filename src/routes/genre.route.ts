import { Router } from "express";
import {
  getAllGenre,
  getGenreById,
  createGenre,
  updateGenre,
  deleteGenreById,
} from "../controllers/genre.controller";

const router = Router();

router.route("/").get(getAllGenre).post(createGenre);
router
  .route("/:id")
  .get(getGenreById)
  .patch(updateGenre)
  .delete(deleteGenreById);

export default router;
