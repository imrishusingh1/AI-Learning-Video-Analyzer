import mongoose from 'mongoose';

const transcriptSchema = new mongoose.Schema(
  {
    video: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Video',
    },
    fullText: {
      type: String,
      required: true,
    },
    segments: [
      {
        start: Number,
        end: Number,
        text: String,
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Transcript = mongoose.model('Transcript', transcriptSchema);

export default Transcript;
