import express from 'express';
import multer from 'multer';
import path from 'path';
import { uploadVideo, processYouTubeUrl, getMyVideos, getVideoById, cleanupOldVideos, getUploadSignature } from '../controllers/videoController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Multer storage configuration
const storage = multer.memoryStorage();

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const allowedExts = ['.mp4', '.mkv', '.avi', '.mov', '.pdf', '.doc', '.docx', '.txt'];
    if (!allowedExts.includes(ext)) {
      return cb(new Error('Only video and document files are allowed (.mp4, .pdf, .docx, .txt)'), false);
    }
    cb(null, true);
  },
  limits: { fileSize: 500 * 1024 * 1024 }, // 500MB limit
});

// Routes
// Note: cleanup route should be BEFORE /:id to avoid 'cleanup' being interpreted as an ID
router.route('/cleanup').get(cleanupOldVideos);
router.route('/upload-signature').get(protect, getUploadSignature);
router.route('/').get(protect, getMyVideos);
router.route('/:id').get(protect, getVideoById);
router.post('/upload', protect, uploadVideo);
router.get('/gemini-status/:fileName', protect, getGeminiStatus);
router.post('/analyze', protect, analyzeVideo);
