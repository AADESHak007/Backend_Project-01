import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";


 const connectDB = async ()=>{
    try {
       const connectonInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
       console.log(`successfully connceted to the DB : ${connectonInstance.connection.host}`);
        
    } catch (error) {
        console.log("ERROR occured while connecting to DB",error) ;
        process.exit(1) ;
    }
 }
 export default connectDB;