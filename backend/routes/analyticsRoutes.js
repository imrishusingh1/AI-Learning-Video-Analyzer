import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import Video from '../models/Video.js';
import Quiz from '../models/Quiz.js';
import Note from '../models/Note.js';

const router = express.Router();

router.get('/', protect, async (req, res) => {
  try {
    const userId = req.user._id;

    // Aggregate statistics
    const totalVideos = await Video.countDocuments({ user: userId });
    const completedVideos = await Video.countDocuments({ user: userId, status: 'completed' });
    const totalNotes = await Note.countDocuments({ user: userId });
    const totalQuizzes = await Quiz.countDocuments({ user: userId });

    // Topic aggregation (simple approach: count unique topics from all notes)
    const notes = await Note.find({ user: userId }).select('topics');
    const topicCounts = {};
    
    notes.forEach(note => {
      if (note.topics) {
        note.topics.forEach(topic => {
          const name = topic.name || topic;
          topicCounts[name] = (topicCounts[name] || 0) + 1;
        });
      }
    });

    // Format for recharts
    const topicData = Object.entries(topicCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5); // Top 5 topics

    // Videos processed per day (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const videosByDay = await Video.aggregate([
      { 
        $match: { 
          user: userId,
          createdAt: { $gte: sevenDaysAgo }
        } 
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    const activityData = videosByDay.map(day => ({
      date: day._id,
      videos: day.count
    }));

    res.json({
      stats: { totalVideos, completedVideos, totalNotes, totalQuizzes },
      topicData,
      activityData
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
