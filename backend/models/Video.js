import mongoose from 'mongoose';

const videoSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    title: {
      type: String,
      required: true,
    },
    url: {
      type: String, // Can be YouTube URL or local/S3 path
      required: true,
    },
    source: {
      type: String,
      enum: ['youtube', 'upload'],
      required: true,
    },
    duration: {
      type: Number, // In seconds
    },
    thumbnail: {
      type: String,
    },
    status: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'failed'],
      default: 'pending',
    },
  },
  {
    timestamps: true,
  }
);

const Video = mongoose.model('Video', videoSchema);

export default Video;
