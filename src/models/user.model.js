import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import jwt from "jsonwebtoken";

const userSchema = new mongoose.Schema({
    username :{
        type : String ,
        required : true,
        unique : true,
        index: true
    },
    password :{
        type : String,
        required :[true,"password is required !!!!"]
    },
    fullname : {
        type : String,
        required : true,
        index : true,
        trim:true
        
    },
    avatar : {
        type : String, //cloudinary
        required : true,  
    },
   coverImage: {
        type : String, //cloudinary
    },
    watchHistory : [
       { type:Schema.Types.ObjectId ,
        ref: 'Video' 
       }
    ],
    refershToken: {
        type:String 
    }

},{timestamps:true}) 

// hashing the password before saving it to the database by using PRE 
userSchema.pre("save",async function (next) {
    if(!this.isModified("password")) return next() ;
    //this will hash  the password only the password field is bieng modified
    this.password = bcrypt.hash(this.password ,10) 
    next() ;
})
//creating a our own method for validating the password entered  by the user
userSchema.methods.checkPassword = async function(password){
    return await bcrypt.compare(password,this.password) ;
}
//generating the JWT for sessions
userSchema.methods.generateAccessToken = function (){
   return jwt.sign({
        _id : this._id ,
        email : this.email ,
        username :this.username,
        fullName : this.fullName 
    },
    process.env.ACCESS_TOKEN_SECRET ,
    {
        expiresIn : process.env.ACCESS_TOKEN_EXPIRY
    }
)
}
userSchema.methods.generateReefreshToken = function (){
   return jwt.sign({
        _id : this._id ,
    },
    process.env.REFRESH_TOKEN_SECRET ,
    {
        expiresIn : process.env.REFRESH_TOKEN_EXPIRY
    }
)
}
export const User = mongoose.model('User',userSchema);