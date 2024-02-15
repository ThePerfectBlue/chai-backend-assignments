import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import { ApiError } from "./ApiError.js";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) {
      throw new ApiError(400, "local file path is missing ");
    }

    //upload the file on cloudinary
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    });

    // file has been uploaded successfull
    //console.log("file is uploaded on cloudinary ", response.url);
    fs.unlinkSync(localFilePath);

    return response;
  } catch (error) {
    console.log(
      error,
      "Error uploading file to cloudinary. -from cloudinary.js"
    );
    fs.unlinkSync(localFilePath); // remove the locally saved temporary file as the upload operation got failed
    return { error: error.message };
  }
};

export { uploadOnCloudinary };
