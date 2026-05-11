import { GoogleGenerativeAI } from '@google/generative-ai';
import { GoogleAIFileManager } from '@google/generative-ai/server';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);
const fileManager = new GoogleAIFileManager(apiKey);

export const transcribeAndAnalyzeAudio = async (audioFilePath) => {
  try {
    // 1. Upload audio file to Gemini File API
    console.log(`Uploading ${audioFilePath} to Gemini...`);
    const uploadResult = await fileManager.uploadFile(audioFilePath, {
      mimeType: 'audio/mp3',
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
            "options": ["A", "B", "C", "D"],
            "correctAnswer": "The correct option exactly as written in options array",
            "explanation": "Why this answer is correct"
          }
        ]
      }
      Respond ONLY with valid JSON. Do not include markdown formatting like \`\`\`json around the response.
    `;
    
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
    
  } catch (error) {
    console.error('Error in Gemini AI Processing:', error);
    throw error;
  }
};
