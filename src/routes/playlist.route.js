import { Router } from "express";
import {
  createPlaylist,
  addVideoToPlaylist,
  removeVideoFromPlaylist,
  getUserPlaylists
} from "../controllers/playlist.controller.js";
import { verifyJwt } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/")
  .post(verifyJwt, createPlaylist)
  .get(verifyJwt, getUserPlaylists);

router.route("/add-video")
  .patch(verifyJwt, addVideoToPlaylist);

router.route("/remove-video")
  .patch(verifyJwt, removeVideoFromPlaylist);

export default router;
