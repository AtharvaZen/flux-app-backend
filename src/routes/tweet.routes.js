import { Router } from "express";
import {
  createTweet,
  getTweetById,
  deleteTweet,
  getUserTweets
} from "../controllers/tweet.controller.js";
import { verifyJwt } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/")
  .post(verifyJwt, createTweet);

router.route("/:tweetId")
  .get(getTweetById)
  .delete(verifyJwt, deleteTweet);

router.route("/user/:userId")
  .get(getUserTweets);

export default router;
