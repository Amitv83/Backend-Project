import mongoose, { Schema } from 'mongoose';
import mongooseAggregatePaginate from 'mongoose-aggregate-paginate-v2';

const videoSchema = new Schema(
    {
        videoFile: {
            type: String, // cloudinary url for the video file
            required: true,
        },
        thumbnail: {
            type: String, // cloudinary url for the video file
            required: true,
        },
        title: {
            type: String,
            required: true,
        },
        description: {
            type: String,
            required: true,
        },
        duration: {
            type: Number, // from cloudinary
            required: true,
        },
        duration: {
            type: Number, // from cloudinary
            default: 0,
        },
        isPublished: {
            type: Boolean, // from cloudinary
            default: true,
        },
        Owner: {
            type: Schema.Types.ObjectId,
            ref: "User"
        }
    },
    {
        timestamps: true
    }
)

videoSchema.plugin(mongooseAggregatePaginate);

export const Video = mongoose.model('Video', videoSchema);