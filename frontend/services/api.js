import axios from 'axios';

// Create API client
const api = axios.create({
  baseURL: '', // Empty base URL since Vite handles proxying in development
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to dynamically inject the Firebase ID token (or mock token)
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('pm_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle authorization errors (e.g. session expirations)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      console.warn('Unauthorized request detected - clearing session token');
      localStorage.removeItem('pm_token');
      localStorage.removeItem('pm_user');
      // Redirect to login if on protected route (handled gracefully in React Router)
    }
    return Promise.reject(error);
  }
);

/* ==================== API Call Methods ==================== */

// 1. Moods
export const getMoods = () => api.get('/api/moods').then(res => res.data);
export const logMood = (mood, note, rating) => api.post('/api/moods', { mood, note, rating }).then(res => res.data);
export const deleteMood = (id) => api.delete(`/api/moods/${id}`).then(res => res.data);

// 2. Diary
export const getDiary = (search = '') => api.get(`/api/diary${search ? `?search=${encodeURIComponent(search)}` : ''}`).then(res => res.data);
export const addDiary = (title, content) => api.post('/api/diary', { title, content }).then(res => res.data);
export const updateDiary = (id, title, content) => api.put(`/api/diary/${id}`, { title, content }).then(res => res.data);
export const deleteDiary = (id) => api.delete(`/api/diary/${id}`).then(res => res.data);

// 3. AI Chat Companion
export const getChatHistory = (personality) => api.get(`/api/chat${personality ? `?personality=${personality}` : ''}`).then(res => res.data);
export const sendChatMessage = (message, personality) => api.post('/api/chat', { message, personality }).then(res => res.data);

// 4. Exercises Gym
export const getExercises = () => api.get('/api/exercises').then(res => res.data);
export const getExerciseRecommendations = () => api.get('/api/exercises/recommendations').then(res => res.data);
export const getExerciseProgress = () => api.get('/api/exercises/progress').then(res => res.data);
export const logExerciseProgress = (exerciseId, duration) => api.post('/api/exercises/progress', { exerciseId, duration }).then(res => res.data);

// 5. Profile & Stats
export const getProfile = () => api.get('/api/profile').then(res => res.data);
export const updateProfile = (displayName, photoURL) => api.put('/api/profile', { displayName, photoURL }).then(res => res.data);

// 6. AI Wellness Insights
export const getWellnessInsights = () => api.get('/api/insights').then(res => res.data);
export const refreshWellnessInsights = () => api.post('/api/insights/refresh').then(res => res.data);

export default api;
