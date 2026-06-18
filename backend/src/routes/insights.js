const express = require('express');
const router = express.Router();
const { db } = require('../config/firebase');
const authMiddleware = require('../middleware/auth');
const { generateMoodAndWellnessInsights } = require('../services/gemini');

// Apply auth middleware
router.use(authMiddleware);

// Simple cache to prevent excessive API costs and throttle requests
const insightsCache = {}; // structure: { userId: { text: string, timestamp: Date } }
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes cache

/**
 * GET /api/insights
 * Generates AI-powered wellness insights from user mood history and diary logs
 */
router.get('/', async (req, res) => {
  try {
    const userId = req.user.uid;
    const now = Date.now();

    // Check cache first
    if (insightsCache[userId] && (now - insightsCache[userId].timestamp) < CACHE_TTL_MS) {
      return res.json({ insight: insightsCache[userId].text, cached: true });
    }

    // 1. Fetch last 15 mood entries
    const moodsSnapshot = await db.collection('moods')
      .where('userId', '==', userId)
      .get();
      
    const moodLogs = [];
    moodsSnapshot.forEach(doc => moodLogs.push(doc.data()));
    moodLogs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    const recentMoods = moodLogs.slice(0, 15);

    // 2. Fetch last 5 diary entries
    const diarySnapshot = await db.collection('diary')
      .where('userId', '==', userId)
      .get();
      
    const diaryEntries = [];
    diarySnapshot.forEach(doc => diaryEntries.push(doc.data()));
    diaryEntries.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    const recentDiary = diaryEntries.slice(0, 5);

    // 3. Call Gemini to analyze patterns
    let aiInsight = 'You are doing great! Continue logging your daily moods and writing journal reflections to help the AI detect correlations and generate detailed self-care tips.';
    
    if (recentMoods.length > 0 || recentDiary.length > 0) {
      try {
        aiInsight = await generateMoodAndWellnessInsights(recentMoods, recentDiary);
      } catch (aiError) {
        console.warn('Failed generating wellness insights via Gemini, returning standard:', aiError.message);
      }
    } else {
      aiInsight = 'Welcome to Peaceful Mind! Start by checking in your current mood and saving a journal entry. Our AI will analyze your notes and provide wellness recommendations.';
    }

    // 4. Update Cache
    insightsCache[userId] = {
      text: aiInsight,
      timestamp: now
    };

    res.json({ insight: aiInsight, cached: false });
  } catch (error) {
    console.error('Error generating insights:', error);
    res.status(500).json({ error: 'Failed to generate wellness insights' });
  }
});

/**
 * POST /api/insights/refresh
 * Forces recalculation of AI insights (bypasses cache)
 */
router.post('/refresh', async (req, res) => {
  try {
    const userId = req.user.uid;
    delete insightsCache[userId]; // clear cache
    res.redirect('/api/insights');
  } catch (error) {
    res.status(500).json({ error: 'Failed to refresh wellness insights' });
  }
});

module.exports = router;
