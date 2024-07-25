import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.model.js";
import { uploadFile } from "../utils/cloudinary.js";



const generateTokens = async (userId)=>{

  try {
    //find the user witht the userId..
    const user = User.findById(userId) ;
    const AccessToken =  await user.generateAccessToken() ;
    const RefreshToken = await user.generateRefreshToken() ;

    //sending the refresh token to the db .
    user.refershToken = RefreshToken
    await user.save({validateBeforeSave: false}) //db operation 

    return {AccessToken,RefreshToken} ;

    
  } catch (error) {
    throw new ApiError(500,"error occurred while generating tokens")
  }
}



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
const loginUser =asyncHandler(async (req,res)=>{
  //1.REQUESTING FOR THE DATA ENTERED BY THE USER [EXPRESS]
  const{email,username,password} = req.body ;

  //2.checking if the fields are not empty...

  if(!email ||!username ||password){
    throw new ApiError(400,"All fields are required!!")
  }
  
  //3.finding the user in the database ...
  const user =await User.findOne({
    $or:[{email},{username}]
  })
      //3.1 if the user is not in the db ..
  if(!user) throw new ApiError(404,"user not found")

  //4.validating the password ....
  const validatePassword = await user.checkPassword(password) ;

  if(!validatePassword) throw new ApiError(401,"invalid user credentials")

    //generating refresh token and access token..
    const {AccessToken,RefreshToken}= await generateTokens(user._id) ;
    //the token field in our db is still empty,so either we make another db call 
    //or we update the token field here.
    user.accessToken = AccessToken;
    user.refreshToken = RefreshToken;
    await user.save({validateBeforeSave: false}) //db operation

    const loggedInUser =user.select("-password -refreshToken") ;
    
    //generating option for security measures..
    const options ={
      httpOnly:true,
      secure:true
    }
    
    
    //5. sending the response in JSON format...

    return res
    .status(200)
    .cookie("accessToken", AccessToken ,options)
    .cookie("refreshToken", RefreshToken ,options)
    .json(new ApiResponse(
      200,
      {user :loggedInUser,AccessToken,RefreshToken},
      "User logged in successfully"
    ))


    
})
const logoutUser = asyncHandler(async (req,res)=>{
  await User.findByIdAndUpdate(req.user._id,{
    $unset :{
      refreshToken:undefined
    }
  },
{
  new:true
})
const options ={
  httpOnly:true,
  secure:true
}
return res
.status(200)
.clearCookie("accessToken", options)
.clearCookie("refreshToken", options)
.json(new ApiResponse(200, {}, "User logged Out"))
})

export {registerUser,loginUser,logoutUser};







//CRUD operations are performed on the model not on the schema or document ;