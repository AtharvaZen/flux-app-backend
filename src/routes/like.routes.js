import { Router } from "express";
import {
  toggleLike,
  getLikesCount
} from "../controllers/like.controller.js";
import { verifyJwt } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/")
  .post(verifyJwt, toggleLike);

router.route("/count")
  .get(getLikesCount);

export default router;
