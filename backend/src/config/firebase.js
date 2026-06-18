const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

const useMock = process.env.USE_MOCK_DATABASE === 'true' || !process.env.FIREBASE_PROJECT_ID;
const mockDbPath = path.join(__dirname, '..', '..', 'mock_db.json');

// Helper to load mock DB
function getMockDB() {
  try {
    if (!fs.existsSync(mockDbPath)) {
      // Initialize with default seeds
      const initialData = {
        users: {
          'demo-user-id': {
            uid: 'demo-user-id',
            email: 'demo@peacemind.com',
            displayName: 'Mindful Explorer',
            photoURL: 'avatar1',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        },
        moods: {
          'mood1': {
            id: 'mood1',
            userId: 'demo-user-id',
            mood: 'Calm',
            note: 'Enjoyed a quiet morning walk by the river.',
            rating: 8,
            timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
          },
          'mood2': {
            id: 'mood2',
            userId: 'demo-user-id',
            mood: 'Anxious',
            note: 'Feeling a bit overwhelmed about upcoming presentations.',
            rating: 4,
            timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
          },
          'mood3': {
            id: 'mood3',
            userId: 'demo-user-id',
            mood: 'Happy',
            note: 'Had a wonderful dinner with old friends.',
            rating: 9,
            timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
          }
        },
        diary: {
          'diary1': {
            id: 'diary1',
            userId: 'demo-user-id',
            title: 'Reflections on Peace',
            content: 'Today I learned the value of taking small breaks. Work was hectic, but I stepped away for 5 minutes and just practiced slow breathing. It made a world of difference.',
            emotionsTags: ['Calm', 'Stressed'],
            summary: 'The entry describes a stressful work day managed successfully by taking a short breathing break, showcasing resilience and self-awareness.',
            recommendations: 'Continue practicing brief micro-breaks when work stress peaks. Try the Box Breathing exercise.',
            timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
          }
        },
        chats: {
          'chat1': {
            id: 'chat1',
            userId: 'demo-user-id',
            personality: 'compassionate',
            message: 'I have been feeling really tired and anxious lately.',
            response: 'I hear you, and I am so sorry you are going through this. Feeling both tired and anxious can feel like a heavy cycle. When our bodies are exhausted, our minds can become more vulnerable to stress. Let us start by taking a slow breath together. Would you like to try a short breathing exercise, or just share more about what has been on your mind?',
            timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString()
          }
        },
        exercise_progress: {
          'progress1': {
            id: 'progress1',
            userId: 'demo-user-id',
            exerciseId: 'box-breathing',
            name: 'Box Breathing',
            category: 'Breathing',
            durationCompleted: 240, // 4 mins
            completedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
          }
        }
      };
      fs.writeFileSync(mockDbPath, JSON.stringify(initialData, null, 2), 'utf8');
      return initialData;
    }
    const data = fs.readFileSync(mockDbPath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error loading mock database:', error);
    return {};
  }
}

// Helper to save mock DB
function saveMockDB(data) {
  try {
    fs.writeFileSync(mockDbPath, JSON.stringify(data, null, 2), 'utf8');
  } catch (error) {
    console.error('Error saving mock database:', error);
  }
}

// Mock Firestore Classes
class MockDocumentReference {
  constructor(collectionName, docId, data = null) {
    this.collectionName = collectionName;
    this.id = docId;
    this._data = data;
  }
  async get() {
    return {
      exists: this._data !== null,
      id: this.id,
      data: () => this._data
    };
  }
  async set(data, options = {}) {
    const db = getMockDB();
    if (!db[this.collectionName]) db[this.collectionName] = {};
    if (options.merge && db[this.collectionName][this.id]) {
      db[this.collectionName][this.id] = { ...db[this.collectionName][this.id], ...data };
    } else {
      db[this.collectionName][this.id] = data;
    }
    this._data = db[this.collectionName][this.id];
    saveMockDB(db);
    return this;
  }
  async update(data) {
    return this.set(data, { merge: true });
  }
  async delete() {
    const db = getMockDB();
    if (db[this.collectionName] && db[this.collectionName][this.id]) {
      delete db[this.collectionName][this.id];
      saveMockDB(db);
    }
  }
}

class MockQuerySnapshot {
  constructor(docs) {
    this.docs = docs;
    this.size = docs.length;
    this.empty = docs.length === 0;
  }
  forEach(callback) {
    this.docs.forEach(callback);
  }
}

class MockQuery {
  constructor(collectionName, filterFn) {
    this.collectionName = collectionName;
    this.filters = filterFn ? [filterFn] : [];
    this.sortField = null;
    this.sortDir = 'asc';
    this.limitNum = null;
  }
  where(field, op, value) {
    this.filters.push((doc) => {
      if (!doc) return false;
      if (op === '==') return doc[field] === value;
      if (op === '>=') return doc[field] >= value;
      if (op === '<=') return doc[field] <= value;
      if (op === 'array-contains') return Array.isArray(doc[field]) && doc[field].includes(value);
      return false;
    });
    return this;
  }
  orderBy(field, direction = 'asc') {
    this.sortField = field;
    this.sortDir = direction;
    return this;
  }
  limit(num) {
    this.limitNum = num;
    return this;
  }
  async get() {
    const db = getMockDB();
    const colData = db[this.collectionName] || {};
    let docs = Object.keys(colData).map(id => ({
      id,
      data: () => colData[id]
    })).filter(doc => {
      const data = doc.data();
      return this.filters.every(fn => fn(data));
    });

    if (this.sortField) {
      docs.sort((a, b) => {
        const valA = a.data()[this.sortField];
        const valB = b.data()[this.sortField];
        if (valA === undefined || valB === undefined) return 0;
        if (valA < valB) return this.sortDir === 'asc' ? -1 : 1;
        if (valA > valB) return this.sortDir === 'asc' ? 1 : -1;
        return 0;
      });
    }

    if (this.limitNum) {
      docs = docs.slice(0, this.limitNum);
    }

    return new MockQuerySnapshot(docs);
  }
}

class MockCollectionReference extends MockQuery {
  constructor(collectionName) {
    super(collectionName);
    this.name = collectionName;
  }
  doc(id) {
    const db = getMockDB();
    const docId = id || Math.random().toString(36).substring(2, 15);
    const data = db[this.name] && db[this.name][docId] ? db[this.name][docId] : null;
    return new MockDocumentReference(this.name, docId, data);
  }
  async add(data) {
    const id = Math.random().toString(36).substring(2, 15);
    const docData = { ...data, id };
    const docRef = this.doc(id);
    await docRef.set(docData);
    return docRef;
  }
}

class MockFirestore {
  collection(name) {
    return new MockCollectionReference(name);
  }
}

// Initializing real Firebase or Mock
let db;
let auth;

if (useMock) {
  console.log('Peaceful Mind Backend: Initializing in MOCK DATABASE mode (fallback).');
  db = new MockFirestore();
  auth = {
    verifyIdToken: async (token) => {
      if (token === 'demo-token') {
        return {
          uid: 'demo-user-id',
          email: 'demo@peacemind.com',
          name: 'Mindful Explorer'
        };
      }
      // Simple decode or parse for mock tokens (e.g. mock-uid_email)
      if (token.startsWith('mock-')) {
        const parts = token.split('_');
        const uid = parts[0];
        const email = parts[1] || 'user@example.com';
        return { uid, email, name: email.split('@')[0] };
      }
      throw new Error('Invalid mock authentication token.');
    }
  };
} else {
  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      })
    });
    console.log('Firebase Admin initialized successfully in production mode.');
    db = admin.firestore();
    auth = admin.auth();
  } catch (error) {
    console.error('Firebase Admin failed initialization, falling back to mock.', error);
    db = new MockFirestore();
    auth = {
      verifyIdToken: async (token) => {
        if (token === 'demo-token') {
          return { uid: 'demo-user-id', email: 'demo@peacemind.com', name: 'Mindful Explorer' };
        }
        if (token.startsWith('mock-')) {
          const parts = token.split('_');
          const uid = parts[0];
          const email = parts[1] || 'user@example.com';
          return { uid, email, name: email.split('@')[0] };
        }
        throw new Error('Invalid mock authentication token.');
      }
    };
  }
}

module.exports = {
  db,
  auth,
  useMock
};
