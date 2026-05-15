import { GoogleGenerativeAI } from '@google/generative-ai';
import { GoogleAIFileManager } from '@google/generative-ai/server';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);
const fileManager = new GoogleAIFileManager(apiKey);

const MIME_MAP = {
  '.mp3':  'audio/mpeg',
  '.mp4':  'audio/mp4',
  '.m4a':  'audio/mp4',
  '.webm': 'audio/webm',
  '.ogg':  'audio/ogg',
  '.opus': 'audio/ogg',
  '.wav':  'audio/wav',
  '.flac': 'audio/flac',
  '.aac':  'audio/aac',
};

export const transcribeAndAnalyzeAudio = async (audioFilePath) => {
  try {
    // 1. Detect actual file on disk (yt-dlp may save as .webm/.m4a even if .mp3 was requested)
    let resolvedPath = audioFilePath;
    if (!fs.existsSync(resolvedPath)) {
      // Try common alternative extensions yt-dlp may have used
      const base = resolvedPath.replace(/\.[^.]+$/, '');
      for (const ext of ['.webm', '.m4a', '.ogg', '.opus', '.mp4', '.aac']) {
        if (fs.existsSync(base + ext)) {
          resolvedPath = base + ext;
          console.log(`Resolved audio file: ${resolvedPath}`);
          break;
        }
      }
    }

    const ext = path.extname(resolvedPath).toLowerCase();
    const mimeType = MIME_MAP[ext] || 'audio/webm';

    // 2. Upload audio file to Gemini File API
    console.log(`Uploading ${resolvedPath} (${mimeType}) to Gemini...`);
    const uploadResult = await fileManager.uploadFile(resolvedPath, {
      mimeType,
      displayName: 'Video Audio Extract',
    });
    
    console.log(`File uploaded: ${uploadResult.file.uri}`);
    
    // 2. Setup Gemini model
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    
    // 3. Prompt for unified analysis
    const prompt = `
      Please analyze this audio file and return a JSON object with the following structure:
      {
        "transcript": "The full exact text transcript of what was spoken.",
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
      - The "quiz" array MUST contain EXACTLY 5 different questions covering different topics from the audio.
      - Each question MUST have EXACTLY 4 options as full meaningful sentences or phrases (not just "A", "B", "C", "D").
      - The "correctAnswer" MUST be the exact string of one of the options.
      - Respond ONLY with valid JSON. Do not include markdown formatting like \`\`\`json around the response.
    `;
    
    // Retry logic for 503 / overload errors (up to 3 attempts)
    let lastError;
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        const result = await model.generateContent({
          contents: [
            {
              role: 'user',
              parts: [
                {
                  fileData: {
                    mimeType: uploadResult.file.mimeType,
                    fileUri: uploadResult.file.uri
                  }
                },
                { text: prompt }
              ]
            }
          ],
          generationConfig: {
            responseMimeType: "application/json",
          }
        });
        const responseText = result.response.text();
        return JSON.parse(responseText);
      } catch (err) {
        lastError = err;
        if (err.status === 503 && attempt < 3) {
          const delay = attempt * 5000; // 5s, 10s
          console.log(`Gemini 503 on attempt ${attempt}. Retrying in ${delay / 1000}s...`);
          await new Promise(r => setTimeout(r, delay));
        } else {
          throw err;
        }
      }
    }
    throw lastError;
    
  } catch (error) {
    console.error('Error in Gemini AI Processing:', error);
    throw error;
  }
};
