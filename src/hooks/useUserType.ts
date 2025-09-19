import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabaseClient';
import { UserType, UserProfile } from '../types/user';

interface UseUserTypeReturn {
  userType: UserType | null;
  userProfile: UserProfile | null;
  loading: boolean;
  error: string | null;
  updateUserType: (newType: UserType) => Promise<void>;
  refreshUserType: () => Promise<void>;
}

/**
 * Hook to manage user type fetching and updating
 * Integrates with the existing profiles table in Supabase
 */
export const useUserType = (): UseUserTypeReturn => {
  const { user } = useAuth();
  const [userType, setUserType] = useState<UserType | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch user type and profile from Supabase
  const fetchUserType = async () => {
    if (!user) {
      setUserType(null);
      setUserProfile(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('profiles')
        .select(`
          id,
          user_type,
          first_name,
          last_name,
          email,
          country_of_origin,
          immigration_year,
          preferred_language,
          zip_code,
          marital_status,
          dependents,
          employment_status,
          life_goals,
          other_goal,
          concerns,
          created_at,
          updated_at
        `)
        .eq('id', user.id)
        .single();

      if (fetchError) {
        throw new Error(`Failed to fetch user profile: ${fetchError.message}`);
      }

      if (data) {
        setUserType(data.user_type as UserType);
        setUserProfile(data as UserProfile);
      } else {
        // Profile doesn't exist yet - this shouldn't happen with proper auth flow
        setUserType(null);
        setUserProfile(null);
      }
    } catch (err) {
      console.error('Error fetching user type:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch user type');
      setUserType(null);
      setUserProfile(null);
    } finally {
      setLoading(false);
    }
  };

  // Update user type in Supabase
  const updateUserType = async (newType: UserType) => {
    if (!user) {
      throw new Error('User not authenticated');
    }

    try {
      setError(null);

      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          user_type: newType,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (updateError) {
        throw new Error(`Failed to update user type: ${updateError.message}`);
      }

      // Update local state
      setUserType(newType);
      if (userProfile) {
        setUserProfile({
          ...userProfile,
          user_type: newType,
          updated_at: new Date().toISOString()
        });
      }

      console.log(`User type updated to: ${newType}`);
    } catch (err) {
      console.error('Error updating user type:', err);
      setError(err instanceof Error ? err.message : 'Failed to update user type');
      throw err;
    }
  };

  // Refresh user type data
  const refreshUserType = async () => {
    await fetchUserType();
  };

  // Fetch user type when user changes
  useEffect(() => {
    fetchUserType();
  }, [user]);

  return {
    userType,
    userProfile,
    loading,
    error,
    updateUserType,
    refreshUserType
  };
};

export default useUserType;