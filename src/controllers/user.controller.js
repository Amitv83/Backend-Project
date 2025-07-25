import {asyncHandler} from '../utils/asyncHandler.js';
import { ApiErrors } from '../utils/ApiErrors.js';
import { uploadOnCloudinary } from '../utils/Cloudinary.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { User } from '../models/user.model.js';
import { use } from 'react';

const generateAccessAndRefreshTokens = async (user) => {
    try {
        const accessToken = await user.generateAccessToken();
        const refreshToken = await user.generateRefreshToken();

        user.refreshToken = refreshToken;
        // Save user with refresh token
        await user.save(validateBeforeSave = false);

        return { accessToken, refreshToken };

    } catch (error) {
        throw new ApiErrors(500, "Error generating tokens");
    }
}


const registerUser = asyncHandler(async (req, res) => {
    // Registration logic here
    // res.status(201).json({ 
    //     message: "Ok" 
    // });

    // Steps to write Controller Functionality: Breaking down the process(Big problem into smaller steps)
    /*
    1. Get user detail from frontend
    2. Validation of user data
    3. Check if user already exists
    4. check for images and avatar
    5. Upload images to cloudinary, and ensure upload is successful
    6. create user object and save to database
    7. Remove password and refresh token from user object
    8. check for user creation success
    9. Send response to frontend with user data.
    */ 
   console.log(req);
    const {fullname, username, email, password} = req.body

    // if(fullname === ""){
    //     throw new ApiErrors(400, "Fullname is required");
    // }

    if(
        [fullname, username, email, password].some((field) => {
            field?.trim() === "";
        })
    ){
        throw new ApiErrors(400, 
            "All fields are required"
        );
    }

    const existedUser = await User.findOne({
        $or: [{ username },{ email }]
    })

    if(existedUser){
        throw new ApiErrors(409, 
            "Username or email already exists"
        );
    }

    const avatarLocalPath = req.files?.avatar[0]?.path
    const coverImageLocalPath = req.files?.coverImage?.coverImage[0]?.path

    if(!avatarLocalPath){
        throw new ApiErrors(400, 
            "Avatar image is required"
        );
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)
    if(!avatar){
        throw new ApiErrors(500, 
            "Avatar image upload failed"
        );
    }

    const user = await User.create({
        fullname,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        // password: hashPassword(password), // Assuming you have a function to hash passwords
        username: username.toLowerCase(),
    })

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )
    if(!createdUser){
        throw new ApiErrors(500, 
            "User creation failed"
        );
    }
    res.status(201).json(
        new ApiResponse(201, createdUser, "User registered successfully")
    );
    
})

const loginUser = asyncHandler( async(req, res) => {
    // Steps to process Login
    /*
    1. req body -> user credentials
    2. username or email validation
    3. Check if user exists
    4. Check if password is correct
    5. Generate access token and refresh token
    6. Send cookies with tokens
    */

    const { username, email, password } = req.body
    if(!username || !email){
        throw new ApiErrors(400, "Username and email are required");
    }

    const user = await User.findOne({
        $or: [{ username }, { email }]
    })

    if(!user){
        throw new ApiErrors(404, "User does not exist, Register first");
    }
    const isPasswordCorrect = await user.isPasswordCorrect(password)
    if(!isPasswordCorrect){
        throw new ApiErrors(407, "Incorrect password");
    }

    const {accesshToken, refreshToken} = await generateAccessAndRefreshTokens(user)

    const loggedInUser = await User.select(
        "-password -refreshToken"
    )

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
    .status(207)
    .cookie("accessToken", accesshToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
        new ApiResponse(
            207, 
            {
                loggedInUser,
                accesshToken,
                refreshToken
            }, 
            "User logged in successfully (❁´◡`❁)"
        )
    )
})

const logOutUser = asyncHandler(async (req, res) => {
    // Steps to process Logout
    /*
    1. Clear cookies
    2. Send response
    */
    
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                refreshToken: undefined
            }
        },
        {
            new: true
        }
    )
    
    const options = {
        httpOnly: true,
        secure: true
    }

    return res
    .status(218)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options) 
    .json(
        new ApiResponse(218, "User logged out 😒")
    )   
})

export { 
    registerUser,
    loginUser,
    logOutUser 
};
