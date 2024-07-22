import {v2 as cloudinary} from 'cloudinary'
import fs from 'fs'


//configuration
cloudinary.config({ 
    cloud_name: CLOUDINARY_CLOUD_NAME, 
    api_key: CLOUDINARY_API_KEY, 
    api_secret: CLOUDINARY_API_SECRET // Click 'View Credentials' below to copy your API secret
});

const uploadFile = async (localFilePath)=>{
    try {
        if(!localFilePath) return null ;
        //after checking for the absence of localFilePath ..
       const res = await cloudinary.uploader.upload(localFilePath,{resource_type:"auto"})
       //after being successfully uploaded
       console.log("uploaded successfully",res.url)
       return res ;
        
    } catch (error) {
        fs.unlinkSync(localFilePath) ;
        return null ;
    }
}
export {uploadFile} ;