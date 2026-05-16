import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { FileText, Brain, PenTool, LayoutDashboard, Loader2, Tag, Download } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { jsPDF } from 'jspdf';

const VideoDetails = () => {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('notes');
  const [userAnswers, setUserAnswers] = useState({});
  const [submittedAnswers, setSubmittedAnswers] = useState({});

  const exportToPDF = () => {
    if (!data?.note || !data?.video) return;
    
    const doc = new jsPDF();
    const margin = 15;
    const pageWidth = doc.internal.pageSize.getWidth();
    const maxLineWidth = pageWidth - margin * 2;
    let cursorY = margin;

    // Title
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    const titleLines = doc.splitTextToSize(data.video.title, maxLineWidth);
    doc.text(titleLines, margin, cursorY);
    cursorY += (titleLines.length * 8) + 10;

    // Summary Header
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Summary', margin, cursorY);
    cursorY += 8;

    // Summary Content
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    const summaryLines = doc.splitTextToSize(data.note.summary, maxLineWidth);
    
    // Check page breaks
    for (let i = 0; i < summaryLines.length; i++) {
      if (cursorY > 280) {
        doc.addPage();
        cursorY = margin;
      }
      doc.text(summaryLines[i], margin, cursorY);
      cursorY += 6;
    }
    
    cursorY += 10;

    // Detailed Notes Header
    if (cursorY > 260) {
      doc.addPage();
      cursorY = margin;
    }
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Detailed Notes', margin, cursorY);
    cursorY += 8;

    // Detailed Notes Content (strip basic markdown chars for clean PDF)
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    
    const cleanNotes = data.note.detailedNotes
      .replace(/\*\*/g, '') // remove bold markers
      .replace(/#/g, '') // remove headers markers
      .replace(/\*/g, '•') // replace lists with bullets
      .split('\n');
      
    for (const line of cleanNotes) {
      if (line.trim() === '') {
        cursorY += 4;
        continue;
      }
      
      const noteLines = doc.splitTextToSize(line.trim(), maxLineWidth);
      for (let i = 0; i < noteLines.length; i++) {
        if (cursorY > 280) {
          doc.addPage();
          cursorY = margin;
        }
        doc.text(noteLines[i], margin, cursorY);
        cursorY += 6;
      }
    }

    doc.save(`${data.video.title.substring(0, 30).replace(/[^a-zA-Z0-9]/g, '_')}_Notes.pdf`);
  };

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
    const interval = setInterval(() => {
      const s = data?.video?.status;
      if (s === 'processing' || s === 'pending' || s === 'uploaded') {
        fetchVideoData();
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [id, data?.video?.status]);

  if (!data) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 'calc(100vh - 68px)', background: 'var(--surface)' }}>
      <Loader2 size={40} color="var(--primary)" style={{ animation: 'spin 1s linear infinite' }} />
    </div>
  );

  if (error) return (
    <div style={{ textAlign: 'center', marginTop: '5rem', color: '#dc2626', fontSize: '1.125rem' }}>
      {error}
    </div>
  );

  const { video, transcript, note, quiz } = data;
  const isProcessing = video.status === 'processing' || video.status === 'pending' || video.status === 'uploaded';

  const statusStyle = video.status === 'completed'
    ? { background: '#d1fae5', color: '#065f46', border: '1px solid #6ee7b7' }
    : video.status === 'failed'
    ? { background: '#fee2e2', color: '#991b1b', border: '1px solid #fca5a5' }
    : { background: '#fef3c7', color: '#92400e', border: '1px solid #fde68a' };

  return (
    <div style={{ background: 'var(--surface)', minHeight: 'calc(100vh - 68px)' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2.5rem 1.5rem' }}>

        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
          <Link to="/dashboard" style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.375rem',
            color: 'var(--primary)', textDecoration: 'none', fontWeight: 500,
            fontSize: '0.875rem', marginBottom: '1rem'
          }}>
            <LayoutDashboard size={15} /> Back to Dashboard
          </Link>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text)', letterSpacing: '-0.02em', marginBottom: '0.625rem' }}>
            {video.title}
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{
              ...statusStyle, padding: '3px 12px', borderRadius: '100px',
              fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.05em'
            }}>
              {video.status.toUpperCase()}
            </span>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
              Uploaded on {new Date(video.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>

        {isProcessing ? (
          <div className="card" style={{ padding: '4rem 2rem', textAlign: 'center' }}>
            <Loader2 size={52} color="var(--primary)" style={{ margin: '0 auto 1.25rem', animation: 'spin 1s linear infinite' }} />
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text)', marginBottom: '0.75rem' }}>
              AI is analyzing your video…
            </h2>
            <p style={{ color: 'var(--text-muted)', maxWidth: '480px', margin: '0 auto', lineHeight: 1.7 }}>
              This usually takes a few minutes. We're extracting audio, transcribing, and generating study notes. This page will refresh automatically.
            </p>
          </div>
        ) : video.status === 'failed' ? (
          <div className="card" style={{ padding: '3rem 2rem', textAlign: 'center', borderColor: '#fca5a5' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#dc2626', marginBottom: '0.75rem' }}>Processing Failed</h2>
            <p style={{ color: 'var(--text-muted)' }}>There was an error analyzing this video. Please try again with a different file.</p>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-6 items-start">

            {/* ── Main Content ── */}
            <div className="flex-1 flex flex-col gap-5 w-full">

              {/* Tab bar */}
              <div style={{
                display: 'flex', gap: '0.375rem', padding: '0.375rem',
                background: '#fff', border: '1.5px solid var(--border)',
                borderRadius: '100px', width: 'fit-content'
              }}>
                {[
                  { key: 'notes', label: 'Study Notes', icon: <FileText size={14} /> },
                  { key: 'transcript', label: 'Transcript', icon: <PenTool size={14} /> },
                  { key: 'quiz', label: 'AI Quiz', icon: <Brain size={14} /> },
                ].map(tab => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`tab-btn ${activeTab === tab.key ? 'active' : ''}`}
                  >
                    {tab.icon}
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Content panel */}
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
                className="card"
                style={{ padding: '2rem', minHeight: '500px' }}
              >
                {/* ── Notes tab ── */}
                {activeTab === 'notes' && note && (
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.875rem' }}>
                      <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text)' }}>Summary</h2>
                      <button 
                        onClick={exportToPDF}
                        style={{
                          display: 'flex', alignItems: 'center', gap: '0.375rem',
                          padding: '0.4rem 0.875rem', background: '#f3f4f6', 
                          border: 'none', borderRadius: '8px', cursor: 'pointer',
                          fontSize: '0.875rem', fontWeight: 600, color: 'var(--text)',
                          transition: 'background 0.2s'
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = '#e5e7eb'}
                        onMouseLeave={e => e.currentTarget.style.background = '#f3f4f6'}
                      >
                        <Download size={14} /> Export PDF
                      </button>
                    </div>
                    <p style={{ color: 'var(--text-muted)', lineHeight: 1.8, marginBottom: '2rem', fontSize: '0.9375rem' }}>
                      {note.summary}
                    </p>

                    <div style={{ borderTop: '1.5px solid var(--border)', paddingTop: '1.5rem' }}>
                      <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text)', marginBottom: '1rem' }}>Detailed Notes</h2>
                      <div style={{
                        color: 'var(--text)', lineHeight: 1.8, fontSize: '0.9375rem',
                      }} className="markdown-light">
                        <ReactMarkdown>{note.detailedNotes}</ReactMarkdown>
                      </div>
                    </div>
                  </div>
                )}

                {/* ── Transcript tab ── */}
                {activeTab === 'transcript' && transcript && (
                  <div>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text)', marginBottom: '1rem' }}>Full Transcript</h2>
                    <div style={{
                      background: 'var(--surface)', border: '1.5px solid var(--border)',
                      borderRadius: '14px', padding: '1.5rem',
                      color: 'var(--text)', lineHeight: 1.9, fontSize: '0.9375rem',
                      height: '560px', overflowY: 'auto', whiteSpace: 'pre-wrap'
                    }}>
                      {transcript.fullText}
                    </div>
                  </div>
                )}

                {/* ── Quiz tab ── */}
                {activeTab === 'quiz' && quiz && (
                  <div>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text)', marginBottom: '0.5rem' }}>Test Your Knowledge</h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1.25rem' }}>Select your answer and click Submit to reveal the result.</p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                      {quiz.questions.map((q, idx) => {
                        const submitted = submittedAnswers[idx] !== undefined;
                        const userAnswer = userAnswers[idx];
                        const isCorrect = submitted && userAnswer === q.correctAnswer;
                        return (
                          <div key={idx} style={{
                            background: '#fff', border: `1.5px solid ${submitted ? (isCorrect ? '#6ee7b7' : '#fca5a5') : 'var(--border)'}`,
                            borderRadius: '16px', padding: '1.5rem',
                            transition: 'border-color 0.3s'
                          }}>
                            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text)', marginBottom: '1rem' }}>
                              {idx + 1}. {q.question}
                            </h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                              {q.options.map((opt, i) => {
                                let borderColor = 'var(--border)';
                                let background = 'transparent';
                                if (submitted) {
                                  if (opt === q.correctAnswer) { borderColor = '#059669'; background = '#d1fae5'; }
                                  else if (opt === userAnswer && !isCorrect) { borderColor = '#dc2626'; background = '#fee2e2'; }
                                } else if (userAnswer === opt) {
                                  borderColor = 'var(--primary)'; background = 'var(--surface-2)';
                                }
                                return (
                                  <label key={i} htmlFor={`q${idx}-opt${i}`} style={{
                                    display: 'flex', alignItems: 'center', gap: '0.75rem',
                                    padding: '0.75rem 1rem', borderRadius: '10px',
                                    border: `1.5px solid ${borderColor}`, background,
                                    cursor: submitted ? 'default' : 'pointer',
                                    color: 'var(--text)', fontSize: '0.9rem',
                                    transition: 'all 0.15s'
                                  }}>
                                    <input
                                      type="radio"
                                      name={`question-${idx}`}
                                      id={`q${idx}-opt${i}`}
                                      disabled={submitted}
                                      checked={userAnswer === opt}
                                      onChange={() => setUserAnswers(prev => ({ ...prev, [idx]: opt }))}
                                      style={{ accentColor: 'var(--primary)', width: '16px', height: '16px', flexShrink: 0 }}
                                    />
                                    {opt}
                                  </label>
                                );
                              })}
                            </div>

                            {/* Submit button — hidden after submission */}
                            {!submitted && (
                              <button
                                onClick={() => {
                                  if (!userAnswer) return;
                                  setSubmittedAnswers(prev => ({ ...prev, [idx]: userAnswer }));
                                }}
                                disabled={!userAnswer}
                                style={{
                                  marginTop: '1rem', padding: '0.5rem 1.25rem',
                                  background: userAnswer ? 'var(--primary)' : '#e5e7eb',
                                  color: userAnswer ? '#fff' : '#9ca3af',
                                  border: 'none', borderRadius: '8px', fontWeight: 600,
                                  fontSize: '0.875rem', cursor: userAnswer ? 'pointer' : 'not-allowed',
                                  transition: 'all 0.15s'
                                }}
                              >
                                Submit Answer
                              </button>
                            )}

                            {/* Reveal correct answer ONLY after submission */}
                            {submitted && (
                              <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
                                <p style={{ fontSize: '0.875rem', fontWeight: 600, color: isCorrect ? '#059669' : '#dc2626', marginBottom: '0.25rem' }}>
                                  {isCorrect ? '✓ Correct!' : '✗ Incorrect'} — {q.correctAnswer}
                                </p>
                                <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>{q.explanation}</p>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </motion.div>
            </div>

            {/* ── Sidebar ── */}
            <div className="w-full lg:w-[320px] flex flex-col gap-5">

              {/* Video player card */}
              <div className="card" style={{ padding: '1.25rem' }}>
                <h3 style={{ fontWeight: 700, color: 'var(--text)', marginBottom: '0.875rem', fontSize: '0.9375rem' }}>
                  Original Source
                </h3>
                <div style={{ borderRadius: '12px', overflow: 'hidden', background: '#000', aspectRatio: '16/9' }}>
                  {!video.url && video.source === 'upload' ? (
                    <div style={{ padding: '2rem', textAlign: 'center', color: '#888', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                      <p style={{ margin: 0, fontSize: '0.9rem', lineHeight: '1.5' }}>
                        Video expired after 7 days to save space,<br />but your AI notes are kept forever!
                      </p>
                    </div>
                  ) : video.source === 'youtube' ? (
                    <iframe
                      src={`https://www.youtube.com/embed/${video.url?.includes('v=') ? video.url.split('v=')[1] : video.url?.split('/').pop()}`}
                      style={{ width: '100%', height: '100%', border: 'none' }}
                      allowFullScreen
                    />
                  ) : (
                    <video
                      src={video.url}
                      controls
                      style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                    />
                  )}
                </div>
              </div>

              {/* Topics card */}
              {note && note.topics && note.topics.length > 0 && (
                <div className="card" style={{ padding: '1.25rem' }}>
                  <h3 style={{ fontWeight: 700, color: 'var(--text)', marginBottom: '0.875rem', fontSize: '0.9375rem', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                    <Tag size={15} color="var(--primary)" /> Key Topics
                  </h3>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                    {note.topics.map((t, i) => (
                      <span key={i} style={{
                        background: 'var(--surface-2)', border: '1px solid var(--border)',
                        color: 'var(--primary)', padding: '4px 12px',
                        borderRadius: '100px', fontSize: '0.8125rem', fontWeight: 600
                      }}>
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
    </div>
  );
};

export default VideoDetails;
