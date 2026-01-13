import { ayncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Comment } from "../models/comment.model.js";
import mongoose from "mongoose";


const addComment = ayncHandler(async (req, res) => {
  const { content, videoId } = req.body;

  if (!content || !videoId) {
    throw new ApiError(400, "content and videoId required");
  }

  const comment = await Comment.create({
    content,
    video: videoId,
    owner: req.user._id,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, comment, "comment added"));
});


const getVideoComments = ayncHandler(async (req, res) => {
  const { videoId } = req.params;
  const { page = 1, limit = 10 } = req.query;

  const aggregate = Comment.aggregate([
    { $match: { video: new mongoose.Types.ObjectId(videoId) } },
    { $sort: { createdAt: -1 } },
  ]);

  const comments = await Comment.aggregatePaginate(aggregate, {
    page,
    limit,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, comments, "comments fetched"));
});


const deleteComment = ayncHandler(async (req, res) => {
  const { commentId } = req.params;

  const comment = await Comment.findById(commentId);

  if (!comment) {
    throw new ApiError(404, "comment not found");
  }

  if (comment.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "unauthorized request");
  }

  await comment.deleteOne();

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "comment deleted"));
});

export { addComment, getVideoComments, deleteComment };
