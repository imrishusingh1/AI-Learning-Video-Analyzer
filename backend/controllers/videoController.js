import Video from '../models/Video.js';
import Transcript from '../models/Transcript.js';
import Note from '../models/Note.js';
import Quiz from '../models/Quiz.js';
import path from 'path';
import os from 'os';
import { extractAudio } from '../utils/ffmpegHelper.js';
import { transcribeAndAnalyzeAudio } from '../services/aiService.js';
import { uploadToCloudinary, deleteFromCloudinary } from '../services/cloudinaryService.js';
import ytdl from '@distube/ytdl-core';
import fs from 'fs';

// @desc    Upload local video and start processing
// @route   POST /api/videos/upload
// @access  Private
export const uploadVideo = async (req, res) => {
  try {
    if (!req.file || !req.file.buffer) {
      return res.status(400).json({ message: 'Please upload a video file' });
    }

    const fileName = req.file.originalname;
    const title = req.body.title || fileName;

    // 1. Upload to Cloudinary (Persistent Storage)
    console.log(`Starting Cloudinary upload for ${fileName}...`);
    const cloudUpload = await uploadToCloudinary(req.file.buffer);

    // 2. Create DB entry
    const video = await Video.create({
      user: req.user._id,
      title,
      url: cloudUpload.url, // Store Cloudinary Viewable URL
      cloudinaryPublicId: cloudUpload.publicId, // Track for deletion
      source: 'upload',
      status: 'processing',
    });

    // 3. Save to /tmp for Gemini Processing
    const tmpPath = path.join(os.tmpdir(), `${video._id}-${fileName}`);
    fs.writeFileSync(tmpPath, req.file.buffer);

    try {
      // 4. Run AI Pipeline Synchronously (Vercel requires this)
      await runAIPipeline(video, tmpPath);
      
      // Cleanup tmp file
      if (fs.existsSync(tmpPath)) fs.unlinkSync(tmpPath);
      
      // 5. Send Response
      res.status(201).json({ message: 'Video uploaded and processed successfully', video });
    } catch (pipelineError) {
      if (fs.existsSync(tmpPath)) fs.unlinkSync(tmpPath);
      throw pipelineError;
    }

  } catch (error) {
    console.error('Upload Error:', error);
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

    const info = await ytdl.getInfo(url);
    const title = info.videoDetails?.title || 'YouTube Video';

    // Create DB entry
    const video = await Video.create({
      user: req.user._id,
      title,
      url,
      source: 'youtube',
      status: 'processing',
    });

    // Process Synchronously
    await downloadAndProcessYouTube(video, url);
    res.status(201).json({ message: 'YouTube video processed successfully', video });

  } catch (error) {
    console.error('YouTube Processing Error:', error);
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

// @desc    Cleanup videos older than 7 days from Cloudinary
// @route   GET /api/videos/cleanup
// @access  Public (Protected by Vercel Cron Secret)
export const cleanupOldVideos = async (req, res) => {
  try {
    // Basic security check to ensure only Vercel Cron can trigger this (or local testing)
    const authHeader = req.headers.authorization;
    if (process.env.NODE_ENV === 'production' && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return res.status(401).json({ message: 'Unauthorized cron request' });
    }

    // 7 Days ago
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    
    // Find all videos older than 7 days that STILL have a Cloudinary ID
    const oldVideos = await Video.find({
      createdAt: { $lt: sevenDaysAgo },
      cloudinaryPublicId: { $ne: null }
    });

    let deletedCount = 0;

    for (const video of oldVideos) {
      if (video.cloudinaryPublicId && video.cloudinaryPublicId.startsWith('synapseai/')) {
        try {
          // Send delete command to Cloudinary
          await deleteFromCloudinary(video.cloudinaryPublicId);
          
          // Clear the URL and PublicID from database so frontend knows it's gone
          // But keep the actual Video document, Transcript, and Notes!
          video.url = null;
          video.cloudinaryPublicId = null;
          await video.save();
          
          deletedCount++;
        } catch (err) {
          console.error(`Failed to cleanup video ${video._id}:`, err);
        }
      }
    }

    res.json({ message: `Cleanup complete. Deleted ${deletedCount} old videos.` });
  } catch (error) {
    console.error('Cleanup Error:', error);
    res.status(500).json({ message: error.message });
  }
};

// --- Background Pipeline Methods ---

const runAIPipeline = async (videoDoc, audioPath) => {
  try {
    // 3. AI Processing (Transcription, Notes, Quiz)
    console.log(`Starting AI processing for ${videoDoc._id}...`);
    const aiResults = await transcribeAndAnalyzeAudio(audioPath);
    
    // 4. Save results to DB with fallbacks to prevent validation errors
    await Transcript.create({
      video: videoDoc._id,
      fullText: aiResults.transcript || 'Transcript not available.',
      segments: []
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
    console.error('Error in AI processing pipeline:', error);
    videoDoc.status = 'failed';
    await videoDoc.save();
  }
};

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

    // Call AI pipeline
    await runAIPipeline(videoDoc, audioPath);
    
  } catch (error) {
    console.error('Error in local processing pipeline:', error);
    videoDoc.status = 'failed';
    await videoDoc.save();
  }
};

const downloadAndProcessYouTube = async (videoDoc, youtubeUrl) => {
  let resolvedPath = null;
  try {
    const tmpDir = os.tmpdir();
    resolvedPath = path.join(tmpDir, `${videoDoc._id}-audio.webm`);
    
    console.log(`Starting YouTube audio download for ${videoDoc._id} to ${tmpDir}...`);
    
    // Download audio using pure JS library (bypasses python requirement on Vercel)
    await new Promise((resolve, reject) => {
      const audioStream = ytdl(youtubeUrl, { quality: 'highestaudio' });
      const writeStream = fs.createWriteStream(resolvedPath);
      
      audioStream.pipe(writeStream);
      
      audioStream.on('error', (err) => reject(err));
      writeStream.on('finish', () => resolve());
      writeStream.on('error', (err) => reject(err));
    });
    
    console.log('YouTube audio downloaded successfully');
    
    if (!fs.existsSync(resolvedPath)) {
      throw new Error("Failed to locate downloaded audio file in /tmp");
    }

    // Call AI pipeline using the temporary file
    await runAIPipeline(videoDoc, resolvedPath);

    // Cleanup tmp file
    if (fs.existsSync(resolvedPath)) fs.unlinkSync(resolvedPath);

  } catch (error) {
    if (resolvedPath && fs.existsSync(resolvedPath)) fs.unlinkSync(resolvedPath);
    console.error('Error in YouTube download pipeline:', error);
    videoDoc.status = 'failed';
    await videoDoc.save();
    throw error;
  }
};
