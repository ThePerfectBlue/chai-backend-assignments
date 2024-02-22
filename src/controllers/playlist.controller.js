import mongoose, { isValidObjectId } from "mongoose";
import { Playlist } from "../models/playlist.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const createPlaylist = asyncHandler(async (req, res) => {
  const { name, description } = req.body;
  const userId = req.user?._id;

  if (!name || !description) {
    throw new ApiError(400, "Provide playlist title and description");
  }

  const playlist = await Playlist.create({
    name,
    description,
    owner: userId,
  });

  if (!playlist) {
    throw new ApiError(500, "Failed to create user playlist");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, playlist, "User playlist created successfully"));

  //TODO: create playlist
});

const getUserPlaylists = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  if (!isValidObjectId(userId)) {
    throw new ApiError(400, "Provide a valid user ID");
  }

  const playlist = await Playlist.find({ owner: userId });

  if (!playlist) {
    throw new ApiError(500, "User playlist not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, playlist, "Playlist fetched successfully"));
  //TODO: get user playlists
});

const getPlaylistById = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;

  if (!isValidObjectId(playlistId)) {
    throw new ApiError(400, "Provide a valid playlist ID");
  }

  const playlist = await Playlist.findById(playlistId);

  if (!playlist) {
    throw new ApiError(500, "Playlist mot found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, playlist, "Playlist fetched successfully"));
  //TODO: get playlist by id
});

const addVideoToPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;
  const userId = req.user?._id;

  if (!isValidObjectId(playlistId) && !isValidObjectId(videoId)) {
    throw new ApiError(400, "Provide valid playlist ID and video ID");
  }

  const findPlaylist = await Playlist.findById(playlistId);
  if (!findPlaylist) {
    throw new ApiError(500, "Playlist not found");
  }

  if (!userId.equals(findPlaylist.owner)) {
    throw new ApiError(401, "Unauthorize user to add video to playlist");
  }

  const updatedPlaylist = await Playlist.findByIdAndUpdate(playlistId, {
    videos: videoId,
  });

  if (!updatedPlaylist) {
    throw new ApiError(500, "Failed to add video to playlist");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        updatedPlaylist,
        "Video added to playlist successfully"
      )
    );
});

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;
  const userId = req.user?._id;

  if (!isValidObjectId(playlistId) && !isValidObjectId(videoId)) {
    throw new ApiError(400, "Provide valid playlist ID and video ID");
  }

  const findPlaylist = await Playlist.findById(playlistId);
  if (!findPlaylist) {
    throw new ApiError(500, "Playlist not found");
  }

  if (!userId.equals(findPlaylist.owner)) {
    throw new ApiError(401, "Unauthorize user to delete video from playlist");
  }

  const updatedPlaylist = await Playlist.findByIdAndUpdate(playlistId, {
    videos: findPlaylist.videos.filter((vid) => vid !== videoId),
  });

  if (!updatedPlaylist) {
    throw new ApiError(500, "Failed to delete video from playlist");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        updatedPlaylist,
        "Video deleted from playlist successfully"
      )
    );
  // TODO: remove video from playlist
});

const deletePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  const user = req.user?._id;

  if (!isValidObjectId(playlistId)) {
    throw new ApiError(400, "Provide a valid playlist ID");
  }

  const playlist = await Playlist.findById(playlistId);

  if (!user.equals(playlist.owner)) {
    throw new ApiError(401, "Unauthorize user to delete playlist");
  }

  const deletedPlaylist = await Playlist.findByIdAndDelete(playlistId);

  if (!deletedPlaylist) {
    throw new ApiError(500, "Failed to delete playlist");
  }

  return res
    .status(200)
    .json(200, deletedPlaylist, "Playlist deleted successfully");
  // TODO: delete playlist
});

const updatePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  const { name, description } = req.body;

  if (!name && !description) {
    throw new ApiError(400, "Provide name and description");
  }

  if (!playlistId) {
    throw new ApiError(400, "Provide a valid playlist ID");
  }

  const updatedPlaylist = await Playlist.findByIdAndUpdate(playlistId, {
    name: name,
    description: description,
  });

  if (!updatedPlaylist) {
    throw new ApiError(500, "Failed to update playlist");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, updatedPlaylist, "Playlist has been updated"));
  //TODO: update playlist
});

export {
  createPlaylist,
  getUserPlaylists,
  getPlaylistById,
  addVideoToPlaylist,
  removeVideoFromPlaylist,
  deletePlaylist,
  updatePlaylist,
};
