import {v2 as cloudinary} from 'cloudinary'
import fs from 'fs'


//configuration
cloudinary.config({ 
    cloud_name:process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRETS 
});

const uploadFile = async (localFilePath)=>{
    try {
        if(!localFilePath) return null ;
        //after checking for the absence of localFilePath ..
       const res = await cloudinary.uploader.upload(localFilePath,{resource_type:"auto"})
       //after being successfully uploaded
       console.log("uploaded successfully",res.url)
       fs.unlinkSync(localFilePath) ;
       return res.url ;
        
    } catch (error) {
        fs.unlinkSync(localFilePath) ;
        console.log("upload failed",error)
        return null ;
    }
}
export {uploadFile} ;