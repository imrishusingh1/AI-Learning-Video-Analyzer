import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { FileText, Brain, PenTool, LayoutDashboard, Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

const VideoDetails = () => {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('notes'); // notes, transcript, quiz

  useEffect(() => {
    const fetchVideoData = async () => {
      try {
        const res = await axios.get(`/api/videos/${id}`);
        setData(res.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load video details');
      } finally {
        setLoading(false);
      }
    };

    fetchVideoData();
    // In a real app, we'd poll this or use websockets if status === 'processing'
    const interval = setInterval(() => {
      if (data?.video?.status === 'processing' || data?.video?.status === 'pending') {
        fetchVideoData();
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [id, data?.video?.status]);

  if (loading && !data) return <div className="flex justify-center items-center h-screen"><Loader2 className="animate-spin h-12 w-12 text-primary" /></div>;
  if (error) return <div className="text-center text-red-400 mt-20 text-xl">{error}</div>;

  const { video, transcript, note, quiz } = data;

  const isProcessing = video.status === 'processing' || video.status === 'pending';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <Link to="/dashboard" className="text-primary hover:underline flex items-center mb-4">
          <LayoutDashboard className="mr-2 h-4 w-4" /> Back to Dashboard
        </Link>
        <h1 className="text-3xl font-bold">{video.title}</h1>
        <div className="flex items-center mt-2 space-x-4">
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
            video.status === 'completed' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500' :
            video.status === 'failed' ? 'bg-red-500/20 text-red-400 border border-red-500' :
            'bg-amber-500/20 text-amber-400 border border-amber-500'
          }`}>
            {video.status.toUpperCase()}
          </span>
          <span className="text-slate-400 text-sm">Uploaded on {new Date(video.createdAt).toLocaleDateString()}</span>
        </div>
      </div>

      {isProcessing ? (
        <div className="glass-panel p-12 text-center rounded-2xl flex flex-col items-center justify-center">
          <Loader2 className="animate-spin h-16 w-16 text-primary mb-6" />
          <h2 className="text-2xl font-bold mb-2">AI is analyzing your video...</h2>
          <p className="text-slate-400 max-w-md mx-auto">
            This usually takes a few minutes depending on the video length. 
            We are extracting audio, transcribing, and generating study notes.
            This page will automatically refresh when done.
          </p>
        </div>
      ) : video.status === 'failed' ? (
        <div className="glass-panel p-12 text-center rounded-2xl border-red-500/50">
          <h2 className="text-2xl font-bold text-red-400 mb-2">Processing Failed</h2>
          <p className="text-slate-400">There was an error analyzing this video. Please try again with a different file.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Tabs */}
            <div className="flex space-x-2 border-b border-slate-700 pb-2">
              <button 
                onClick={() => setActiveTab('notes')}
                className={`px-4 py-2 rounded-lg font-medium transition flex items-center ${activeTab === 'notes' ? 'bg-primary text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
              >
                <FileText className="mr-2 h-4 w-4" /> Study Notes
              </button>
              <button 
                onClick={() => setActiveTab('transcript')}
                className={`px-4 py-2 rounded-lg font-medium transition flex items-center ${activeTab === 'transcript' ? 'bg-primary text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
              >
                <PenTool className="mr-2 h-4 w-4" /> Transcript
              </button>
              <button 
                onClick={() => setActiveTab('quiz')}
                className={`px-4 py-2 rounded-lg font-medium transition flex items-center ${activeTab === 'quiz' ? 'bg-primary text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
              >
                <Brain className="mr-2 h-4 w-4" /> AI Quiz
              </button>
            </div>

            {/* Content Rendering */}
            <motion.div 
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-panel p-8 rounded-2xl min-h-[500px]"
            >
              {activeTab === 'notes' && note && (
                <div className="prose prose-invert max-w-none">
                  <h2 className="text-2xl font-bold mb-4">Summary</h2>
                  <p className="text-slate-300 leading-relaxed mb-8">{note.summary}</p>
                  
                  <h2 className="text-2xl font-bold mb-4 border-t border-slate-700 pt-6">Detailed Notes</h2>
                  <div className="text-slate-300 leading-relaxed markdown-body">
                    <ReactMarkdown>{note.detailedNotes}</ReactMarkdown>
                  </div>
                </div>
              )}

              {activeTab === 'transcript' && transcript && (
                <div className="prose prose-invert max-w-none">
                  <h2 className="text-2xl font-bold mb-6">Full Transcript</h2>
                  <div className="bg-slate-900/50 p-6 rounded-xl text-slate-300 leading-relaxed h-[600px] overflow-y-auto whitespace-pre-wrap">
                    {transcript.fullText}
                  </div>
                </div>
              )}

              {activeTab === 'quiz' && quiz && (
                <div>
                  <h2 className="text-2xl font-bold mb-6">Test Your Knowledge</h2>
                  <div className="space-y-8">
                    {quiz.questions.map((q, idx) => (
                      <div key={idx} className="bg-slate-800/50 p-6 rounded-xl border border-slate-700">
                        <h3 className="text-lg font-semibold mb-4">{idx + 1}. {q.question}</h3>
                        <div className="space-y-3">
                          {q.options.map((opt, i) => (
                            <div key={i} className="flex items-center space-x-3 p-3 rounded-lg bg-slate-900 border border-slate-600 hover:border-primary cursor-pointer transition">
                              <input type="radio" name={`question-${idx}`} id={`q${idx}-opt${i}`} className="text-primary focus:ring-primary" />
                              <label htmlFor={`q${idx}-opt${i}`} className="cursor-pointer w-full text-slate-300">{opt}</label>
                            </div>
                          ))}
                        </div>
                        {/* In a fully polished version, we'd add interactive state to check the answer here */}
                        <div className="mt-4 pt-4 border-t border-slate-700">
                          <p className="text-sm font-medium text-emerald-400">Correct Answer: {q.correctAnswer}</p>
                          <p className="text-sm text-slate-400 mt-1">{q.explanation}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>

          </div>

          {/* Sidebar / Video Player */}
          <div className="space-y-6">
            <div className="glass-panel p-4 rounded-2xl">
              <h3 className="font-bold mb-4 px-2">Original Source</h3>
              {video.source === 'youtube' ? (
                <div className="aspect-video rounded-xl overflow-hidden bg-black">
                  <iframe 
                    src={`https://www.youtube.com/embed/${video.url.split('v=')[1]}`} 
                    className="w-full h-full"
                    allowFullScreen
                  ></iframe>
                </div>
              ) : (
                <div className="aspect-video rounded-xl overflow-hidden bg-black">
                  <video 
                    src={`http://localhost:5000/${video.url.replace(/\\/g, '/')}`} 
                    controls 
                    className="w-full h-full object-contain"
                  ></video>
                </div>
              )}
            </div>

            {/* Topics Card */}
            {note && note.topics && note.topics.length > 0 && (
              <div className="glass-panel p-6 rounded-2xl">
                <h3 className="font-bold mb-4">Key Topics</h3>
                <div className="flex flex-wrap gap-2">
                  {note.topics.map((t, i) => (
                    <span key={i} className="bg-primary/20 text-indigo-300 border border-primary/30 px-3 py-1 rounded-full text-sm font-medium">
                      {t.name || t}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

        </div>
      )}
    </div>
  );
};

export default VideoDetails;
