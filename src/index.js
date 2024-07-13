import dotenv from "dotenv" ;
import connectDB from "./db/index.js";




dotenv.config({
    path : "./.env"
})

//connecting to the DB
connectDB() ;




// const app = express() ;
// // Connect to MongoDB
// (async ()=>{
//     try {
//         await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
//         app.on("error",(e)=>{
//             console.log("ERROR :",e) ;
//         })
//         app.listen(process.env.PORT,()=>{
//             console.log(`the app is listening on ${process.env.PORT}`) ;
//         })
//     } catch (error) {
//         console.error("ERROR",error)
//     }
// })()