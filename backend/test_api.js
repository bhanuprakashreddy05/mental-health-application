const http = require('http');
const app = require('./src/index');

// Set port to 5001 for test execution
const PORT = 5001;
let server;

// Helper to make HTTP requests
function makeRequest(method, path, headers = {}, body = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: PORT,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          const parsed = data ? JSON.parse(data) : {};
          resolve({ status: res.statusCode, body: parsed });
        } catch (err) {
          resolve({ status: res.statusCode, rawBody: data });
        }
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

// Main Test Runner
async function runTests() {
  console.log('--- Starting Peaceful Mind API Verification ---');
  let exitCode = 0;

  try {
    // 1. Verify Server is Alive
    console.log('\n[Test 1] GET / (Server Health Check)');
    const resRoot = await makeRequest('GET', '/');
    if (resRoot.status === 200 && resRoot.body.status === 'healthy') {
      console.log('✅ Pass: Server health endpoint returns status: healthy');
    } else {
      console.error('❌ Fail: Expected 200 OK, got', resRoot.status, resRoot.body);
      exitCode = 1;
    }

    // 2. Verify Auth Rejection
    console.log('\n[Test 2] GET /api/moods (Auth Guard Test)');
    const resAuthGuard = await makeRequest('GET', '/api/moods');
    if (resAuthGuard.status === 401) {
      console.log('✅ Pass: Request without Authorization header rejected with 401 Unauthorized');
    } else {
      console.error('❌ Fail: Expected 401 Unauthorized, got', resAuthGuard.status);
      exitCode = 1;
    }

    // Auth Token for subsequent tests
    const authHeaders = { 'Authorization': 'Bearer demo-token' };

    // 3. Verify Moods API
    console.log('\n[Test 3] GET /api/moods (Fetch Moods Timeline)');
    const resMoods = await makeRequest('GET', '/api/moods', authHeaders);
    if (resMoods.status === 200 && Array.isArray(resMoods.body)) {
      console.log(`✅ Pass: Received mood timeline with ${resMoods.body.length} entries`);
    } else {
      console.error('❌ Fail: Fetching moods failed with status', resMoods.status);
      exitCode = 1;
    }

    // 4. Verify Log Mood API
    console.log('\n[Test 4] POST /api/moods (Log Mood)');
    const newMood = { mood: 'Calm', note: 'Writing API tests is relaxing.', rating: 8 };
    const resLogMood = await makeRequest('POST', '/api/moods', authHeaders, newMood);
    if (resLogMood.status === 201 && resLogMood.body.mood === 'Calm') {
      console.log('✅ Pass: New mood entry successfully saved in database');
    } else {
      console.error('❌ Fail: Logging mood failed with status', resLogMood.status);
      exitCode = 1;
    }

    // 5. Verify Diary API
    console.log('\n[Test 5] POST /api/diary (Create Journal & AI Summary)');
    const newJournal = { title: 'Quiet Afternoon', content: 'Today was productive and quiet. I finished refactoring the api router and felt a strong sense of relief.' };
    const resDiary = await makeRequest('POST', '/api/diary', authHeaders, newJournal);
    if (resDiary.status === 201 && resDiary.body.title === 'Quiet Afternoon') {
      console.log('✅ Pass: Journal saved, AI summary generated:', resDiary.body.summary);
      console.log('AI detected feelings:', resDiary.body.emotionsTags.join(', '));
    } else {
      console.error('❌ Fail: Saving journal failed with status', resDiary.status);
      exitCode = 1;
    }

    // 6. Verify Exercise Recommendations
    console.log('\n[Test 6] GET /api/exercises/recommendations (Mood Recommendations)');
    const resRecs = await makeRequest('GET', '/api/exercises/recommendations', authHeaders);
    if (resRecs.status === 200 && resRecs.body.recommendations) {
      console.log(`✅ Pass: Recommends ${resRecs.body.recommendations.length} exercises based on mood: ${resRecs.body.moodChecked}`);
    } else {
      console.error('❌ Fail: Recommendations query failed with status', resRecs.status);
      exitCode = 1;
    }

    // 7. Verify Profile and Stats
    console.log('\n[Test 7] GET /api/profile (Stats aggregation)');
    const resProfile = await makeRequest('GET', '/api/profile', authHeaders);
    if (resProfile.status === 200 && resProfile.body.stats) {
      console.log('✅ Pass: Retrieved user metrics summary successfully');
      console.log('Logged Moods count:', resProfile.body.stats.totalMoodsLogged);
      console.log('Journal count:', resProfile.body.stats.totalJournalsWritten);
    } else {
      console.error('❌ Fail: Profile query failed with status', resProfile.status);
      exitCode = 1;
    }

    // 8. Verify AI Wellness Insights
    console.log('\n[Test 8] GET /api/insights (AI Wellness Insights)');
    const resInsights = await makeRequest('GET', '/api/insights', authHeaders);
    if (resInsights.status === 200 && resInsights.body.insight) {
      console.log('✅ Pass: AI Insights compiled successfully:', resInsights.body.insight);
    } else {
      console.error('❌ Fail: AI Insights generation failed with status', resInsights.status);
      exitCode = 1;
    }

  } catch (error) {
    console.error('❌ Fail: Script encountered unexpected error:', error);
    exitCode = 1;
  }

  // Gracefully close server and exit
  console.log('\n--- API Verification Finished ---');
  server.close(() => {
    console.log('Server shut down successfully.');
    process.exit(exitCode);
  });
}

// Start Server locally
server = app.listen(PORT, () => {
  console.log(`Test Express server booting on port ${PORT}...`);
  runTests();
});
