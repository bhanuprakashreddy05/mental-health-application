import React, { createContext, useContext, useState, useEffect } from 'react';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  sendPasswordResetEmail,
  onAuthStateChanged,
  updateProfile
} from 'firebase/auth';

// Create context
const AuthContext = createContext(null);

// Safe Firebase Initialization
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

const isFirebaseConfigured = !!(firebaseConfig.apiKey && firebaseConfig.projectId);

let firebaseApp = null;
let firebaseAuth = null;

if (isFirebaseConfigured) {
  try {
    firebaseApp = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    firebaseAuth = getAuth(firebaseApp);
  } catch (err) {
    console.error('Firebase Auth Web SDK failed initialization, fallback to Mock Mode:', err.message);
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isMockMode, setIsMockMode] = useState(!firebaseAuth);

  useEffect(() => {
    if (firebaseAuth) {
      // 1. Firebase Mode Listener
      const unsubscribe = onAuthStateChanged(firebaseAuth, async (fbUser) => {
        if (fbUser) {
          const token = await fbUser.getIdToken();
          localStorage.setItem('pm_token', token);
          setUser({
            uid: fbUser.uid,
            email: fbUser.email,
            displayName: fbUser.displayName || fbUser.email.split('@')[0],
            photoURL: fbUser.photoURL || 'avatar1'
          });
        } else {
          localStorage.removeItem('pm_token');
          setUser(null);
        }
        setLoading(false);
      });
      return unsubscribe;
    } else {
      // 2. Mock Mode Session Restore
      const savedUser = localStorage.getItem('pm_user');
      const savedToken = localStorage.getItem('pm_token');
      if (savedUser && savedToken) {
        setUser(JSON.parse(savedUser));
      }
      setLoading(false);
    }
  }, []);

  // Login Function
  const login = async (email, password) => {
    if (firebaseAuth) {
      const userCredential = await signInWithEmailAndPassword(firebaseAuth, email, password);
      const token = await userCredential.user.getIdToken();
      localStorage.setItem('pm_token', token);
      return userCredential.user;
    } else {
      // Mock Login
      if (email === 'demo@peacemind.com' || password.length >= 6) {
        const mockUser = {
          uid: email === 'demo@peacemind.com' ? 'demo-user-id' : `mock-${Math.random().toString(36).substring(2, 9)}`,
          email,
          displayName: email.split('@')[0],
          photoURL: 'avatar1'
        };
        localStorage.setItem('pm_token', `mock-${mockUser.uid}_${email}`);
        localStorage.setItem('pm_user', JSON.stringify(mockUser));
        setUser(mockUser);
        return mockUser;
      }
      throw new Error('Invalid credentials. Password must be at least 6 characters.');
    }
  };

  // Register Function
  const register = async (name, email, password) => {
    if (firebaseAuth) {
      const userCredential = await createUserWithEmailAndPassword(firebaseAuth, email, password);
      await updateProfile(userCredential.user, { displayName: name });
      const token = await userCredential.user.getIdToken();
      localStorage.setItem('pm_token', token);
      setUser({
        uid: userCredential.user.uid,
        email: userCredential.user.email,
        displayName: name,
        photoURL: 'avatar1'
      });
      return userCredential.user;
    } else {
      // Mock Register
      const mockUser = {
        uid: `mock-${Math.random().toString(36).substring(2, 9)}`,
        email,
        displayName: name,
        photoURL: 'avatar1'
      };
      localStorage.setItem('pm_token', `mock-${mockUser.uid}_${email}`);
      localStorage.setItem('pm_user', JSON.stringify(mockUser));
      setUser(mockUser);
      return mockUser;
    }
  };

  // Logout Function
  const logout = async () => {
    if (firebaseAuth) {
      await signOut(firebaseAuth);
    }
    localStorage.removeItem('pm_token');
    localStorage.removeItem('pm_user');
    setUser(null);
  };

  // Reset Password Function
  const resetPassword = async (email) => {
    if (firebaseAuth) {
      await sendPasswordResetEmail(firebaseAuth, email);
    } else {
      // Mock password reset
      console.log(`Mock reset password email sent to: ${email}`);
      return true;
    }
  };

  // Local updates for User Details
  const updateUserProfile = async (displayName, photoURL) => {
    if (firebaseAuth && firebaseAuth.currentUser) {
      await updateProfile(firebaseAuth.currentUser, { displayName, photoURL });
      setUser(prev => ({
        ...prev,
        displayName,
        photoURL
      }));
    } else {
      // Mock Profile Update
      const updatedUser = {
        ...user,
        displayName: displayName || user.displayName,
        photoURL: photoURL || user.photoURL
      };
      localStorage.setItem('pm_user', JSON.stringify(updatedUser));
      setUser(updatedUser);
    }
  };

  const toggleMockMode = (mode) => {
    setIsMockMode(mode);
    if (mode) {
      // If switching to mock mode, clear Firebase details and put dummy details
      const dummy = {
        uid: 'demo-user-id',
        email: 'demo@peacemind.com',
        displayName: 'Mindful Explorer',
        photoURL: 'avatar1'
      };
      localStorage.setItem('pm_token', 'demo-token');
      localStorage.setItem('pm_user', JSON.stringify(dummy));
      setUser(dummy);
    } else {
      logout();
    }
  };

  const value = {
    user,
    loading,
    isMockMode,
    isFirebaseConfigured,
    login,
    register,
    logout,
    resetPassword,
    updateUserProfile,
    toggleMockMode
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
