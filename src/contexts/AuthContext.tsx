import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabaseClient';
import { useNavigate } from 'react-router-dom';

type AuthContextType = {
  user: User | null;
  loading: boolean;
  profileComplete: boolean;
  signOut: () => Promise<void>;
  refreshProfileStatus: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [profileComplete, setProfileComplete] = useState(false);

  useEffect(() => {
    // Get initial session with error handling
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting initial session:', error);
          setUser(null);
          setProfileComplete(false);
          setLoading(false);
          return;
        }

        setUser(session?.user ?? null);
        if (session?.user) {
          checkProfileComplete(session.user);
        } else {
          setLoading(false);
        }
      } catch (error) {
        console.error('Unexpected error getting initial session:', error);
        setUser(null);
        setProfileComplete(false);
        setLoading(false);
      }
    };

    getInitialSession();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        checkProfileComplete(session.user);
      } else {
        setProfileComplete(false);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkProfileComplete = async (user: User) => {
    try {
      // Method 1: Check user metadata (fastest, no database query needed)
      const userMetadata = user.user_metadata;
      const appMetadata = user.app_metadata;
      
      // Check if user has completed onboarding flag in metadata
      if (userMetadata?.profile_complete === true || appMetadata?.profile_complete === true) {
        setProfileComplete(true);
        setLoading(false);
        return;
      }

      // Method 2: Check user creation time vs last sign in (indicates returning user)
      const createdAt = new Date(user.created_at);
      const lastSignIn = user.last_sign_in_at ? new Date(user.last_sign_in_at) : null;
      
      // If user was created more than 5 minutes ago and has signed in before, 
      // they're likely a returning user
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
      const isReturningUser = createdAt < fiveMinutesAgo && lastSignIn && lastSignIn > createdAt;

      if (isReturningUser) {
        // For returning users, do a lightweight database check
        const { data, error } = await supabase
          .from('profiles')
          .select('first_name')
          .eq('id', user.id)
          .maybeSingle();

        if (error) {
          console.error('Error checking profile:', error);
          
          // Check if the error is due to an invalid session
          if (error.message?.includes('session_not_found') || 
              (error as any)?.status === 403 ||
              error.message?.includes('JWT')) {
            await supabase.auth.signOut();
            setProfileComplete(false);
            setUser(null);
            window.location.href = '/';
            return;
          }
          
          setProfileComplete(false);
        } else {
          // If profile exists and has first_name, consider it complete
          const isComplete = !!(data?.first_name);
          setProfileComplete(isComplete);
          
          // Update user metadata for future quick checks
          if (isComplete) {
            await supabase.auth.updateUser({
              data: { profile_complete: true }
            });
          }
        }
      } else {
        // For new users (created recently), assume profile is not complete
        setProfileComplete(false);
      }
    } catch (error: any) {
      console.error('Error checking profile completion:', error);
      
      // Check if the error is due to an invalid session
      if (error?.message?.includes('session_not_found') || 
          error?.status === 403 ||
          error?.message?.includes('JWT')) {
        await supabase.auth.signOut();
        setProfileComplete(false);
        setUser(null);
        window.location.href = '/';
        return;
      }
      
      setProfileComplete(false);
    } finally {
      setLoading(false);
    }
  };

  const refreshProfileStatus = async () => {
    if (user) {
      await checkProfileComplete(user);
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setProfileComplete(false);
    // Redirect to landing page after sign out
    window.location.href = '/';
  };

  return (
    <AuthContext.Provider value={{ user, loading, profileComplete, signOut, refreshProfileStatus }}>
      {children}
    </AuthContext.Provider>
  );
};