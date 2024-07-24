import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.model.js";
import { uploadFile } from "../utils/cloudinary.js";

const registerUser = asyncHandler(async (req, res, next) => {
  //1. Taking user details from the user or frontend[req.body and multer for files]
  const { email, username, fullname,password } = req.body;

  //Validating if all the fields are filled ...
  if (
    [email, username, fullname, password].some(
      (iterator) => iterator.trim() == ""
    )
  ) {
    throw new ApiError(400, "All fields are required !!");
  }

  //2.Checking if the username or the email is already there in the database...
  const userExists = await User.findOne({
    $or: [{ email }, { username }], //add all fields that you want to check
  }); //can we use AWAIT ? we have to as the db is assumed to be at a location far from us
  if (userExists) {
    throw new ApiError(
      408,
      "User already exists either with the same email or same username"
    );
  }

  //3. check for avatar[is the name of the file] file's presence ....
  const avatarLocalPath = req.files?.avatar[0]?.path;
  console.log("avatar local path: " + avatarLocalPath) ;
  let coverImageLocalPath;
  if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
      coverImageLocalPath = req.files.coverImage[0].path
  }

  if (!avatarLocalPath) {
    throw new ApiError(401, "Avatar file is required...");
  }

  //4.uploading file on Cloudinary from the multer....
  const cloudinaryAvatarPath = await uploadFile(avatarLocalPath); //using await makes sense as it will take some time to upload
  console.log("uploading file on Cloudinary",cloudinaryAvatarPath)
  const cloudinaryCoverImagePath = await uploadFile(coverImageLocalPath);

  if (!cloudinaryAvatarPath) {
    throw new ApiError(402, "Error occurred while uploading avatar");
  }

  //5.creating a User and posting the daat in the database(Mongoose db here)..
  const user = await User.create({
    fullname,
    username,
    email,
    password,
    avatar: cloudinaryAvatarPath,
    coverImage: cloudinaryCoverImagePath || " ",
  });
  
  
  //6.checking if user is created successfully...
  const userCreated = await User.findById(user._id).select("-password -refreshToken")
  if (!userCreated) {
    throw new ApiError(500, "Error occurred while creating user");
  }

  //7. finally sending the resposne in JSON format ..
  return  res.status(200).json(
    new ApiResponse (201,userCreated,"User Registered successfully !!")
  )
});

export default registerUser;







//CRUD operations are performed on the model not on the schema or document ;