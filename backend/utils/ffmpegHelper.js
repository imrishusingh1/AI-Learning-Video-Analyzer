import ffmpeg from 'fluent-ffmpeg';
import ffmpegInstaller from '@ffmpeg-installer/ffmpeg';
import fs from 'fs';
import path from 'path';

// Set the path to the statically compiled FFmpeg binary
ffmpeg.setFfmpegPath(ffmpegInstaller.path);

/**
 * Extracts audio from a video file and saves it as an MP3.
 * @param {string} videoPath - The path to the input video.
 * @param {string} audioOutputPath - The path for the output audio file.
 * @returns {Promise<string>} - Resolves with the audio file path on success.
 */
export const extractAudio = (videoPath, audioOutputPath) => {
  return new Promise((resolve, reject) => {
    // Check if file exists
    if (!fs.existsSync(videoPath)) {
      return reject(new Error('Input video file not found'));
    }

    ffmpeg(videoPath)
      .noVideo() // Remove video stream
      .audioCodec('libmp3lame') // Use mp3 codec
      .audioBitrate('128k') // Moderate bitrate for AI transcription
      .on('end', () => {
        resolve(audioOutputPath);
      })
      .on('error', (err) => {
        console.error('Error during audio extraction:', err);
        reject(err);
      })
      .save(audioOutputPath);
  });
};
