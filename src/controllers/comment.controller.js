import mongoose, { isValidObjectId } from "mongoose";
import { Comment } from "../models/comment.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getVideoComments = asyncHandler(async (req, res) => {
  //TODO: get all comments for a video
  const { videoId } = req.params;
  const { page = 1, limit = 10 } = req.query;
});

const addComment = asyncHandler(async (req, res) => {
  // TODO: add a comment to a video

  const { videoId } = req.params;
  const { content } = req.body;
  const owner = req.user?._id;

  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Provide a valid videoID");
  }

  if (!content) {
    throw new ApiError(400, "Comment cannot be blank");
  }

  const newComment = await Comment.create({
    content,
    video: videoId,
    owner,
  });

  if (!newComment) {
    throw new ApiError(504, "Failed to create comment on the video");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        newComment,
        "Comment created successfully on the video"
      )
    );
});

const updateComment = asyncHandler(async (req, res) => {
  // TODO: update a comment

  const { commentId } = req.params;
  const { content } = req.body;
  const userId = req.user?._id;

  const comment = await Comment.findById(commentId);

  if (!comment) {
    throw new ApiError(400, "Comment to be updated not found");
  }

  if (!userId.equals(comment.owner)) {
    throw new ApiError(401, "Only owner can edit the comments");
  }

  const updatedComment = await Comment.findByIdAndUpdate(commentId, {
    content,
  });

  if (!updatedComment) {
    throw new ApiError(500, "Comment to be updated failed");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, updatedComment, "Comment updated successfully"));
});

const deleteComment = asyncHandler(async (req, res) => {
  // TODO: delete a comment
  const { commentId } = req.params;

  if (!isValidObjectId(commentId)) {
    throw new ApiError(400, "Give a valid comment ID");
  }
  const comment = await Comment.findByIdAndDelete(commentId);

  if (!comment) {
    throw new ApiError(500, "Failed to delete the comment");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, comment, "Comment deleted successfully"));
});

export { getVideoComments, addComment, updateComment, deleteComment };
