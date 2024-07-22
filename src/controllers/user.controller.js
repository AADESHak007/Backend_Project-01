import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.model.js";
import { uploadFile } from "../utils/cloudinary.js";

const registerUser = asyncHandler(async (req, res, next) => {
  //1. Taking user details from the useror frontend[req.body and multer for files]
  const { email, username, fullname, avatar, coverImage, password } = req.body;
  console.log("email :", email);

  //Validating if all the fields are filled ...
  if (
    [email, username, fullname, password].some(
      (iterator) => iterator.trim() == ""
    )
  ) {
    throw new ApiError(400, "All fields are required !!");
  }

  //2.Checking if the username or the email is already there in the database...
  const userExists = User.findOne({
    $or: [{ email }, { username }], //add all fields that you want to check
  }); //can we use AWAIT ?
  if (userExists) {
    throw new ApiError(
      408,
      "User already exists either with the same email or same username"
    );
  }

  //3. check for avatar file's presence ....
  const avatarLocalPath = req.files?.avatar[0]?.path;
  const coverImageLocalPath = req.files?.coverImage[0]?.path;

  if (!avatarLocalPath) {
    throw new ApiError(401, "Avatar file is required...");
  }

  //4.uploading file on Cloudinary from the multer....
  const avatarPath = await uploadFile(avatarLocalPath); //using await makes sense as it will take some time to upload
  const coverImagePath = await uploadFile(coverImageLocalPath);

  if (!avatarPath) {
    throw new ApiError(402, "Error occurred while uploading avatar");
  }

  //5.creating a User and posting the daat in the database(Mongoose db here)..
  const user = await User.create({
    fullname,
    username,
    email,
    password,
    refreshToken,
    avatar: avatarPath.url,
    coverImage: coverImagePath?.url || " ",
  });
  
  
  //6.checking if user is created successfully...
  const userCreated = await user.findbyId(user._id).select("-password -refreshToken")
  if (!userCreated) {
    throw new ApiError(500, "Error occurred while creating user");
  }

  //7. finally sending the resposne in JSON format ..
  return  res.status(200).json(
    new ApiResponse (201,userCreated,"User Registered successfully !!")
  )
});

export default registerUser;
