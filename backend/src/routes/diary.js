const express = require('express');
const router = express.Router();
const { db } = require('../config/firebase');
const authMiddleware = require('../middleware/auth');
const { summarizeDiaryEntry } = require('../services/gemini');

// Apply auth middleware to all diary routes
router.use(authMiddleware);

/**
 * GET /api/diary
 * Retrieve all diary entries for the user, with optional search query
 */
router.get('/', async (req, res) => {
  try {
    const userId = req.user.uid;
    const { search } = req.query;

    const diarySnapshot = await db.collection('diary')
      .where('userId', '==', userId)
      .get();

    const entries = [];
    diarySnapshot.forEach(doc => {
      entries.push({
        id: doc.id,
        ...doc.data()
      });
    });

    // Sort descending by timestamp
    entries.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    // Filter locally if search query is provided
    if (search) {
      const query = search.toLowerCase();
      const filtered = entries.filter(e => 
        e.title.toLowerCase().includes(query) || 
        e.content.toLowerCase().includes(query) ||
        (e.emotionsTags && e.emotionsTags.some(tag => tag.toLowerCase().includes(query)))
      );
      return res.json(filtered);
    }

    res.json(entries);
  } catch (error) {
    console.error('Error fetching diary entries:', error);
    res.status(500).json({ error: 'Failed to fetch journal entries' });
  }
});

/**
 * POST /api/diary
 * Create a new diary entry and analyze it using Gemini AI
 */
router.post('/', async (req, res) => {
  try {
    const userId = req.user.uid;
    const { title, content } = req.body;

    if (!content) {
      return res.status(400).json({ error: 'Content is required' });
    }

    const titleStr = title || 'Untitled Entry';

    // AI summary & insights call
    let aiAnalysis = {
      summary: 'A daily journal entry.',
      emotionsTags: ['Calm'],
      recommendations: 'Keep journaling to explore your feelings and track trends.'
    };

    try {
      const analysis = await summarizeDiaryEntry(titleStr, content);
      if (analysis) {
        aiAnalysis = {
          summary: analysis.summary || aiAnalysis.summary,
          emotionsTags: analysis.emotionsTags || aiAnalysis.emotionsTags,
          recommendations: analysis.recommendations || aiAnalysis.recommendations
        };
      }
    } catch (aiError) {
      console.warn('Gemini analysis failed during diary creation, using defaults:', aiError.message);
    }

    const newEntry = {
      userId,
      title: titleStr,
      content,
      emotionsTags: aiAnalysis.emotionsTags,
      summary: aiAnalysis.summary,
      recommendations: aiAnalysis.recommendations,
      timestamp: new Date().toISOString()
    };

    const docRef = await db.collection('diary').add(newEntry);
    res.status(201).json({
      id: docRef.id,
      ...newEntry
    });
  } catch (error) {
    console.error('Error creating diary entry:', error);
    res.status(500).json({ error: 'Failed to save journal entry' });
  }
});

/**
 * PUT /api/diary/:id
 * Update an existing diary entry (re-trigger AI analysis on change)
 */
router.put('/:id', async (req, res) => {
  try {
    const userId = req.user.uid;
    const entryId = req.params.id;
    const { title, content } = req.body;

    if (!content) {
      return res.status(400).json({ error: 'Content is required' });
    }

    const docRef = db.collection('diary').doc(entryId);
    const doc = await docRef.get();

    if (!doc.exists) {
      return res.status(404).json({ error: 'Journal entry not found' });
    }

    if (doc.data().userId !== userId) {
      return res.status(403).json({ error: 'Unauthorized to edit this entry' });
    }

    const titleStr = title || 'Untitled Entry';

    // Call Gemini again to re-analyze updated content
    let aiAnalysis = {
      summary: doc.data().summary,
      emotionsTags: doc.data().emotionsTags,
      recommendations: doc.data().recommendations
    };

    try {
      const analysis = await summarizeDiaryEntry(titleStr, content);
      if (analysis) {
        aiAnalysis = {
          summary: analysis.summary,
          emotionsTags: analysis.emotionsTags,
          recommendations: analysis.recommendations
        };
      }
    } catch (aiError) {
      console.warn('Gemini analysis failed during diary update:', aiError.message);
    }

    const updatedData = {
      title: titleStr,
      content,
      emotionsTags: aiAnalysis.emotionsTags,
      summary: aiAnalysis.summary,
      recommendations: aiAnalysis.recommendations,
      timestamp: new Date().toISOString() // update timestamp to last modified
    };

    await docRef.update(updatedData);
    res.json({
      id: entryId,
      userId,
      ...updatedData
    });
  } catch (error) {
    console.error('Error updating diary entry:', error);
    res.status(500).json({ error: 'Failed to update journal entry' });
  }
});

/**
 * DELETE /api/diary/:id
 * Delete a specific diary entry
 */
router.delete('/:id', async (req, res) => {
  try {
    const userId = req.user.uid;
    const entryId = req.params.id;

    const docRef = db.collection('diary').doc(entryId);
    const doc = await docRef.get();

    if (!doc.exists) {
      return res.status(404).json({ error: 'Journal entry not found' });
    }

    if (doc.data().userId !== userId) {
      return res.status(403).json({ error: 'Unauthorized to delete this entry' });
    }

    await docRef.delete();
    res.json({ message: 'Journal entry successfully deleted' });
  } catch (error) {
    console.error('Error deleting diary entry:', error);
    res.status(500).json({ error: 'Failed to delete journal entry' });
  }
});

module.exports = router;
