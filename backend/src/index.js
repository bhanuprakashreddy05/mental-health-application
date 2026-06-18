const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

// Initialize Express
const app = express();
const PORT = process.env.PORT || 5000;

// Apply Global Middlewares
app.use(helmet({
  crossOriginResourcePolicy: false // Allow loading fonts/resources from local dev ports
}));
app.use(cors({
  origin: '*', // Allow all client connections in local dev
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(morgan('dev'));

// Static status endpoint
app.get('/', (req, res) => {
  res.json({
    status: 'healthy',
    application: 'Peaceful Mind Full-Stack API',
    timestamp: new Date().toISOString()
  });
});

// Register API Route Handlers
const moodsRouter = require('./routes/moods');
const diaryRouter = require('./routes/diary');
const chatRouter = require('./routes/chat');
const exercisesRouter = require('./routes/exercises');
const profileRouter = require('./routes/profile');
const insightsRouter = require('./routes/insights');

app.use('/api/moods', moodsRouter);
app.use('/api/diary', diaryRouter);
app.use('/api/chat', chatRouter);
app.use('/api/exercises', exercisesRouter);
app.use('/api/profile', profileRouter);
app.use('/api/insights', insightsRouter);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Exception:', err.stack);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error'
  });
});

// Start Server
app.listen(PORT, () => {
  console.log(`Peaceful Mind Server is running on http://localhost:${PORT}`);
  console.log(`AI Insights, Companion, and Diary Summaries active.`);
});

module.exports = app; // For testing
