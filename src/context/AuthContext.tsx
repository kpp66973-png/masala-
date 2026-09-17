import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, signInWithPopup, signOut as firebaseSignOut, onAuthStateChanged } from 'firebase/auth';
import { auth, googleAuthProvider } from '../lib/firebase.ts';
import { syncUserProfile, adminLogin } from '../api.ts';
import { UserProfile } from '../types.ts';

interface AuthContextType {
  currentUser: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  isAdmin: boolean;
  adminKey: string | null;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  loginWithAdminKey: (pass: string) => Promise<boolean>;
  logoutAdmin: () => void;
  getIdToken: () => Promise<string | undefined>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [adminKey, setAdminKey] = useState<string | null>(localStorage.getItem('masala_admin_key'));

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        try {
          const token = await user.getIdToken();
          const synced = await syncUserProfile(
            {
              uid: user.uid,
              email: user.email || '',
              name: user.displayName || '',
            },
            token
          );
          setUserProfile(synced);
        } catch (err) {
          console.warn('Failed to sync profile on auth state change:', err);
        }
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleAuthProvider);
      const token = await result.user.getIdToken();
      const profile = await syncUserProfile(
        {
          uid: result.user.uid,
          email: result.user.email || '',
          name: result.user.displayName || '',
        },
        token
      );
      setUserProfile(profile);
    } catch (error: any) {
      console.error('Google Sign-In failed:', error);
      throw error;
    }
  };

  const signOut = async () => {
    await firebaseSignOut(auth);
    setCurrentUser(null);
    setUserProfile(null);
  };

  const loginWithAdminKey = async (pass: string) => {
    try {
      const res = await adminLogin(pass);
      if (res.success && res.adminKey) {
        setAdminKey(res.adminKey);
        localStorage.setItem('masala_admin_key', res.adminKey);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  const logoutAdmin = () => {
    setAdminKey(null);
    localStorage.removeItem('masala_admin_key');
  };

  const getIdToken = async () => {
    if (!currentUser) return undefined;
    return await currentUser.getIdToken();
  };

  const isAdmin = Boolean(
    adminKey ||
    userProfile?.role === 'admin' ||
    (currentUser?.email && currentUser.email === 'kpp66973@gmail.com')
  );

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        userProfile,
        loading,
        isAdmin,
        adminKey,
        signInWithGoogle,
        signOut,
        loginWithAdminKey,
        logoutAdmin,
        getIdToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
