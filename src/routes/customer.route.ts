import { Router } from "express";
import { getAllCustomer } from "../controllers/customer.controller";

const router = Router();

router.route("/").get(getAllCustomer);

export default router;
