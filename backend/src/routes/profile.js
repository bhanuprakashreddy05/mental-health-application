const express = require('express');
const router = express.Router();
const { db } = require('../config/firebase');
const authMiddleware = require('../middleware/auth');

// Apply auth middleware to all profile routes
router.use(authMiddleware);

/**
 * GET /api/profile
 * Returns user profile info and aggregated stats (moods count, diary count, meditation minutes)
 */
router.get('/', async (req, res) => {
  try {
    const userId = req.user.uid;
    const email = req.user.email;

    // 1. Fetch or initialize user profile record
    const userDocRef = db.collection('users').doc(userId);
    let userDoc = await userDocRef.get();

    if (!userDoc.exists) {
      const defaultUser = {
        uid: userId,
        email,
        displayName: req.user.name || email.split('@')[0],
        photoURL: 'avatar1',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      await userDocRef.set(defaultUser);
      userDoc = await userDocRef.get();
    }

    const userData = userDoc.data();

    // 2. Fetch stats: Mood Logs count
    const moodsSnapshot = await db.collection('moods')
      .where('userId', '==', userId)
      .get();
    const moodCount = moodsSnapshot.size;

    // 3. Fetch stats: Diary entries count
    const diarySnapshot = await db.collection('diary')
      .where('userId', '==', userId)
      .get();
    const diaryCount = diarySnapshot.size;

    // 4. Fetch stats: Exercise Progress minutes
    const progressSnapshot = await db.collection('exercise_progress')
      .where('userId', '==', userId)
      .get();
    
    let exerciseCount = 0;
    let exerciseMinutes = 0;
    progressSnapshot.forEach(doc => {
      exerciseCount++;
      exerciseMinutes += Math.round((doc.data().durationCompleted || 0) / 60);
    });

    res.json({
      profile: userData,
      stats: {
        totalMoodsLogged: moodCount,
        totalJournalsWritten: diaryCount,
        totalExercisesCompleted: exerciseCount,
        totalMeditationMinutes: exerciseMinutes
      }
    });
  } catch (error) {
    console.error('Error fetching profile stats:', error);
    res.status(500).json({ error: 'Failed to retrieve profile data' });
  }
});

/**
 * PUT /api/profile
 * Update profile details (displayName, photoURL)
 */
router.put('/', async (req, res) => {
  try {
    const userId = req.user.uid;
    const { displayName, photoURL } = req.body;

    const userDocRef = db.collection('users').doc(userId);
    const userDoc = await userDocRef.get();

    if (!userDoc.exists) {
      return res.status(404).json({ error: 'User record not found' });
    }

    const updatedData = {
      updatedAt: new Date().toISOString()
    };

    if (displayName) updatedData.displayName = displayName;
    if (photoURL) updatedData.photoURL = photoURL;

    await userDocRef.update(updatedData);

    const refreshedDoc = await userDocRef.get();
    res.json(refreshedDoc.data());
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ error: 'Failed to update profile details' });
  }
});

module.exports = router;
