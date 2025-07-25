import mongoose, { Schema } from 'mongoose';
import becrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const userSchema = new Schema(
    {
        username: {
            type: String,
            required: true,
            lowercase: true,
            unique: true,
            trim: true,
            index: true,
        },
        email: {
            type: String,
            required: true,
            lowercase: true,
            unique: true,
            trim: true,
        },
        fullname: {
            type: String,
            required: true,
            trim: true,
            index: true,
        },
        avatar: {
            type: String, //cloudinary url 
            required: true,
        },
        coverImage: {
            type: String, //cloudinary url 
        },
        watchHistory: {
            type: Schema.Types.ObjectId, // Array of video IDs
            ref: "video",
        },
        password: {
            type: String,
            required: [true, 'Password is required'],
        },
        refreshToken: {
            type: String,
        }

    },
    {
        timestamp: true
    }
)

userSchema.pre("save" , async function (next){
    if(!this.isModified("password")) return next();

    this.password = await becrypt.hash(this.password, 7);
    next();
})
userSchema.methods.isPasswrdCorrect = async function (password) {
    return await becrypt.compare(password, this.password);
}

userSchema.methods.generateAccessToken = function () {
    jwt.sign({
        _id: this._id,
        username: this.username,
        email: this.email,
        fullname: this.fullname,
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}
userSchema.methods.generateRefreshToken = function () {
    jwt.sign(
        {
            _id: this._id,
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}

export const User = mongoose.model('User', userSchema);