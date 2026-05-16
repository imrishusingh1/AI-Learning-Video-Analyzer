import { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import { Video, FileText, Brain, Loader2, CheckCircle2 } from 'lucide-react';

const COLORS = ['#5B4EF8', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

const StatCard = ({ icon, bg, color, label, value, borderColor, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    className="card p-4 sm:p-6 flex items-center gap-4"
    style={{ borderBottom: `3px solid ${borderColor}` }}
  >
    <div style={{ background: bg, padding: '0.875rem', borderRadius: '14px', flexShrink: 0 }}>
      <div style={{ color }}>{icon}</div>
    </div>
    <div>
      <p style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.25rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        {label}
      </p>
      <h3 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text)', lineHeight: 1 }}>
        {value}
      </h3>
    </div>
  </motion.div>
);

const Analytics = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await axios.get('/api/analytics');
        setData(res.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch analytics');
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 'calc(100vh - 68px)', background: 'var(--surface)' }}>
      <Loader2 size={40} color="var(--primary)" style={{ animation: 'spin 1s linear infinite' }} />
    </div>
  );

  if (error) return (
    <div style={{ textAlign: 'center', marginTop: '5rem', color: '#dc2626', fontSize: '1.125rem' }}>
      {error}
    </div>
  );

  const { stats, topicData, activityData } = data;

  return (
    <div className="bg-[var(--surface)] min-h-[calc(100vh-68px)]">
      <div className="max-w-[1200px] mx-auto px-4 py-6 sm:px-6 md:py-10">

        {/* Page header */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-6 md:mb-8">
          <p className="text-sm font-semibold text-[var(--primary)] tracking-[0.06em] uppercase mb-1.5">
            Analytics
          </p>
          <h1 className="text-2xl sm:text-[1.875rem] font-extrabold text-[var(--text)] tracking-tight">
            Learning Analytics
          </h1>
        </motion.div>

        {/* Stat cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginBottom: '1.5rem' }}>
          <StatCard icon={<Video size={22} />} bg="#ede9ff" color="#5B4EF8" label="Total Videos" value={stats.totalVideos} borderColor="#5B4EF8" delay={0} />
          <StatCard icon={<FileText size={22} />} bg="#d1fae5" color="#059669" label="Notes Generated" value={stats.totalNotes} borderColor="#10B981" delay={0.1} />
          <StatCard icon={<Brain size={22} />} bg="#fef3c7" color="#d97706" label="Quizzes Generated" value={stats.totalQuizzes} borderColor="#F59E0B" delay={0.2} />
          <StatCard icon={<CheckCircle2 size={22} />} bg="#f3e8ff" color="#7c3aed" label="Completed" value={stats.completedVideos} borderColor="#8B5CF6" delay={0.3} />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Activity bar chart */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="card p-5 md:p-7"
          >
            <h2 style={{ fontSize: '1.0625rem', fontWeight: 700, color: 'var(--text)', marginBottom: '1.5rem' }}>
              Learning Activity — Last 7 Days
            </h2>
            <div style={{ height: '300px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={activityData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e3ff" vertical={false} />
                  <XAxis dataKey="date" stroke="var(--text-muted)" tick={{ fontSize: 12 }} />
                  <YAxis stroke="var(--text-muted)" allowDecimals={false} tick={{ fontSize: 12 }} />
                  <Tooltip
                    cursor={{ fill: 'rgba(91,78,248,0.06)' }}
                    contentStyle={{ background: '#fff', border: '1px solid #e5e3ff', borderRadius: '10px', color: 'var(--text)', fontSize: '13px' }}
                  />
                  <Bar dataKey="videos" fill="#5B4EF8" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Topics pie chart */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="card p-5 md:p-7"
          >
            <h2 style={{ fontSize: '1.0625rem', fontWeight: 700, color: 'var(--text)', marginBottom: '1.5rem' }}>
              Top Topics Explored
            </h2>
            <div style={{ height: '240px', display: 'flex', justifyContent: 'center' }}>
              {topicData && topicData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={topicData}
                      cx="50%"
                      cy="50%"
                      innerRadius={70}
                      outerRadius={100}
                      paddingAngle={4}
                      dataKey="count"
                    >
                      {topicData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ background: '#fff', border: '1px solid #e5e3ff', borderRadius: '10px', color: 'var(--text)', fontSize: '13px' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)', fontStyle: 'italic', fontSize: '0.9rem' }}>
                  No topic data available yet.
                </div>
              )}
            </div>

            {/* Legend */}
            {topicData && topicData.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.625rem', marginTop: '1rem', justifyContent: 'center' }}>
                {topicData.map((entry, index) => (
                  <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: COLORS[index % COLORS.length], flexShrink: 0 }} />
                    {entry.name}
                  </div>
                ))}
              </div>
            )}
          </motion.div>

        </div>
      </div>
    </div>
  );
};

export default Analytics;
