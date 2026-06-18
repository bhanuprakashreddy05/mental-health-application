const express = require('express');
const router = express.Router();
const { db } = require('../config/firebase');
const authMiddleware = require('../middleware/auth');

// Apply auth middleware to all mood routes
router.use(authMiddleware);

/**
 * GET /api/moods
 * Fetch all mood logs for the authenticated user, ordered by timestamp descending
 */
router.get('/', async (req, res) => {
  try {
    const userId = req.user.uid;
    const moodsSnapshot = await db.collection('moods')
      .where('userId', '==', userId)
      .get();
      
    const moodLogs = [];
    moodsSnapshot.forEach(doc => {
      moodLogs.push({
        id: doc.id,
        ...doc.data()
      });
    });

    // Sort descending by timestamp (since mock query does basic filters but is simpler for compound index matching)
    moodLogs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    res.json(moodLogs);
  } catch (error) {
    console.error('Error fetching moods:', error);
    res.status(500).json({ error: 'Failed to fetch mood history' });
  }
});

/**
 * POST /api/moods
 * Log a new mood entry
 */
router.post('/', async (req, res) => {
  try {
    const userId = req.user.uid;
    const { mood, note, rating } = req.body;

    if (!mood) {
      return res.status(400).json({ error: 'Mood is required' });
    }

    const ratingVal = parseInt(rating);
    if (isNaN(ratingVal) || ratingVal < 1 || ratingVal > 10) {
      return res.status(400).json({ error: 'Rating must be a number between 1 and 10' });
    }

    const newMoodLog = {
      userId,
      mood,
      note: note || '',
      rating: ratingVal,
      timestamp: new Date().toISOString()
    };

    const docRef = await db.collection('moods').add(newMoodLog);
    res.status(201).json({
      id: docRef.id,
      ...newMoodLog
    });
  } catch (error) {
    console.error('Error logging mood:', error);
    res.status(500).json({ error: 'Failed to log mood' });
  }
});

/**
 * DELETE /api/moods/:id
 * Delete a specific mood entry
 */
router.delete('/:id', async (req, res) => {
  try {
    const userId = req.user.uid;
    const moodId = req.params.id;

    const docRef = db.collection('moods').doc(moodId);
    const doc = await docRef.get();

    if (!doc.exists) {
      return res.status(404).json({ error: 'Mood log not found' });
    }

    if (doc.data().userId !== userId) {
      return res.status(403).json({ error: 'Unauthorized to delete this record' });
    }

    await docRef.delete();
    res.json({ message: 'Mood log successfully deleted' });
  } catch (error) {
    console.error('Error deleting mood:', error);
    res.status(500).json({ error: 'Failed to delete mood log' });
  }
});

module.exports = router;
