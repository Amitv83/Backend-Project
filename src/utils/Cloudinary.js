import {v2 as cloudinary} from 'cloudinary';
import fs, { unlink, unlinkSync } from 'fs';


cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,    
    api_secret: process.env.CLOUDINARY_API_SECRET,
})

const uploadOnCloudinary = async(localFilePath) => {
    try {
        if(!localFilePath) return null;
        //upload file to cloudinary
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"
        })
        //console.log("File is uploaded on Cloudinary!", response.url);
        return response;
    } catch (error) {
        fs.unlinkSync(localFilePath);//delete the file from local storage
        console.error("Error uploading file to Cloudinary:", error);
    }
}

export {uploadOnCloudinary};