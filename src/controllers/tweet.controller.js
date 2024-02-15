import mongoose, { isValidObjectId } from "mongoose";
import { Tweet } from "../models/tweet.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const createTweet = asyncHandler(async (req, res) => {
  const { content } = req.body;
  if (!content) {
    throw new ApiError(400, "Tweet content missing");
  }

  const owner = req.user?._id;

  const newTweet = await Tweet.create({
    content: content,
    owner: owner,
  });

  await newTweet.populate("owner", "username");

  if (!newTweet) {
    throw new ApiError(400, "Error while creating the tweet");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, newTweet, "Tweet created successfully"));

  //TODO: create tweet
});

const getUserTweets = asyncHandler(async (req, res) => {
  // TODO: get user tweets
  const userId = req.params.userId;

  if (!isValidObjectId(userId)) {
    throw new ApiError(400, "Provide a valid user ID");
  }

  const tweets = await Tweet.find({ owner: userId }).populate(
    "owner",
    "username"
  );

  if (!tweets) {
    throw new ApiError(400, " Tweets not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, tweets, "Tweets fetched successfully"));
});

const updateTweet = asyncHandler(async (req, res) => {
  //TODO: update tweet
  const userId = req.user?._id;
  const { content } = req.body;
  const tweetId = req.params?.tweetId;
  if (!isValidObjectId(tweetId)) {
    throw new ApiError(400, "Give a valid tweetId");
  }

  const tweet = await Tweet.findById(tweetId);

  if (!userId.equals(tweet.owner)) {
    throw new ApiError(401, "Unauthorize person to update tweet");
  }

  const updatedTweet = await Tweet.findByIdAndUpdate(
    tweetId,
    {
      $set: {
        content: content,
      },
    },
    {
      new: true,
    }
  );

  return res
    .status(200)
    .json(new ApiResponse(200, updatedTweet, "Tweet updated successfully"));
});

const deleteTweet = asyncHandler(async (req, res) => {
  //TODO: delete tweet
  const tweetId = req.params.tweetId;
  const userId = req.user?._id;

  if (!isValidObjectId) {
    throw new ApiError(400, "Give a valid tweet ID to delete");
  }

  const tweet = await Tweet.findById(tweetId);

  if (!userId.equals(tweet.owner)) {
    throw new ApiError(401, "Unauthorize user to delete tweet");
  }

  const deletedTweet = await Tweet.findByIdAndDelete(tweetId);

  return res
    .status(200)
    .json(new ApiResponse(200, deletedTweet, "Tweet deleted successfully"));
});

export { createTweet, getUserTweets, updateTweet, deleteTweet };
