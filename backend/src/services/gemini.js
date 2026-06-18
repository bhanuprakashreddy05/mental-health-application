const { GoogleGenerativeAI } = require('@google/generative-ai');

const apiKey = process.env.GEMINI_API_KEY;
let genAI = null;

if (apiKey) {
  genAI = new GoogleGenerativeAI(apiKey);
} else {
  console.warn('GEMINI_API_KEY is not defined in the environment. AI features will run in simulated demo mode.');
}

const DEFAULT_MODEL = 'gemini-1.5-flash';

// System Prompts for Chat Personalities
const PERSONALITIES = {
  compassionate: `You are 'Peaceful Mind Companion', a compassionate and empathetic mental wellness assistant. 
Your goal is to listen deeply, show unconditional positive regard, and help the user explore their feelings. 
Keep your responses comforting, warm, and conversational. Limit answers to 3-4 sentences.
Always maintain a safe, supportive boundary. If the user indicates crisis, self-harm, or severe medical depression, gently provide helpline resources and suggest seeking human professional support.`,

  mindful: `You are 'Mindfulness Coach', a calm, centered, and grounded mental wellness guide.
Your style is rooted in Vipassana, Zen, and cognitive-behavioral mindfulness. You focus on the present moment, bodily sensations, and breathing.
Keep responses concise, peaceful, and suggest practical mindfulness micro-practices (e.g., box breathing, 5-4-3-2-1 grounding). Limit answers to 3-4 sentences.`,

  cheerful: `You are 'Joyful Catalyst', a warm, encouraging, and optimistic wellness partner.
You focus on positive psychology, gratitude, and action-oriented self-care. 
You highlight small wins, prompt user to find silver linings, and suggest light physical activities or positive habits. Limit answers to 3-4 sentences.`
};

/**
 * Generate chat response from Gemini
 */
async function generateChatResponse(personality, messageHistory, newMessage) {
  if (!genAI) {
    return simulateChatResponse(personality, newMessage);
  }

  try {
    const model = genAI.getGenerativeModel({ model: DEFAULT_MODEL });
    const systemPrompt = PERSONALITIES[personality] || PERSONALITIES.compassionate;

    // Convert message history to Gemini contents format
    // Map roles: 'user' -> 'user', 'ai' -> 'model'
    const contents = messageHistory.map(msg => ({
      role: msg.sender === 'user' ? 'user' : 'model',
      parts: [{ text: msg.text }]
    }));

    // Add current message
    contents.push({
      role: 'user',
      parts: [{ text: newMessage }]
    });

    const chat = model.startChat({
      history: contents.slice(0, -1), // Everything except the latest user message
      systemInstruction: systemPrompt
    });

    const result = await chat.sendMessage(newMessage);
    return result.response.text();
  } catch (error) {
    console.error('Gemini generateChatResponse error:', error);
    return simulateChatResponse(personality, newMessage);
  }
}

/**
 * Analyze diary entries and return a structured summary, emotion tags, and recommendations
 */
async function summarizeDiaryEntry(title, content) {
  const defaultSummary = {
    summary: 'A personal diary entry capturing reflections of the day.',
    emotionsTags: ['Calm'],
    recommendations: 'Continue journaling daily to capture thoughts and improve self-awareness.'
  };

  if (!genAI) {
    return defaultSummary;
  }

  try {
    const model = genAI.getGenerativeModel({ model: DEFAULT_MODEL });
    const prompt = `
You are a mental health wellness analyzer. Analyze the following user diary entry.
Title: "${title || 'Untitled'}"
Content: "${content}"

Produce a JSON output with the exact keys:
1. "summary" (A 1-2 sentence empathetic summary summarizing the user's entry and key events/feelings).
2. "emotionsTags" (An array of 1 to 3 words indicating emotions detected. Choose ONLY from: Happy, Sad, Angry, Anxious, Stressed, Calm, Tired).
3. "recommendations" (A 1-2 sentence recommendation for a self-care exercise, meditation, or positive action based on their entry).

JSON Output:`;

    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: { responseMimeType: 'application/json' }
    });

    const responseText = result.response.text();
    return JSON.parse(responseText);
  } catch (error) {
    console.error('Gemini summarizeDiaryEntry error:', error);
    return defaultSummary;
  }
}

/**
 * Generate high-level AI insights based on recent mood logs and diary logs
 */
async function generateMoodAndWellnessInsights(moodLogs, diaryEntries) {
  const fallbackInsight = 'Keep tracking your moods regularly! Consistency helps the AI find long-term trends and suggest tailored routines.';
  
  if (!genAI) {
    return fallbackInsight;
  }

  try {
    const model = genAI.getGenerativeModel({ model: DEFAULT_MODEL });
    
    const moodsData = moodLogs.map(m => `Mood: ${m.mood}, Rating: ${m.rating}/10, Note: ${m.note || 'None'}, Date: ${m.timestamp}`).join('\n');
    const diaryData = diaryEntries.map(d => `Title: ${d.title}, Tags: ${d.emotionsTags?.join(',')}, Date: ${d.timestamp}`).join('\n');

    const prompt = `
You are a compassionate wellness advisor. Analyze the following tracking logs of a user:

Recent Mood Logs:
${moodsData || 'No mood entries logged yet.'}

Recent Diary Entries:
${diaryData || 'No journal entries written yet.'}

Task: Write a 2-sentence encouraging, therapeutic, and evidence-based wellness insight. 
Identify any correlations between notes, tags, ratings, and emotions (e.g. if they feel Stressed when working, or Calm on weekends). 
Do not mention technical terms like "JSON" or "data logs". Speak directly to the user as "you". Keep it calming and insightful.

AI Insight:`;

    const result = await model.generateContent(prompt);
    return result.response.text().trim();
  } catch (error) {
    console.error('Gemini generateMoodAndWellnessInsights error:', error);
    return fallbackInsight;
  }
}

// Simulated fallback generators when Gemini API Key is missing or errors out
function simulateChatResponse(personality) {
  const replies = {
    compassionate: [
      "I hear what you are saying, and I want you to know you are not alone in feeling this way.",
      "Thank you for sharing that with me. It is completely okay to feel a bit out of balance sometimes.",
      "How does it feel to talk about this? Take your time, there is absolutely no rush here.",
      "I am here to listen. Let us take a gentle breath together and see what we can explore."
    ],
    mindful: [
      "Let us pause for a moment and bring our awareness to the present breath.",
      "Notice where you are holding tension right now. Perhaps in your shoulders or jaw. Let it relax.",
      "Feel the contact of your feet against the ground. Just breathe in, and breathe out.",
      "Remember, thoughts are like clouds passing in the sky. You are the sky, not the clouds."
    ],
    cheerful: [
      "That is a great step forward! Even expressing what is on your mind is a win.",
      "I love your awareness! What is one small thing you can do right now to treat yourself with kindness?",
      "You have got this! Let us focus on what we can control and take it step by step.",
      "A short stretch or a cup of warm tea can work wonders. What is your go-to comfort routine?"
    ]
  };

  const options = replies[personality] || replies.compassionate;
  const randomIndex = Math.floor(Math.random() * options.length);
  return options[randomIndex] + " (Simulated Response)";
}

module.exports = {
  generateChatResponse,
  summarizeDiaryEntry,
  generateMoodAndWellnessInsights
};
