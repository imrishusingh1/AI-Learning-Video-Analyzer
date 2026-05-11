import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { Upload, Link as LinkIcon, FileVideo, CheckCircle2, Loader2, PlaySquare, Clock } from 'lucide-react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

const Dashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('upload'); // 'upload' or 'youtube'
  const [file, setFile] = useState(null);
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [recentVideos, setRecentVideos] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const { data } = await axios.get('/api/videos');
        setRecentVideos(data);
      } catch (err) {
        console.error('Error fetching videos', err);
      }
    };
    fetchVideos();
  }, []);

  const handleFileUpload = async (e) => {
    e.preventDefault();
    if (!file) return setError('Please select a file');
    
    const formData = new FormData();
    formData.append('video', file);
    
    setLoading(true);
    setError('');
    
    try {
      const { data } = await axios.post('/api/videos/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setSuccess('Video uploaded! AI is processing it now...');
      setTimeout(() => navigate('/videos/' + data.video._id), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Upload failed');
    } finally {
      setLoading(false);
    }
  };

  const handleYoutubeSubmit = async (e) => {
    e.preventDefault();
    if (!youtubeUrl) return setError('Please enter a URL');
    
    setLoading(true);
    setError('');
    
    try {
      const { data } = await axios.post('/api/videos/youtube', { url: youtubeUrl });
      setSuccess('YouTube video queued! AI is processing it now...');
      setTimeout(() => navigate('/videos/' + data.video._id), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to process YouTube URL');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Welcome, {user?.name}</h1>
          <p className="text-slate-400 mt-2">Ready to transform another video?</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Upload Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-2 glass-panel p-8 rounded-2xl"
        >
          <div className="flex space-x-4 mb-8 border-b border-slate-700 pb-4">
            <button
              onClick={() => setActiveTab('upload')}
              className={`flex items-center space-x-2 pb-2 px-2 transition ${activeTab === 'upload' ? 'text-primary border-b-2 border-primary font-bold' : 'text-slate-400 hover:text-white'}`}
            >
              <Upload className="h-5 w-5" />
              <span>Upload MP4</span>
            </button>
            <button
              onClick={() => setActiveTab('youtube')}
              className={`flex items-center space-x-2 pb-2 px-2 transition ${activeTab === 'youtube' ? 'text-red-500 border-b-2 border-red-500 font-bold' : 'text-slate-400 hover:text-white'}`}
            >
              <LinkIcon className="h-5 w-5" />
              <span>YouTube Link</span>
            </button>
          </div>

          {error && <div className="bg-red-500/20 border border-red-500 text-red-300 p-4 rounded-lg mb-6">{error}</div>}
          {success && <div className="bg-emerald-500/20 border border-emerald-500 text-emerald-300 p-4 rounded-lg mb-6 flex items-center"><CheckCircle2 className="mr-2 h-5 w-5" />{success}</div>}

          {activeTab === 'upload' ? (
            <form onSubmit={handleFileUpload} className="space-y-6">
              <div className="border-2 border-dashed border-slate-600 rounded-xl p-12 text-center hover:border-primary transition cursor-pointer bg-slate-800/50">
                <input 
                  type="file" 
                  accept="video/mp4,video/mkv,video/avi" 
                  onChange={(e) => setFile(e.target.files[0])}
                  className="hidden" 
                  id="video-upload"
                />
                <label htmlFor="video-upload" className="cursor-pointer flex flex-col items-center">
                  <FileVideo className="h-16 w-16 text-slate-400 mb-4" />
                  <span className="text-lg font-medium text-slate-200">
                    {file ? file.name : 'Click to browse or drag and drop'}
                  </span>
                  <span className="text-sm text-slate-400 mt-2">MP4, MKV, AVI up to 500MB</span>
                </label>
              </div>
              <button 
                disabled={loading || !file}
                className="w-full bg-primary hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl transition flex justify-center items-center"
              >
                {loading ? <Loader2 className="animate-spin h-6 w-6" /> : 'Process Video'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleYoutubeSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">YouTube URL</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <LinkIcon className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    type="url"
                    placeholder="https://www.youtube.com/watch?v=..."
                    value={youtubeUrl}
                    onChange={(e) => setYoutubeUrl(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition"
                    required
                  />
                </div>
              </div>
              <button 
                disabled={loading || !youtubeUrl}
                className="w-full bg-red-600 hover:bg-red-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl transition flex justify-center items-center"
              >
                {loading ? <Loader2 className="animate-spin h-6 w-6" /> : 'Process YouTube Video'}
              </button>
            </form>
          )}
        </motion.div>

        {/* Recent Videos Sidebar */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-panel p-6 rounded-2xl h-fit"
        >
          <h2 className="text-xl font-bold mb-4 flex items-center">
            <PlaySquare className="mr-2 h-5 w-5 text-secondary" />
            Recent Videos
          </h2>
          <div className="space-y-4">
            {recentVideos.length === 0 ? (
              <p className="text-slate-400 text-sm italic">You haven't processed any videos yet.</p>
            ) : (
              recentVideos.slice(0, 5).map(video => (
                <Link key={video._id} to={`/videos/${video._id}`} className="block bg-slate-800/50 p-4 rounded-xl border border-slate-700 hover:border-primary transition group">
                  <h3 className="font-semibold text-slate-200 group-hover:text-primary transition truncate">{video.title}</h3>
                  <div className="flex items-center justify-between mt-2">
                    <span className="flex items-center text-xs text-slate-400">
                      <Clock className="h-3 w-3 mr-1" />
                      {new Date(video.createdAt).toLocaleDateString()}
                    </span>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      video.status === 'completed' ? 'bg-emerald-500/20 text-emerald-400' :
                      video.status === 'failed' ? 'bg-red-500/20 text-red-400' :
                      'bg-amber-500/20 text-amber-400'
                    }`}>
                      {video.status}
                    </span>
                  </div>
                </Link>
              ))
            )}
          </div>
        </motion.div>

      </div>
    </div>
  );
};

export default Dashboard;
