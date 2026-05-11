import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Play, FileText, Brain, Sparkles } from 'lucide-react';

const Landing = () => {
  return (
    <div className="overflow-hidden">
      {/* Hero Section */}
      <section className="relative pt-20 pb-32">
        <div className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/20 via-slate-900 to-slate-900"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8">
              Transform Videos into <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-purple-500 to-secondary">
                Interactive Knowledge
              </span>
            </h1>
            <p className="mt-4 max-w-2xl text-xl text-slate-400 mx-auto mb-10">
              Upload any educational video. Our AI generates transcripts, summaries, study notes, and quizzes instantly. Learn 10x faster.
            </p>
            <div className="flex justify-center gap-4">
              <Link
                to="/register"
                className="bg-primary hover:bg-indigo-500 text-white px-8 py-4 rounded-xl font-bold text-lg transition flex items-center shadow-lg shadow-indigo-500/25"
              >
                <Sparkles className="mr-2 h-5 w-5" />
                Start for Free
              </Link>
              <Link
                to="/demo"
                className="glass-panel text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-slate-800 transition flex items-center"
              >
                <Play className="mr-2 h-5 w-5" />
                Watch Demo
              </Link>
            </div>
          </motion.div>

          {/* Feature Cards */}
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            {[
              {
                icon: <FileText className="h-8 w-8 text-emerald-400" />,
                title: 'Smart Transcripts',
                desc: 'Highly accurate speech-to-text with clickable timestamps to navigate videos effortlessly.'
              },
              {
                icon: <Brain className="h-8 w-8 text-purple-400" />,
                title: 'AI Study Notes',
                desc: 'Get structured bullet points, detailed explanations, and topic-wise breakdowns.'
              },
              {
                icon: <Sparkles className="h-8 w-8 text-amber-400" />,
                title: 'Auto Quizzes',
                desc: 'Test your knowledge instantly with AI-generated flashcards and multiple-choice questions.'
              }
            ].map((feature, idx) => (
              <div key={idx} className="glass-panel p-8 rounded-2xl text-left border-slate-700 hover:border-slate-500 transition">
                <div className="bg-slate-800/50 w-16 h-16 rounded-xl flex items-center justify-center mb-6">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-slate-400 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Landing;
