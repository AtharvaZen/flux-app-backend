import { Router } from "express";
import {
  addComment,
  getVideoComments,
  deleteComment
} from "../controllers/comment.controller.js";
import { verifyJwt } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/")
  .post(verifyJwt, addComment);

router.route("/video/:videoId")
  .get(getVideoComments);

router.route("/:commentId")
  .delete(verifyJwt, deleteComment);

export default router;
