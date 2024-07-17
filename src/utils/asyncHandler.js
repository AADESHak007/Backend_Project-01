import { request } from "express"

const asyncHandler = (requestHandler)=> async(req,res,next)=>{
    try {
        await request(req,res,next)        
    } catch (error) {
        res.status(error.code||500).json({
            message : error.message,
            success : false
        })
    }
}