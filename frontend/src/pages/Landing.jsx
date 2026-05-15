import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Play, FileText, Brain, Sparkles, ArrowRight, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const features = [
  {
    icon: <FileText size={24} color="#5B4EF8" />,
    bg: '#ede9ff',
    title: 'Smart Transcripts',
    desc: 'Highly accurate speech-to-text with clickable timestamps to navigate videos effortlessly.',
  },
  {
    icon: <Brain size={24} color="#0ea5e9" />,
    bg: '#e0f2fe',
    title: 'AI Study Notes',
    desc: 'Get structured bullet points, detailed explanations, and topic-wise breakdowns instantly.',
  },
  {
    icon: <Sparkles size={24} color="#f59e0b" />,
    bg: '#fef3c7',
    title: 'Auto Quizzes',
    desc: 'Test your knowledge with AI-generated flashcards and multiple-choice questions.',
  },
];

const checks = [
  'No credit card required',
  'Process unlimited videos',
  'Works with YouTube & MP4',
];

const Landing = () => {
  const { user } = useAuth();

  return (
    <div style={{ background: '#fff', overflowX: 'hidden' }}>

      {/* ── Hero ── */}
      <section className="hero-bg" style={{ paddingTop: '5rem', paddingBottom: '6rem' }}>
        <div style={{ maxWidth: '960px', margin: '0 auto', padding: '0 1.5rem', textAlign: 'center' }}>

          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            style={{ marginBottom: '1.75rem' }}
          >
            <span className="badge">
              <Sparkles size={13} />
              AI-Powered Learning Engine
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.05 }}
            style={{
              fontSize: 'clamp(2.5rem, 6vw, 4.25rem)',
              fontWeight: 900,
              lineHeight: 1.1,
              letterSpacing: '-0.03em',
              color: 'var(--text)',
              marginBottom: '1.375rem',
            }}
          >
            Transform Videos into{' '}
            <span style={{ color: 'var(--primary)' }}>Interactive Knowledge</span>
          </motion.h1>

          {/* Sub-headline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.12 }}
            style={{
              fontSize: '1.125rem',
              color: 'var(--text-muted)',
              maxWidth: '600px',
              margin: '0 auto 2.25rem',
              lineHeight: 1.7,
            }}
          >
            Upload any educational video. Generate summaries, transcripts, quizzes, flashcards, and study notes instantly with AI.
          </motion.p>

          {/* CTA buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.2 }}
            style={{ display: 'flex', justifyContent: 'center', gap: '0.875rem', flexWrap: 'wrap', marginBottom: '2rem' }}
          >
            <Link to={user ? "/dashboard" : "/register"} className="btn-primary" style={{ fontSize: '1rem', padding: '0.875rem 2rem' }}>
              <Sparkles size={17} />
              {user ? 'Go to Dashboard' : 'Start for Free'}
            </Link>
            {!user && (
              <Link to="/login" className="btn-secondary" style={{ fontSize: '1rem', padding: '0.875rem 2rem' }}>
                <Play size={17} />
                Watch Demo
              </Link>
            )}
          </motion.div>

          {/* Trust checks */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.32 }}
            style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem', flexWrap: 'wrap' }}
          >
            {checks.map((c) => (
              <span key={c} style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                <CheckCircle size={15} color="var(--primary)" />
                {c}
              </span>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Features ── */}
      <section style={{ padding: '5rem 1.5rem', background: '#fff' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
            <p style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--primary)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
              Everything you need
            </p>
            <h2 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.75rem)', fontWeight: 800, color: 'var(--text)', letterSpacing: '-0.02em', lineHeight: 1.2, marginBottom: '0.875rem' }}>
              Study smarter, not harder
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '1.0625rem', maxWidth: '520px', margin: '0 auto' }}>
              Three powerful tools in one — built for students, developers, and curious minds.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
            {features.map((f, i) => (
              <motion.div
                key={i}
                className="card"
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                style={{ padding: '2rem' }}
              >
                <div className="feature-icon" style={{ background: f.bg }}>
                  {f.icon}
                </div>
                <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text)', marginBottom: '0.625rem' }}>
                  {f.title}
                </h3>
                <p style={{ fontSize: '0.9375rem', color: 'var(--text-muted)', lineHeight: 1.65 }}>
                  {f.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section style={{ padding: '4rem 1.5rem', background: 'var(--surface-2)' }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          style={{
            maxWidth: '700px', margin: '0 auto', textAlign: 'center',
            background: 'var(--primary)', borderRadius: '24px',
            padding: '3rem 2rem',
          }}
        >
          <h2 style={{ fontSize: 'clamp(1.5rem, 4vw, 2.25rem)', fontWeight: 800, color: '#fff', marginBottom: '1rem', letterSpacing: '-0.02em' }}>
            Ready to accelerate your learning?
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '1.0625rem', marginBottom: '2rem' }}>
            Join thousands of learners transforming how they consume video content.
          </p>
          <Link to={user ? "/dashboard" : "/register"} style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
            background: '#fff', color: 'var(--primary)', borderRadius: '100px',
            padding: '0.875rem 2rem', fontWeight: 700, fontSize: '1rem', textDecoration: 'none',
            transition: 'box-shadow 0.2s ease', boxShadow: '0 4px 24px rgba(0,0,0,0.12)'
          }}>
            {user ? 'Go to Dashboard' : 'Get started free'}
            <ArrowRight size={17} />
          </Link>
        </motion.div>
      </section>

    </div>
  );
};

export default Landing;
