import React, { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc, onSnapshot } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { UserProfile, BiometricCredential } from '../types/domain';
import { SyncService } from '../services/SyncService';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  isLoading: boolean;
  isBiometricVerified: boolean;
  setIsBiometricVerified: (val: boolean) => void;
  bypassAuth: (profile: UserProfile, biometricPassed?: boolean) => void;
  logout: () => void;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  registerBiometricCredential: (credential: BiometricCredential) => Promise<void>;
  removeBiometricCredential: (credentialId: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  isLoading: true,
  isBiometricVerified: false,
  setIsBiometricVerified: () => {},
  bypassAuth: () => {},
  logout: () => {},
  updateProfile: async () => {},
  registerBiometricCredential: async () => {},
  removeBiometricCredential: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isBiometricVerified, setIsBiometricVerified] = useState(false);

  // Persistence Key
  const PERSIST_KEY = 'gula_user_profile';

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!profile || !user) return;
    
    const newProfile = { ...profile, ...updates };
    setProfile(newProfile);
    localStorage.setItem(PERSIST_KEY, JSON.stringify(newProfile));

    if (navigator.onLine) {
      // Direct update
      try {
        const { doc, updateDoc, serverTimestamp } = await import('firebase/firestore');
        await updateDoc(doc(db, 'users', user.uid), {
          ...updates,
          updatedAt: serverTimestamp()
        });
      } catch (err) {
        console.error("Failed to update profile online, queuing...", err);
        SyncService.enqueue('UPDATE_PROFILE', { uid: user.uid, ...updates });
      }
    } else {
      SyncService.enqueue('UPDATE_PROFILE', { uid: user.uid, ...updates });
    }
  };

  const registerBiometricCredential = async (credential: BiometricCredential) => {
    if (!profile) return;
    const existing = profile.biometricCredentials || [];
    const updated = [...existing.filter(c => c.credentialId !== credential.credentialId), credential];
    await updateProfile({
      biometricCredentials: updated,
      isBiometricEnrolled: true
    });
  };

  const removeBiometricCredential = async (credentialId: string) => {
    if (!profile) return;
    const existing = profile.biometricCredentials || [];
    const updated = existing.filter(c => c.credentialId !== credentialId);
    await updateProfile({
      biometricCredentials: updated,
      isBiometricEnrolled: updated.length > 0
    });
  };

  const bypassAuth = (mockProfile: UserProfile, biometricPassed = false) => {
    setProfile(mockProfile);
    setUser({ uid: mockProfile.uid, email: mockProfile.email } as User);
    setIsBiometricVerified(biometricPassed);
    setIsLoading(false);
    localStorage.setItem(PERSIST_KEY, JSON.stringify(mockProfile));
  };

  const logout = () => {
    auth.signOut();
    setUser(null);
    setProfile(null);
    setIsBiometricVerified(false);
    localStorage.removeItem(PERSIST_KEY);
    localStorage.removeItem('gula_demo_user');
  };

  useEffect(() => {
    // Initial sync check
    if (navigator.onLine) {
      SyncService.processQueue();
    }

    // Load persisted profile early for immediate UX
    const saved = localStorage.getItem(PERSIST_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      setProfile(parsed);
      // We still wait for onAuthStateChanged to confirm actual login state
    }

    let unsubProfile: (() => void) | null = null;

    const unsubscribe = onAuthStateChanged(auth, async (currUser) => {
      setUser(currUser);
      
      if (unsubProfile) {
        unsubProfile();
        unsubProfile = null;
      }

      if (currUser) {
        // We have a user, check sync queue
        SyncService.processQueue();

        unsubProfile = onSnapshot(doc(db, 'users', currUser.uid), (docSnap) => {
          if (docSnap.exists()) {
            const data = { uid: docSnap.id, ...docSnap.data() } as UserProfile;
            setProfile(data);
            localStorage.setItem(PERSIST_KEY, JSON.stringify(data));
          }
          setIsLoading(false);
        }, (error) => {
          console.error("Error listening to profile:", error);
          setIsLoading(false);
        });
      } else {
        // If not bypassing and no firebase user, clear everything
        if (!localStorage.getItem('gula_demo_user')) {
          setProfile(null);
          localStorage.removeItem(PERSIST_KEY);
        }
        setIsLoading(false);
      }
    });

    return () => {
      unsubscribe();
      if (unsubProfile) unsubProfile();
    };
  }, []);

  return (
    <AuthContext.Provider value={{
      user,
      profile,
      isLoading,
      isBiometricVerified,
      setIsBiometricVerified,
      bypassAuth,
      logout,
      updateProfile,
      registerBiometricCredential,
      removeBiometricCredential
    }}>
      {children}
    </AuthContext.Provider>
  );
};
