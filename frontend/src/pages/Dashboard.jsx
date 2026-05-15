import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import {
  Upload, Link as LinkIcon, FileVideo, CheckCircle2,
  Loader2, PlaySquare, Clock, Sparkles
} from 'lucide-react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

const Dashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('upload');
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
      setSuccess('Video uploaded! AI is processing it now…');
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
      setSuccess('YouTube video queued! AI is processing it now…');
      setTimeout(() => navigate('/videos/' + data.video._id), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to process YouTube URL');
    } finally {
      setLoading(false);
    }
  };

  const statusClass = (s) =>
    s === 'completed' ? 'status-completed' : s === 'failed' ? 'status-failed' : 'status-pending';

  return (
    <div style={{ background: 'var(--surface)', minHeight: 'calc(100vh - 68px)' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2.5rem 1.5rem' }}>

        {/* Page header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ marginBottom: '2rem' }}
        >
          <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--primary)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '0.375rem' }}>
            Dashboard
          </p>
          <h1 style={{ fontSize: '1.875rem', fontWeight: 800, color: 'var(--text)', letterSpacing: '-0.02em' }}>
            Welcome back, {user?.name} 👋
          </h1>
          <p style={{ color: 'var(--text-muted)', marginTop: '0.375rem' }}>
            Ready to transform another video?
          </p>
        </motion.div>

        <div className="flex flex-col lg:flex-row gap-6">

          {/* ── Upload Panel ── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card flex-1"
            style={{ padding: '2rem' }}
          >
            {/* Tabs */}
            <div style={{
              display: 'flex', gap: '0.5rem', padding: '0.375rem',
              background: 'var(--surface)', borderRadius: '100px',
              marginBottom: '2rem', width: 'fit-content'
            }}>
              <button
                onClick={() => setActiveTab('upload')}
                className={`tab-btn ${activeTab === 'upload' ? 'active' : ''}`}
              >
                <Upload size={15} />
                Upload MP4
              </button>
              <button
                onClick={() => setActiveTab('youtube')}
                className={`tab-btn ${activeTab === 'youtube' ? 'active' : ''}`}
              >
                <LinkIcon size={15} />
                YouTube Link
              </button>
            </div>

            {/* Alerts */}
            {error && (
              <div style={{
                background: '#fee2e2', border: '1px solid #fecaca', color: '#991b1b',
                padding: '0.875rem 1rem', borderRadius: '12px', marginBottom: '1.25rem',
                fontSize: '0.875rem', fontWeight: 500
              }}>{error}</div>
            )}
            {success && (
              <div style={{
                background: '#d1fae5', border: '1px solid #6ee7b7', color: '#065f46',
                padding: '0.875rem 1rem', borderRadius: '12px', marginBottom: '1.25rem',
                fontSize: '0.875rem', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '0.5rem'
              }}>
                <CheckCircle2 size={16} /> {success}
              </div>
            )}

            {activeTab === 'upload' ? (
              <form onSubmit={handleFileUpload} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <label htmlFor="video-upload" className="dropzone" style={{ cursor: 'pointer' }}>
                  <input
                    type="file"
                    accept="video/mp4,video/mkv,video/avi"
                    onChange={(e) => setFile(e.target.files[0])}
                    style={{ display: 'none' }}
                    id="video-upload"
                  />
                  <FileVideo size={44} color="var(--primary)" style={{ marginBottom: '0.875rem', opacity: 0.7 }} />
                  <p style={{ fontWeight: 600, color: 'var(--text)', marginBottom: '0.25rem', fontSize: '1.0625rem' }}>
                    {file ? file.name : 'Click to browse or drag & drop'}
                  </p>
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>MP4, MKV, AVI — up to 500 MB</p>
                </label>

                <button
                  type="submit"
                  disabled={loading || !file}
                  className="btn-primary"
                  style={{ width: '100%', justifyContent: 'center', padding: '0.9375rem', fontSize: '0.9375rem', opacity: loading || !file ? 0.6 : 1, cursor: loading || !file ? 'not-allowed' : 'pointer' }}
                >
                  {loading ? <Loader2 size={18} className="animate-spin" /> : <><Sparkles size={16} /> Process Video</>}
                </button>
              </form>
            ) : (
              <form onSubmit={handleYoutubeSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: 'var(--text)', marginBottom: '0.5rem' }}>
                    YouTube URL
                  </label>
                  <div style={{ position: 'relative' }}>
                    <LinkIcon size={16} color="var(--text-light)" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                    <input
                      type="url"
                      placeholder="https://www.youtube.com/watch?v=..."
                      value={youtubeUrl}
                      onChange={(e) => setYoutubeUrl(e.target.value)}
                      className="input-field"
                      style={{ paddingLeft: '2.75rem' }}
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading || !youtubeUrl}
                  className="btn-primary"
                  style={{ width: '100%', justifyContent: 'center', padding: '0.9375rem', fontSize: '0.9375rem', opacity: loading || !youtubeUrl ? 0.6 : 1, cursor: loading || !youtubeUrl ? 'not-allowed' : 'pointer' }}
                >
                  {loading ? <Loader2 size={18} className="animate-spin" /> : <><Sparkles size={16} /> Process YouTube Video</>}
                </button>
              </form>
            )}
          </motion.div>

          {/* ── Recent Videos Sidebar ── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 }}
            className="w-full lg:w-[340px]"
          >
            <div className="card" style={{ padding: '1.5rem' }}>
              <h2 style={{ fontSize: '1.0625rem', fontWeight: 700, color: 'var(--text)', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <PlaySquare size={18} color="var(--primary)" />
                Recent Videos
              </h2>

              {recentVideos.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2rem 0' }}>
                  <FileVideo size={36} color="var(--text-light)" style={{ margin: '0 auto 0.75rem' }} />
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                    No videos processed yet.
                  </p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
                  {recentVideos.slice(0, 5).map(video => (
                    <Link
                      key={video._id}
                      to={`/videos/${video._id}`}
                      style={{
                        display: 'block', textDecoration: 'none',
                        padding: '0.875rem', borderRadius: '14px',
                        border: '1.5px solid var(--border)', background: '#fff',
                        transition: 'border-color 0.2s, box-shadow 0.2s'
                      }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(91,78,248,0.1)'; }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.boxShadow = 'none'; }}
                    >
                      <p style={{ fontWeight: 600, color: 'var(--text)', fontSize: '0.875rem', marginBottom: '0.5rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {video.title}
                      </p>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          <Clock size={12} />
                          {new Date(video.createdAt).toLocaleDateString()}
                        </span>
                        <span className={statusClass(video.status)}>{video.status}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </motion.div>

        </div>
      </div>
    </div>
  );
};

export default Dashboard;
