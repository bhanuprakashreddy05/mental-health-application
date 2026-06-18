const express = require('express');
const router = express.Router();
const { db } = require('../config/firebase');
const authMiddleware = require('../middleware/auth');

// Apply auth middleware to all exercise routes
router.use(authMiddleware);

// Static Exercise Library
const EXERCISES = [
  {
    id: 'box-breathing',
    name: 'Box Breathing (Pranayama)',
    category: 'Breathing',
    duration: 4, // mins
    difficulty: 'Easy',
    description: 'Inhale 4s, hold 4s, exhale 4s, hold 4s. Instantly reduces acute anxiety and resets your fight-or-flight nervous system.',
    instructions: [
      'Sit comfortably and let all air out of your lungs.',
      'Inhale slowly through your nose for 4 seconds.',
      'Hold your breath gently for 4 seconds.',
      'Exhale slowly through your mouth for 4 seconds, empty your lungs.',
      'Hold your lungs empty for 4 seconds.',
      'Repeat the cycle 4 times.'
    ]
  },
  {
    id: '4-7-8-relax',
    name: '4-7-8 Relaxing Breath',
    category: 'Breathing',
    duration: 3,
    difficulty: 'Medium',
    description: 'A natural tranquilizer for the nervous system, helpful for falling asleep or breaking panic loops.',
    instructions: [
      'Exhale completely through your mouth with a whoosh sound.',
      'Close your mouth and inhale quietly through your nose for 4 seconds.',
      'Hold your breath for a count of 7 seconds.',
      'Exhale completely through your mouth making a whoosh sound for 8 seconds.',
      'This is one breath. Repeat the cycle for a total of 4 breaths.'
    ]
  },
  {
    id: 'body-scan',
    name: 'Body Scan Meditation',
    category: 'Meditation',
    duration: 10,
    difficulty: 'Medium',
    description: 'A guided somatic grounding practice to release physical tension held unconsciously in the body.',
    instructions: [
      'Lie flat on your back or sit in a supported chair. Close your eyes.',
      'Bring your attention to your feet. Notice any tingling, warmth, or tension.',
      'Slowly scan upward: calves, knees, thighs, noticing sensations and letting them soften on exhales.',
      'Move through your torso, lower back, chest, shoulders, jaw, and brow.',
      'If your mind wanders, gently return focus to the physical sensation of breathing.'
    ]
  },
  {
    id: 'mindful-acceptance',
    name: 'Mindful Emotion Acceptance',
    category: 'Meditation',
    duration: 5,
    difficulty: 'Easy',
    description: 'A practice of sitting in silence with difficult emotions, letting them exist without fighting or judging them.',
    instructions: [
      'Find a comfortable posture. Take 3 deep, grounding breaths.',
      'Locate where you feel the emotion in your body (e.g. tight chest, heavy stomach).',
      'Silently say to yourself: "It is okay that this is here. Let me feel it."',
      'Visualize breathing into that space, creating room for the feeling to just sit and slowly dissipate.'
    ]
  },
  {
    id: 'progressive-muscle-relax',
    name: 'Progressive Muscle Relaxation (PMR)',
    category: 'Physical',
    duration: 12,
    difficulty: 'Medium',
    description: 'Tension-release technique involving flexing and releasing key muscle groups in sequence.',
    instructions: [
      'Inhale and curl your toes downward tightly for 5 seconds. Exhale and release completely.',
      'Tense your calves, thighs, and buttocks. Hold for 5 seconds, then let go.',
      'Tense your abdominal muscles, arch your back slightly. Hold, then release.',
      'Clench your fists and flex your biceps. Hold, then relax.',
      'Shrug your shoulders to your ears, squeeze your eyes shut. Hold, then let go.'
    ]
  },
  {
    id: 'gentle-neck-shoulder-stretch',
    name: 'Gentle Neck & Shoulder Release',
    category: 'Physical',
    duration: 5,
    difficulty: 'Easy',
    description: 'Simple desk stretches to release physical fatigue and accumulated upper body tension.',
    instructions: [
      'Sit up straight. Drop your right ear to your right shoulder, holding for 15 seconds. Repeat on left.',
      'Slowly tuck your chin to your chest, interlace fingers behind your head for a light pull. Hold 15s.',
      'Perform 5 slow backwards shoulder rolls, then 5 forwards shoulder rolls.',
      'Inhale and stretch arms overhead. Clasp hands, lean right, then lean left.'
    ]
  },
  {
    id: 'sleep-wind-down',
    name: 'Sleep Wind-Down Routine',
    category: 'Sleep',
    duration: 15,
    difficulty: 'Easy',
    description: 'Cognitive hygiene tips to transition your brain from active planning to deep, restorative sleep.',
    instructions: [
      'Power down all blue-light screens (phone, computer) at least 30 minutes before bed.',
      'Write down a quick list of tomorrow\'s concerns to offload cognitive worry.',
      'Dim your lights and drink a warm caffeine-free herbal tea (like Chamomile).',
      'Perform 5 slow, deep abdominal breaths in bed, focusing on the rise and fall of your stomach.'
    ]
  }
];

/**
 * GET /api/exercises
 * Returns all available exercises
 */
router.get('/', (req, res) => {
  res.json(EXERCISES);
});

/**
 * GET /api/exercises/recommendations
 * Recommends 2-3 exercises based on the user's latest mood entry
 */
router.get('/recommendations', async (req, res) => {
  try {
    const userId = req.user.uid;
    
    // Fetch user's latest mood
    const moodsSnapshot = await db.collection('moods')
      .where('userId', '==', userId)
      .get();
      
    const moodLogs = [];
    moodsSnapshot.forEach(doc => {
      moodLogs.push(doc.data());
    });

    let latestMood = 'Calm';
    if (moodLogs.length > 0) {
      moodLogs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      latestMood = moodLogs[0].mood;
    }

    // Recommendation logic based on mood
    let recommendedIds = [];
    switch (latestMood) {
      case 'Anxious':
        recommendedIds = ['box-breathing', 'body-scan'];
        break;
      case 'Stressed':
        recommendedIds = ['progressive-muscle-relax', 'box-breathing'];
        break;
      case 'Sad':
        recommendedIds = ['mindful-acceptance', 'gentle-neck-shoulder-stretch'];
        break;
      case 'Angry':
        recommendedIds = ['box-breathing', 'mindful-acceptance'];
        break;
      case 'Tired':
        recommendedIds = ['sleep-wind-down', 'gentle-neck-shoulder-stretch'];
        break;
      case 'Calm':
      case 'Happy':
      default:
        recommendedIds = ['4-7-8-relax', 'body-scan'];
        break;
    }

    const recommendations = EXERCISES.filter(ex => recommendedIds.includes(ex.id));
    res.json({
      moodChecked: latestMood,
      recommendations
    });
  } catch (error) {
    console.error('Error compiling recommendations:', error);
    res.status(500).json({ error: 'Failed to compile exercise recommendations' });
  }
});

/**
 * GET /api/exercises/progress
 * Retrieves user completion history and summary statistics
 */
router.get('/progress', async (req, res) => {
  try {
    const userId = req.user.uid;
    const progressSnapshot = await db.collection('exercise_progress')
      .where('userId', '==', userId)
      .get();

    const progressLogs = [];
    let totalMinutes = 0;
    const completionsByCategory = {};

    progressSnapshot.forEach(doc => {
      const data = doc.data();
      progressLogs.push({
        id: doc.id,
        ...data
      });
      
      const durationMin = Math.round((data.durationCompleted || 0) / 60);
      totalMinutes += durationMin;

      const cat = data.category || 'Other';
      completionsByCategory[cat] = (completionsByCategory[cat] || 0) + 1;
    });

    // Sort progress logs by completion date descending
    progressLogs.sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt));

    res.json({
      totalCompletions: progressLogs.length,
      totalMinutesCompleted: totalMinutes,
      completionsByCategory,
      history: progressLogs
    });
  } catch (error) {
    console.error('Error fetching exercise progress:', error);
    res.status(500).json({ error: 'Failed to fetch exercise progress' });
  }
});

/**
 * POST /api/exercises/progress
 * Logs a completed exercise session
 */
router.post('/progress', async (req, res) => {
  try {
    const userId = req.user.uid;
    const { exerciseId, duration } = req.body;

    if (!exerciseId) {
      return res.status(400).json({ error: 'Exercise ID is required' });
    }

    const targetEx = EXERCISES.find(ex => ex.id === exerciseId);
    if (!targetEx) {
      return res.status(404).json({ error: 'Exercise not found in library' });
    }

    const durationVal = parseInt(duration) || (targetEx.duration * 60); // fallback to static exercise duration in secs

    const newProgress = {
      userId,
      exerciseId,
      name: targetEx.name,
      category: targetEx.category,
      durationCompleted: durationVal,
      completedAt: new Date().toISOString()
    };

    const docRef = await db.collection('exercise_progress').add(newProgress);
    res.status(201).json({
      id: docRef.id,
      ...newProgress
    });
  } catch (error) {
    console.error('Error saving progress:', error);
    res.status(500).json({ error: 'Failed to log completion progress' });
  }
});

module.exports = router;
