import mongoose, { isValidObjectId } from "mongoose";
import { Like } from "../models/like.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const toggleVideoLike = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const userId = req.user?._id;

  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Give valid video ID");
  }

  const like = await Like.findOne({ video: videoId, likedBy: userId });

  if (like) {
    // liked video found so have to unlike
    const deletedLike = await Like.findByIdAndDelete(like._id);
    if (deletedLike) {
      return res
        .status(200)
        .json(new ApiResponse(200, deletedLike, "Video has been unliked"));
    } else {
      throw new ApiError(504, "Failed to unlike the video");
    }
  } else {
    const newLike = await Like.create({
      video: videoId,
      likedBy: userId,
    });
    if (newLike) {
      return res
        .status(200)
        .json(new ApiResponse(200, newLike, "Video has been liked"));
    } else {
      throw new ApiError(504, "Failed to like the video");
    }
  }
  //TODO: toggle like on video
});

const toggleCommentLike = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  const userId = req.user?._id;

  if (!isValidObjectId(commentId)) {
    throw new ApiError(400, "Provide a valid comment ID");
  }

  const like = await Like.findOne({ comment: commentId, likedBy: userId });

  if (like) {
    // liked comment found so have to unlike

    const deletedLike = await Like.findByIdAndDelete(like._id);

    if (deletedLike) {
      return res
        .status(200)
        .json(new ApiResponse(200, deletedLike, "Comment has been unliked"));
    } else {
      throw new ApiError(504, "Failed to unlike the comment");
    }
  } else {
    const newLike = await Like.create({
      comment: commentId,
      likedBy: userId,
    });

    if (newLike) {
      return res
        .status(200)
        .json(new ApiResponse(200, newLike, "Comment has been liked"));
    } else {
      throw new ApiError(504, "Failed to like the comment");
    }
  }

  //TODO: toggle like on comment
});

const toggleTweetLike = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;
  const userId = req.user?._id;

  if (!isValidObjectId(tweetId)) {
    throw new ApiError(400, "Give valid tweet ID");
  }

  const like = await Like.findOne({ tweet: tweetId, likedBy: userId });

  if (like) {
    // liked tweet found so have to unlike
    const deletedLike = await Like.findByIdAndDelete(like._id);
    if (deletedLike) {
      return res
        .status(200)
        .json(new ApiResponse(200, deletedLike, "Tweet has been disliked"));
    } else {
      throw new ApiError(504, "Failed to dislike the tweet");
    }
  } else {
    const newLike = await Like.create({
      tweet: tweetId,
      likedBy: userId,
    });
    if (newLike) {
      return res
        .status(200)
        .json(new ApiResponse(200, newLike, "Tweet has been liked"));
    } else {
      throw new ApiError(504, "Failed to like the tweet");
    }
  }
});

const getLikedVideos = asyncHandler(async (req, res) => {
  //TODO: get all liked videos
  const userId = req.user?._id;

  const videos = await Like.find({
    video: { $ne: null },
    likedBy: userId,
  }).populate("video", "_id title description views owner");
  if (!videos) {
    throw new ApiError(504, "Failed to fetch the liked videos");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, videos, "Liked videos fetched successfully"));
});

export { toggleCommentLike, toggleTweetLike, toggleVideoLike, getLikedVideos };
