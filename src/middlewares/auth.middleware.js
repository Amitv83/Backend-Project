import { ApiErrors } from "../utils/ApiErrors.js";
import asyncHandler from "express-async-handler";
import { jwt } from "jsonwebtoken";
import { User } from "../models/user.model.js";

export const verifyJWT = asyncHandler( async(req, _, next) => {
    try {
        const token = req.cookies?.accessToken || req.headers("Authorization")?.replace("Bearer ", "");
        if(!token){
            throw new ApiErrors(401, "Unauthorized request, No token provided");
        }
    
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
    
        const user = await User.findById(decodedToken?._id).select("-password -refreshToken")
        if(!user){
            throw new ApiErrors(401, "Invalid Access Token");
        }
        
        req.user = user;
        next();
    } catch (error) {
        throw new ApiErrors(401, error?.message || "Invalid Access Token");
    }

})