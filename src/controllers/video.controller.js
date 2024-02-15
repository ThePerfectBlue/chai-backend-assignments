import mongoose, { isValidObjectId } from "mongoose";
import { Video } from "../models/video.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

const getAllVideos = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query;

  //TODO: get all videos based on query, sort, pagination
});

const publishAVideo = asyncHandler(async (req, res) => {
  const { title, description } = req.body;

  if (!title && !description) {
    throw new ApiError(400, "Give video title and description");
  }

  const videoFilePath = req.files?.videoFile[0]?.path;
  const thumbnailFilePath = req.files?.thumbnail[0]?.path;
  //
  if (!videoFilePath || !thumbnailFilePath) {
    throw new ApiError(400, "Video and thumbnail path is required");
  }

  const videoFile = await uploadOnCloudinary(videoFilePath); // cloudinary returns object
  const thumbnail = await uploadOnCloudinary(thumbnailFilePath);

  if (!videoFile.url && !thumbnail.url) {
    throw new ApiError(400, "Error while uploading video and thumbnail");
  }

  const video = await Video.create({
    videoFile: videoFile.url || "",
    thumbnail: thumbnail.url || "",
    title,
    description,
    duration: videoFile.duration,
    owner: req.user?._id,
  });

  await video.populate("owner", "username");

  if (!video) {
    throw new ApiError(500, "Something went wrong while uploading the video");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, video, "Video uploaded successfully"));
  // TODO: get video, upload to cloudinary, create video
});

const getVideoById = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!isValidObjectId) {
    throw new ApiError(400, "Provide valid video ID");
  }

  const video = await Video.findById(videoId);

  if (!video) {
    throw new ApiError(400, "Video not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, video, "Video found in the database"));
  //TODO: get video by id
});

const updateVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const { title, description } = req.body;
  const thumbnailFilePath = req.file?.path;
  const userId = req.user._id;

  if (!videoId) {
    throw new ApiError(400, "Video with given ID not found");
  }

  if (!title || !description) {
    throw new ApiError(400, "Provide title and desc. to update");
  }

  const video = await Video.findById(videoId);

  if (!video) {
    throw new ApiError(400, "Video not found");
  }

  if (!userId.equals(video.owner)) {
    throw new ApiError(400, "You are unauthorize to update this video");
  }

  const thumbnail = await uploadOnCloudinary(thumbnailFilePath);

  if (!thumbnail.url) {
    throw new ApiError(400, "Error while uploading thumbnail");
  }

  const updatedVideo = await Video.findByIdAndUpdate(
    videoId,
    {
      $set: {
        title: title,
        description: description,
        thumbnail: thumbnail.url,
      },
    },
    {
      new: true,
    }
  );

  return res
    .status(200)
    .json(
      new ApiResponse(200, updatedVideo, "Video info updated successfully")
    );

  //TODO: update video details like title, description, thumbnail
});

const deleteVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const userId = req.user?._id;

  if (!videoId) {
    throw new ApiError(400, "Provide video ID");
  }

  const video = await Video.findById(videoId);

  if (!video) {
    throw new ApiError(400, "Video not found");
  }

  if (!userId.equals(video.owner)) {
    throw new ApiError(400, "you are not the owner of this video");
  }

  const deletedVideo = await Video.findByIdAndDelete(videoId);

  if (!deletedVideo) {
    throw new ApiError(500, "Failed to delete video");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Video deleted Successfully"));
  //TODO: delete video
});

const togglePublishStatus = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!videoId) {
    throw new ApiError(400, "Provide video ID");
  }

  const video = await Video.findById(videoId);

  if (!video) {
    throw new ApiError(400, "Video not found");
  }

  if (!(req.user?._id === video.owner?._id)) {
    throw new ApiError(400, "Unauthorize action");
  }

  video.isPublished = !video.isPublished;

  return res.status(200).json(new ApiResponse(200, video, "Toggle status set"));
});

export {
  getAllVideos,
  publishAVideo,
  getVideoById,
  updateVideo,
  deleteVideo,
  togglePublishStatus,
};
