# 🧠 AI Learning Video Analyzer

A full-stack, AI-powered learning platform designed to transform educational videos and YouTube links into comprehensive study materials. By leveraging the power of **Google Gemini 2.5 Flash** and advanced multimedia processing, this tool automatically generates transcripts, structured study notes, extracted topics, and interactive quizzes from any video content.


## 🌟 Key Features

*   **Multi-Source Video Support**: Upload local `.mp4` files or seamlessly paste any YouTube URL (including YouTube Shorts) to begin processing.
*   **AI-Powered Content Generation**: 
    *   📝 **Full Transcripts**: Highly accurate speech-to-text extraction.
    *   📚 **Detailed Study Notes**: Markdown-formatted summaries and bullet points.
    *   🎯 **Topic Extraction**: Automatically identifies the core subjects discussed.
    *   ❓ **Interactive Quizzes**: Generates multiple-choice questions with correct answers and explanations to test your knowledge.
*   **Analytics Dashboard**: Visualizes your learning journey, showing top topics explored and video processing activity over the last 7 days using interactive charts.
*   **Premium UI/UX**: Built with React, Tailwind CSS, and Framer Motion, featuring a stunning deep dark mode with glassmorphism effects and fluid animations.
*   **Secure Authentication**: JWT-based authentication system with secure HTTP-only cookies and bcrypt password hashing.

## 🛠️ Technology Stack

**Frontend**
*   **React.js** (via Vite)
*   **Tailwind CSS** (Styling & Layout)
*   **Framer Motion** (Micro-animations & transitions)
*   **Recharts** (Analytics data visualization)
*   **Lucide React** (Beautiful iconography)
*   **Axios** (API communication)

**Backend**
*   **Node.js & Express.js**
*   **MongoDB & Mongoose** (Database & ODM)
*   **Google Generative AI** (`@google/generative-ai` using Gemini 2.5 Flash)
*   **FFmpeg** (`fluent-ffmpeg` & `@ffmpeg-installer/ffmpeg` for optimized, standalone audio extraction)
*   **yt-dlp** (`youtube-dl-exec` for reliable YouTube video fetching)
*   **Multer** (File upload handling)
*   **JWT & Bcrypt** (Security)

## 🚀 Getting Started

### Prerequisites
*   Node.js (v16 or higher)
*   MongoDB (Local instance or MongoDB Atlas URI)
*   A Google AI Studio API Key (for Gemini access)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/imrishusingh1/AI-Learning-Video-Analyzer.git
   ```

2. **Setup the Backend**
   ```bash
   cd backend
   npm install
   ```
   Create a `.env` file in the `backend` directory with the following:
   ```env
   PORT=5000
   MONGODB_URI=mongodb://127.0.0.1:27017/video-analyzer
   JWT_SECRET=your_super_secret_jwt_key
   GEMINI_API_KEY=your_google_gemini_api_key
   ```
   Start the backend server:
   ```bash
   npm run dev
   ```

3. **Setup the Frontend**
   Open a new terminal window:
   ```bash
   cd frontend
   npm install
   ```
   Start the development server:
   ```bash
   npm run dev
   ```

4. **Open the Application**
   Navigate to `http://localhost:5173` (or the port Vite provides) in your browser.

## 🏗️ Architecture & Processing Pipeline

1. **Upload/Fetch**: The user uploads an MP4 or provides a YouTube link. For YouTube links, `youtube-dl-exec` is used to bypass bot-protections and fetch the highest-quality audio stream.
2. **Audio Extraction**: To save massive bandwidth and dramatically speed up AI processing, `fluent-ffmpeg` extracts a compressed MP3 audio stream from the video.
3. **AI Analysis**: The MP3 is securely sent to Google's Gemini API via the File API. A highly engineered prompt instructs `gemini-2.5-flash` to return strict `application/json` containing the transcript, summary, topics, and quiz.
4. **Database Storage**: The returned JSON is parsed and distributed across MongoDB collections (`Video`, `Transcript`, `Note`, `Quiz`) linked by the user's ID.
5. **Frontend Rendering**: The user is presented with a beautifully separated tabbed interface to review the generated study materials alongside the original video.

## 📝 License

This project is licensed under the MIT License.
