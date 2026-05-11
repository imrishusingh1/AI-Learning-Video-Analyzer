import mongoose from 'mongoose';

const noteSchema = new mongoose.Schema(
  {
    video: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Video',
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    summary: {
      type: String,
    },
    detailedNotes: {
      type: String, // Markdown string
    },
    topics: [
      {
        name: String,
        description: String,
        timestamp: Number,
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Note = mongoose.model('Note', noteSchema);

export default Note;
