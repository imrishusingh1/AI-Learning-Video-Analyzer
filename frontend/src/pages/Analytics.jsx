import { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Video, FileText, Brain, Loader2, CheckCircle2 } from 'lucide-react';

const COLORS = ['#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

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

  if (loading) return <div className="flex justify-center items-center h-screen"><Loader2 className="animate-spin h-12 w-12 text-primary" /></div>;
  if (error) return <div className="text-center text-red-400 mt-20 text-xl">{error}</div>;

  const { stats, topicData, activityData } = data;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl font-bold mb-8">Learning Analytics</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-panel p-6 rounded-2xl flex items-center space-x-4 border-b-4 border-primary">
          <div className="bg-primary/20 p-4 rounded-xl text-primary"><Video className="h-8 w-8" /></div>
          <div><p className="text-slate-400 text-sm">Total Videos</p><h3 className="text-3xl font-bold">{stats.totalVideos}</h3></div>
        </motion.div>
        
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-panel p-6 rounded-2xl flex items-center space-x-4 border-b-4 border-emerald-500">
          <div className="bg-emerald-500/20 p-4 rounded-xl text-emerald-400"><FileText className="h-8 w-8" /></div>
          <div><p className="text-slate-400 text-sm">Notes Generated</p><h3 className="text-3xl font-bold">{stats.totalNotes}</h3></div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-panel p-6 rounded-2xl flex items-center space-x-4 border-b-4 border-amber-500">
          <div className="bg-amber-500/20 p-4 rounded-xl text-amber-400"><Brain className="h-8 w-8" /></div>
          <div><p className="text-slate-400 text-sm">Quizzes Generated</p><h3 className="text-3xl font-bold">{stats.totalQuizzes}</h3></div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-panel p-6 rounded-2xl flex items-center space-x-4 border-b-4 border-purple-500">
          <div className="bg-purple-500/20 p-4 rounded-xl text-purple-400"><CheckCircle2 className="h-8 w-8" /></div>
          <div><p className="text-slate-400 text-sm">Completed Processing</p><h3 className="text-3xl font-bold">{stats.completedVideos}</h3></div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Activity Chart */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }} className="glass-panel p-6 rounded-2xl">
          <h2 className="text-xl font-bold mb-6">Learning Activity (Last 7 Days)</h2>
          <div className="h-80 w-full text-sm">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={activityData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis dataKey="date" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" allowDecimals={false} />
                <Tooltip cursor={{ fill: 'rgba(255,255,255,0.05)' }} contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }} />
                <Bar dataKey="videos" fill="#4F46E5" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Topics Pie Chart */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }} className="glass-panel p-6 rounded-2xl">
          <h2 className="text-xl font-bold mb-6">Top Topics Explored</h2>
          <div className="h-80 w-full flex justify-center">
            {topicData && topicData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={topicData}
                    cx="50%"
                    cy="50%"
                    innerRadius={80}
                    outerRadius={110}
                    paddingAngle={5}
                    dataKey="count"
                  >
                    {topicData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-slate-500 italic">No topic data available yet.</div>
            )}
          </div>
          <div className="flex flex-wrap justify-center gap-4 mt-4 text-sm">
            {topicData.map((entry, index) => (
              <div key={index} className="flex items-center">
                <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                <span className="text-slate-300">{entry.name}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Analytics;
