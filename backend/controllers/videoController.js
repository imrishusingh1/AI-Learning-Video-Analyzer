import Video from '../models/Video.js';
import Transcript from '../models/Transcript.js';
import Note from '../models/Note.js';
import Quiz from '../models/Quiz.js';
import path from 'path';
import os from 'os';
import { extractAudio } from '../utils/ffmpegHelper.js';
import { uploadFileToGemini, analyzeGeminiFile, analyzeYouTubeUrl, fileManager } from '../services/aiService.js';
import { uploadToCloudinary, deleteFromCloudinary, generateUploadSignature } from '../services/cloudinaryService.js';
import fs from 'fs';

// @desc    Get Cloudinary Upload Signature
// @route   GET /api/videos/upload-signature
// @access  Private
export const getUploadSignature = (req, res) => {
  try {
    const signatureData = generateUploadSignature();
    res.json(signatureData);
  } catch (error) {
    console.error('Signature Error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Process uploaded video URL (creates DB entry and uploads to Gemini)
// @route   POST /api/videos/upload
// @access  Private
export const uploadVideo = async (req, res) => {
  try {
    const { fileUrl, publicId, fileName, title } = req.body;
    if (!fileUrl) {
      return res.status(400).json({ message: 'Please provide a file URL' });
    }

    const videoTitle = title || fileName || 'Uploaded Document';

    // 1. Create DB entry (status pending until Gemini file is ready)
    const video = await Video.create({
      user: req.user._id,
      title: videoTitle,
      url: fileUrl,
      cloudinaryPublicId: publicId,
      source: 'upload',
      status: 'pending',
    });

    // 2. Download file to temp directory
    const tmpPath = path.join(os.tmpdir(), `${video._id}-${fileName}`);
    console.log(`Downloading ${fileUrl} to ${tmpPath}...`);
    const response = await fetch(fileUrl);
    if (!response.ok) throw new Error(`Failed to download file: ${response.statusText}`);
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    fs.writeFileSync(tmpPath, buffer);

    // 3. Upload to Gemini and store the file name
    const geminiFileName = await uploadFileToGemini(tmpPath);

    // Cleanup temp file
    if (fs.existsSync(tmpPath)) fs.unlinkSync(tmpPath);

    // 4. Update video record with Gemini reference
    video.geminiFileName = geminiFileName;
    video.status = 'uploaded';
    await video.save();

    // 5. Respond with IDs for client to poll
    res.status(201).json({
      message: 'File uploaded and queued for processing',
      videoId: video._id,
      geminiFileName,
    });
  } catch (error) {
    console.error('Upload Error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get Gemini file processing status for a video
// @route   GET /api/videos/:id/gemini-status
// @access  Private
export const getGeminiStatus = async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);
    if (!video) return res.status(404).json({ message: 'Video not found' });
    if (!video.geminiFileName) return res.json({ state: 'PENDING' });
    const fileInfo = await fileManager.getFile(video.geminiFileName);
    res.json({ state: fileInfo.state });
  } catch (error) {
    console.error('Gemini status error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Analyze Gemini file and store results
// @route   POST /api/videos/analyze
// @access  Private
export const analyzeVideo = async (req, res) => {
  try {
    const { videoId, geminiFileName } = req.body;
    if (!videoId || !geminiFileName) {
      return res.status(400).json({ message: 'videoId and geminiFileName required' });
    }
    const video = await Video.findById(videoId);
    if (!video) return res.status(404).json({ message: 'Video not found' });

    // Run analysis on Gemini file (expects ACTIVE state)
    const aiResults = await analyzeGeminiFile(geminiFileName);

    // Store results (reuse logic from runAIPipeline but without audio extraction)
    await Transcript.create({
      video: video._id,
      fullText: aiResults.transcript || 'Transcript not available.',
      segments: [],
    });
    await Note.create({
      video: video._id,
      user: video.user,
      summary: aiResults.summary,
      detailedNotes: aiResults.notes,
      topics: aiResults.topics,
    });
    await Quiz.create({
      video: video._id,
      user: video.user,
      questions: aiResults.quiz,
    });
    video.title = aiResults.title || video.title;
    video.status = 'completed';
    await video.save();
    res.json({ message: 'Analysis complete', video });
  } catch (error) {
    console.error('Analysis error:', error);
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

    // Create DB entry with URL as title placeholder — Gemini will extract real title from video
    const video = await Video.create({
      user: req.user._id,
      title: 'Processing...',
      url,
      source: 'youtube',
      status: 'processing',
    });

    // Process in background — pass URL directly to Gemini, no download needed
    downloadAndProcessYouTube(video, url).catch(err => {
      console.error('Background YouTube processing failed:', err);
    });

    res.status(201).json({ message: 'YouTube video queued for processing', video });

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
  try {
    console.log(`Sending ${videoDoc._id} to Gemini via YouTube URL (no download needed)...`);
    
    // Gemini natively supports YouTube URLs — pass it directly, no download required!
    const aiResults = await analyzeYouTubeUrl(youtubeUrl);

    // Save AI results to DB
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

    // Extract title from Gemini response if available
    videoDoc.title = aiResults.title || videoDoc.title;
    videoDoc.status = 'completed';
    await videoDoc.save();

    console.log(`Processing complete for ${videoDoc._id}`);
  } catch (error) {
    console.error('Error in YouTube processing pipeline:', error);
    videoDoc.status = 'failed';
    await videoDoc.save();
  }
};
