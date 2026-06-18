const express = require('express');
const router = express.Router();
const { db } = require('../config/firebase');
const authMiddleware = require('../middleware/auth');
const { generateChatResponse } = require('../services/gemini');

// Apply auth middleware to all chat routes
router.use(authMiddleware);

/**
 * GET /api/chat
 * Fetch user's message history. Optional query param ?personality=name
 */
router.get('/', async (req, res) => {
  try {
    const userId = req.user.uid;
    const { personality } = req.query;

    let query = db.collection('chats').where('userId', '==', userId);
    
    if (personality) {
      query = query.where('personality', '==', personality);
    }

    const snapshot = await query.get();
    const chats = [];
    
    snapshot.forEach(doc => {
      chats.push({
        id: doc.id,
        ...doc.data()
      });
    });

    // Sort chronologically by timestamp
    chats.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

    res.json(chats);
  } catch (error) {
    console.error('Error fetching chat history:', error);
    res.status(500).json({ error: 'Failed to retrieve conversation logs' });
  }
});

/**
 * POST /api/chat
 * Send a message to the AI Companion and get a supportive response
 */
router.post('/', async (req, res) => {
  try {
    const userId = req.user.uid;
    const { message, personality } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message content is required' });
    }

    const activePersonality = personality || 'compassionate';

    // 1. Fetch recent chat logs for context
    const snapshot = await db.collection('chats')
      .where('userId', '==', userId)
      .where('personality', '==', activePersonality)
      .get();
      
    const chatLogs = [];
    snapshot.forEach(doc => {
      chatLogs.push(doc.data());
    });
    
    // Sort chronological and take the last 10 messages for token efficiency
    chatLogs.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    const recentLogs = chatLogs.slice(-10);

    // 2. Format history for the AI Service
    // We split into user message + response pairs
    const messageHistory = [];
    recentLogs.forEach(log => {
      messageHistory.push({ sender: 'user', text: log.message });
      messageHistory.push({ sender: 'model', text: log.response });
    });

    // 3. Generate response using Gemini
    let aiResponseText = 'I am here and listening. Tell me more about what is going on.';
    try {
      aiResponseText = await generateChatResponse(activePersonality, messageHistory, message);
    } catch (aiError) {
      console.warn('Gemini chat generation failed, using mock response:', aiError.message);
      // fallback mock replies
      aiResponseText = `I hear you. Talking about this is a great step. I'm here to support you in whatever way you need. Let's take it day by day.`;
    }

    // 4. Save exchange to database
    const chatRecord = {
      userId,
      personality: activePersonality,
      message,
      response: aiResponseText,
      timestamp: new Date().toISOString()
    };

    const docRef = await db.collection('chats').add(chatRecord);

    res.status(201).json({
      id: docRef.id,
      ...chatRecord
    });
  } catch (error) {
    console.error('Error in AI Chat companion:', error);
    res.status(500).json({ error: 'Failed to communicate with AI Companion' });
  }
});

module.exports = router;
