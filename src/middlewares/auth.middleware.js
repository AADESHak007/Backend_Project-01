import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from 'jsonwebtoken' ;
import { User } from "../models/user.model.js";


const verifyJWT = asyncHandler(async (req,res,next)=>{
   try {
    const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ","")
 console.log(token) ;
    if(!token){
     throw new ApiError(401,"Unathorized access") //message modifiable??
    }
 
   const decodedToken = jwt.verify(token,process.env.ACCESS_TOKEN_SECRET) ; // to verify the token is valid or not
   console.log(decodedToken) ;
 
  const user = await User.findById(decodedToken?._id).select("-password -refreshToken") ;
 
  if(!user){
     throw new ApiError(401,"User Not Found")
   }
   req.user = user ;
   next() ;
   } catch (error) {
      console.log(error.message)
    throw new ApiError(401,"Invalid !! Access Denied")
   }

})
export {verifyJWT} ;