import { GoogleGenerativeAI } from '@google/generative-ai';
import { GoogleAIFileManager } from '@google/generative-ai/server';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);
export const fileManager = new GoogleAIFileManager(apiKey);

const MIME_MAP = {
  '.mp3': 'audio/mp3',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.mkv': 'video/x-matroska',
  '.avi': 'video/x-msvideo',
  '.mov': 'video/quicktime',
  '.m4a': 'audio/m4a',
  '.ogg': 'audio/ogg',
  '.opus': 'audio/ogg',
  '.aac': 'audio/aac',
  '.pdf': 'application/pdf',
  '.txt': 'text/plain',
  '.doc': 'application/msword',
  '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
};

const ANALYSIS_PROMPT = `
  Please analyze this document/video/audio and return a JSON object with the following structure:
  {
    "title": "A short, accurate title summarizing the content",
    "transcript": "The full exact text transcript of what was spoken or the full text of the document.",
    "summary": "A 2-3 paragraph detailed summary of the main points.",
    "topics": [
      {
        "name": "Topic Name",
        "description": "Short explanation of the topic"
      }
    ],
    "notes": "Detailed study notes formatted in Markdown with bullet points.",
    "quiz": [
      {
        "question": "A multiple choice question testing a core concept?",
        "options": ["First option as full text", "Second option as full text", "Third option as full text", "Fourth option as full text"],
        "correctAnswer": "The correct option exactly as written in options array",
        "explanation": "Why this answer is correct"
      }
    ]
  }
  IMPORTANT RULES:
  - The "quiz" array MUST contain EXACTLY 5 different questions covering different topics from the video.
  - Each question MUST have EXACTLY 4 options as full meaningful sentences or phrases (not just "A", "B", "C", "D").
  - The "correctAnswer" MUST be the exact string of one of the options.
  - Respond ONLY with valid JSON. Do not include markdown formatting like \`\`\`json around the response.
`;

const runGeminiWithRetry = async (contents) => {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
  let lastError;
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const result = await model.generateContent({
        contents,
        generationConfig: { responseMimeType: 'application/json' }
      });
      return JSON.parse(result.response.text());
    } catch (err) {
      lastError = err;
      if (err.status === 503 && attempt < 3) {
        const delay = attempt * 5000;
        console.log(`Gemini 503 on attempt ${attempt}. Retrying in ${delay / 1000}s...`);
        await new Promise(r => setTimeout(r, delay));
      } else {
        throw err;
      }
    }
  }
  throw lastError;
};

// ── For YouTube URLs: pass URL directly to Gemini (no download, no Python, no bots) ──
export const analyzeYouTubeUrl = async (youtubeUrl) => {
  try {
    console.log(`Sending YouTube URL directly to Gemini: ${youtubeUrl}`);
    const contents = [{
      role: 'user',
      parts: [
        { fileData: { mimeType: 'video/*', fileUri: youtubeUrl } },
        { text: ANALYSIS_PROMPT }
      ]
    }];
    return await runGeminiWithRetry(contents);
  } catch (error) {
    console.error('Error in Gemini YouTube Analysis:', error);
    throw error;
  }
};

// ── For uploaded MP4 files: upload to Gemini File API then analyze ──
export const uploadFileToGemini = async (filePath) => {
  try {
    const ext = path.extname(filePath).toLowerCase();
    const mimeType = MIME_MAP[ext] || 'application/octet-stream';
    console.log(`Uploading ${filePath} (${mimeType}) to Gemini (no wait)...`);
    const uploadResult = await fileManager.uploadFile(filePath, {
      mimeType,
      displayName: 'User Uploaded Material',
    });
    // Return the Gemini file name (identifier) for later polling
    return uploadResult.file.name;
  } catch (error) {
    console.error('Error uploading to Gemini:', error);
    throw error;
  }
};

export const waitForGeminiFile = async (geminiFileName, pollInterval = 5000) => {
  try {
    let fileState = await fileManager.getFile(geminiFileName);
    while (fileState.state === 'PROCESSING') {
      console.log('Gemini file still processing, waiting...');
      await new Promise(res => setTimeout(res, pollInterval));
      fileState = await fileManager.getFile(geminiFileName);
    }
    if (fileState.state === 'FAILED') {
      throw new Error('Gemini processing failed');
    }
    return fileState; // should be ACTIVE
  } catch (error) {
    console.error('Error waiting for Gemini file:', error);
    throw error;
  }
};

export const analyzeGeminiFile = async (geminiFileName) => {
  try {
    // Get current file state directly (caller should have already confirmed ACTIVE)
    const fileState = await fileManager.getFile(geminiFileName);
    if (fileState.state !== 'ACTIVE') {
      throw new Error(`Gemini file is not ready (state: ${fileState.state})`);
    }
    const mimeType = fileState.mimeType;
    const uri = fileState.uri;
    const contents = [{
      role: 'user',
      parts: [
        { fileData: { mimeType, fileUri: uri } },
        { text: ANALYSIS_PROMPT }
      ]
    }];
    return await runGeminiWithRetry(contents);
  } catch (error) {
    console.error('Error analyzing Gemini file:', error);
    throw error;
  }
};
