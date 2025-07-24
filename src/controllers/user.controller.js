import {asyncHandler} from '../utils/asyncHandler.js';
import { ApiErrors } from '../utils/ApiErrors.js';
import { uploadOnCloudinary } from '../utils/Cloudinary.js';
import { ApiResponse } from '../utils/ApiResponse.js';

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

    const {fullname, username, email, password} = req.body
    console.log(fullname,password)

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

    const existedUser=User.findOne({
        $or: [{ username },{ email }]
    })

    if(existedUser){
        throw new ApiErrors(409, 
            "Username or email already exists"
        );
    }

    const avatarLocalPath = req.files?.avatar[0]?.path
    const coverImageLocalPath = req.files?.coverImage[0]?.path

    if(!avatarLocalPath){
        throw new ApiErrors(400, 
            "Avatar image is required"
        );
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPathLocalPath)
    if(!avatar){
        throw new ApiErrors(500, 
            "Avatar image upload failed"
        );
    }

    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        // password: hashPassword(password), // Assuming you have a function to hash passwords
        username: username.toLowerCase(),
    })

    const createdUser = await user.findById(user._id).select(
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

export { registerUser };
