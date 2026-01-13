import { ayncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Like } from "../models/like.model.js";
import mongoose from "mongoose";


const toggleLike = ayncHandler(async (req, res) => {
  const { videoId, commentId, tweetId } = req.body;

  if (!videoId && !commentId && !tweetId) {
    throw new ApiError(400, "like target missing");
  }

  const query = {
    likedBy: req.user._id,
    ...(videoId && { video: videoId }),
    ...(commentId && { comment: commentId }),
    ...(tweetId && { tweet: tweetId }),
  };

  const existingLike = await Like.findOne(query);

  if (existingLike) {
    await existingLike.deleteOne();
    return res
      .status(200)
      .json(new ApiResponse(200, {}, "unliked successfully"));
  }

  await Like.create(query);

  return res
    .status(201)
    .json(new ApiResponse(201, {}, "liked successfully"));
});


const getLikesCount = ayncHandler(async (req, res) => {
  const { videoId, commentId, tweetId } = req.query;

  const count = await Like.countDocuments({
    ...(videoId && { video: videoId }),
    ...(commentId && { comment: commentId }),
    ...(tweetId && { tweet: tweetId }),
  });

  return res
    .status(200)
    .json(new ApiResponse(200, { count }, "likes count fetched"));
});

export { toggleLike, getLikesCount };
