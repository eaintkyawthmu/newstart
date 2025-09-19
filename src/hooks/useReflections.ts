import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabaseClient';
import { useToast } from '../contexts/ToastContext';

interface Reflection {
  id: string;
  user_id: string;
  lesson_id: string;
  reflection_text: string;
  created_at: string;
  updated_at: string;
}

interface UseReflectionsReturn {
  reflections: Reflection[];
  loading: boolean;
  error: string | null;
  saveReflection: (lessonId: string, text: string) => Promise<void>;
  getReflection: (lessonId: string) => Reflection | null;
  deleteReflection: (lessonId: string) => Promise<void>;
  refreshReflections: () => Promise<void>;
}

/**
 * Hook to manage user reflections for lessons
 */
export const useReflections = (): UseReflectionsReturn => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [reflections, setReflections] = useState<Reflection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch user's reflections
  const fetchReflections = async () => {
    if (!user) {
      setReflections([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('reflections')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });

      if (fetchError) {
        throw new Error(`Failed to fetch reflections: ${fetchError.message}`);
      }

      setReflections(data || []);
    } catch (err) {
      console.error('Error fetching reflections:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch reflections');
      setReflections([]);
    } finally {
      setLoading(false);
    }
  };

  // Save or update a reflection
  const saveReflection = async (lessonId: string, text: string) => {
    if (!user) {
      throw new Error('User not authenticated');
    }

    if (!text.trim()) {
      throw new Error('Reflection text cannot be empty');
    }

    try {
      setError(null);

      const { data, error: saveError } = await supabase
        .from('reflections')
        .upsert({
          user_id: user.id,
          lesson_id: lessonId,
          reflection_text: text.trim(),
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id,lesson_id'
        })
        .select()
        .single();

      if (saveError) {
        throw new Error(`Failed to save reflection: ${saveError.message}`);
      }

      // Update local state
      setReflections(prev => {
        const existingIndex = prev.findIndex(r => r.lesson_id === lessonId);
        if (existingIndex >= 0) {
          // Update existing reflection
          const updated = [...prev];
          updated[existingIndex] = data;
          return updated;
        } else {
          // Add new reflection
          return [data, ...prev];
        }
      });

      console.log(`Reflection saved for lesson: ${lessonId}`);
    } catch (err) {
      console.error('Error saving reflection:', err);
      setError(err instanceof Error ? err.message : 'Failed to save reflection');
      throw err;
    }
  };

  // Get a specific reflection by lesson ID
  const getReflection = (lessonId: string): Reflection | null => {
    return reflections.find(r => r.lesson_id === lessonId) || null;
  };

  // Delete a reflection
  const deleteReflection = async (lessonId: string) => {
    if (!user) {
      throw new Error('User not authenticated');
    }

    try {
      setError(null);

      const { error: deleteError } = await supabase
        .from('reflections')
        .delete()
        .eq('user_id', user.id)
        .eq('lesson_id', lessonId);

      if (deleteError) {
        throw new Error(`Failed to delete reflection: ${deleteError.message}`);
      }

      // Update local state
      setReflections(prev => prev.filter(r => r.lesson_id !== lessonId));

      console.log(`Reflection deleted for lesson: ${lessonId}`);
    } catch (err) {
      console.error('Error deleting reflection:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete reflection');
      throw err;
    }
  };

  // Refresh reflections from database
  const refreshReflections = async () => {
    await fetchReflections();
  };

  // Fetch reflections when user changes
  useEffect(() => {
    fetchReflections();
  }, [user]);

  return {
    reflections,
    loading,
    error,
    saveReflection,
    getReflection,
    deleteReflection,
    refreshReflections
  };
};

export default useReflections;