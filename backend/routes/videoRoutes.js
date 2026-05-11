import express from 'express';
import multer from 'multer';
import path from 'path';
import { uploadVideo, processYouTubeUrl, getMyVideos, getVideoById } from '../controllers/videoController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Multer storage configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (ext !== '.mp4' && ext !== '.mkv' && ext !== '.avi' && ext !== '.mov') {
      return cb(new Error('Only video files are allowed'), false);
    }
    cb(null, true);
  },
  limits: { fileSize: 500 * 1024 * 1024 }, // 500MB limit
});

// Routes
router.route('/').get(protect, getMyVideos);
router.route('/:id').get(protect, getVideoById);
router.post('/upload', protect, upload.single('video'), uploadVideo);
router.post('/youtube', protect, processYouTubeUrl);

export default router;
