import Video from '../models/Video.js';
import Transcript from '../models/Transcript.js';
import Note from '../models/Note.js';
import Quiz from '../models/Quiz.js';
import path from 'path';
import { extractAudio } from '../utils/ffmpegHelper.js';
import { transcribeAndAnalyzeAudio } from '../services/aiService.js';
import youtubedl from 'youtube-dl-exec';
import fs from 'fs';

// @desc    Upload local video and start processing
// @route   POST /api/videos/upload
// @access  Private
export const uploadVideo = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Please upload a video file' });
    }

    const videoPath = req.file.path;
    const title = req.body.title || req.file.originalname;

    // Create DB entry
    const video = await Video.create({
      user: req.user._id,
      title,
      url: videoPath,
      source: 'upload',
      status: 'pending',
    });

    res.status(201).json({ message: 'Video uploaded successfully', video });

    // Asynchronously process video
    processVideoPipeline(video, videoPath);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Process YouTube URL
// @route   POST /api/videos/youtube
// @access  Private
export const processYouTubeUrl = async (req, res) => {
  try {
    const { url } = req.body;

    const isValidYoutube = url.includes('youtube.com/') || url.includes('youtu.be/');
    if (!url || !isValidYoutube) {
      return res.status(400).json({ message: 'Please provide a valid YouTube URL' });
    }

    const info = await youtubedl(url, { dumpSingleJson: true, noCheckCertificates: true, noWarnings: true });
    const title = info.title || 'YouTube Video';

    // Create DB entry
    const video = await Video.create({
      user: req.user._id,
      title,
      url,
      source: 'youtube',
      status: 'pending',
    });

    res.status(201).json({ message: 'YouTube video queued successfully', video });

    // Download video then process
    downloadAndProcessYouTube(video, url);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user videos
// @route   GET /api/videos
// @access  Private
export const getMyVideos = async (req, res) => {
  try {
    const videos = await Video.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(videos);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get video details by ID including AI results
// @route   GET /api/videos/:id
// @access  Private
export const getVideoById = async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);

    if (!video) {
      return res.status(404).json({ message: 'Video not found' });
    }

    // Check if user owns the video
    if (video.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized to view this video' });
    }

    // Fetch associated AI data
    const transcript = await Transcript.findOne({ video: video._id });
    const note = await Note.findOne({ video: video._id });
    const quiz = await Quiz.findOne({ video: video._id });

    res.json({
      video,
      transcript,
      note,
      quiz
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// --- Background Pipeline Methods ---

const processVideoPipeline = async (videoDoc, videoFilePath) => {
  try {
    // 1. Update status to processing
    videoDoc.status = 'processing';
    await videoDoc.save();
    
    // 2. Extract Audio
    const audioPath = path.join('uploads', `${videoDoc._id}-audio.mp3`);
    console.log(`Starting audio extraction for ${videoDoc._id}...`);
    await extractAudio(videoFilePath, audioPath);
    console.log(`Audio extracted to ${audioPath}`);

    // 3. AI Processing (Transcription, Notes, Quiz)
    console.log(`Starting AI processing for ${videoDoc._id}...`);
    const aiResults = await transcribeAndAnalyzeAudio(audioPath);
    
    // 4. Save results to DB
    await Transcript.create({
      video: videoDoc._id,
      fullText: aiResults.transcript,
      segments: [] // Gemini 1.5 Pro doesn't give timestamps easily in a single prompt without complex schema, leaving empty for now
    });
    
    await Note.create({
      video: videoDoc._id,
      user: videoDoc.user,
      summary: aiResults.summary,
      detailedNotes: aiResults.notes,
      topics: aiResults.topics
    });
    
    await Quiz.create({
      video: videoDoc._id,
      user: videoDoc.user,
      questions: aiResults.quiz
    });
    
    // 5. Mark as completed
    videoDoc.status = 'completed';
    await videoDoc.save();
    console.log(`Processing complete for ${videoDoc._id}`);
    
  } catch (error) {
    console.error('Error in processing pipeline:', error);
    videoDoc.status = 'failed';
    await videoDoc.save();
  }
};

const downloadAndProcessYouTube = async (videoDoc, youtubeUrl) => {
  try {
    videoDoc.status = 'processing';
    await videoDoc.save();

    const videoPathRelative = path.join('uploads', `${videoDoc._id}.mp4`);
    const videoPathAbsolute = path.join(process.cwd(), videoPathRelative);
    
    // Download highest quality audio-containing format to mp4 using relative path
    await youtubedl(youtubeUrl, {
      output: videoPathRelative,
      format: 'best',
      noCheckCertificates: true,
      noWarnings: true
    });
    
    console.log('YouTube video downloaded successfully');
    
    // Now use the standard pipeline
    await processVideoPipeline(videoDoc, videoPathAbsolute);

  } catch (error) {
    console.error('Error in YouTube download pipeline:', error);
    videoDoc.status = 'failed';
    await videoDoc.save();
  }
};
