import { Router } from "express";
import {
  publishVideo,
  getVideoById,
  updateVideo,
  deleteVideo,
  togglePublishStatus,
  getChannelVideos
} from "../controllers/video.controller.js";
import { verifyJwt } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();

router.route("/")
  .post(
    verifyJwt,
    upload.fields([
      { name: "videoFile", maxCount: 1 },
      { name: "thumbnail", maxCount: 1 },
    ]),
    publishVideo
  );

router.route("/:videoId")
  .get(getVideoById)
  .patch(verifyJwt, updateVideo)
  .delete(verifyJwt, deleteVideo);

router.route("/toggle/publish/:videoId")
  .patch(verifyJwt, togglePublishStatus);

router.route("/channel/:userId")
  .get(getChannelVideos);

export default router;
