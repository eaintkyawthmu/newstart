import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { supabase } from '../lib/supabaseClient';
import { 
  MessageSquare, 
  Save, 
  Loader2, 
  CheckCircle, 
  AlertCircle,
  Lightbulb,
  Heart,
  Edit3
} from 'lucide-react';
import { PortableText } from '@portabletext/react';

interface ReflectionPromptProps {
  lessonId: string;
  reflectionPrompts?: any[]; // Portable text from Sanity
  className?: string;
}

interface UserReflection {
  id: string;
  reflection_text: string;
  created_at: string;
  updated_at: string;
}

const ReflectionPrompt: React.FC<ReflectionPromptProps> = ({
  lessonId,
  reflectionPrompts,
  className = ''
}) => {
  const { language } = useLanguage();
  const { user } = useAuth();
  const { showToast } = useToast();
  const [reflectionText, setReflectionText] = useState('');
  const [existingReflection, setExistingReflection] = useState<UserReflection | null>(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  useEffect(() => {
    if (user && lessonId) {
      loadExistingReflection();
    }
  }, [user, lessonId]);

  // Auto-save functionality
  useEffect(() => {
    if (hasUnsavedChanges && reflectionText.trim()) {
      const autoSaveTimer = setTimeout(() => {
        handleSave(true); // Silent auto-save
      }, 3000); // Auto-save after 3 seconds of inactivity

      return () => clearTimeout(autoSaveTimer);
    }
  }, [reflectionText, hasUnsavedChanges]);

  const loadExistingReflection = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('reflections')
        .select('*')
        .eq('user_id', user!.id)
        .eq('lesson_id', lessonId)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setExistingReflection(data);
        setReflectionText(data.reflection_text);
        setLastSaved(new Date(data.updated_at));
      }
    } catch (error) {
      console.error('Error loading reflection:', error);
      showToast('error', language === 'en' 
        ? 'Failed to load your previous reflection' 
        : 'သင့်ယခင်ရောင်ပြန်ဟပ်မှုကို တင်ရန် မအောင်မြင်ပါ');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (isAutoSave = false) => {
    if (!user || !reflectionText.trim()) return;

    try {
      setSaving(true);
      
      const { data, error } = await supabase
        .from('reflections')
        .upsert({
          user_id: user.id,
          lesson_id: lessonId,
          reflection_text: reflectionText.trim(),
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id,lesson_id'
        })
        .select()
        .single();

      if (error) throw error;

      setExistingReflection(data);
      setLastSaved(new Date());
      setHasUnsavedChanges(false);

      if (!isAutoSave) {
        showToast('success', language === 'en' 
          ? 'Reflection saved successfully!' 
          : 'ရောင်ပြန်ဟပ်မှုကို အောင်မြင်စွာ သိမ်းဆည်းပါပြီ!');
      }
    } catch (error) {
      console.error('Error saving reflection:', error);
      showToast('error', language === 'en' 
        ? 'Failed to save reflection. Please try again.' 
        : 'ရောင်ပြန်ဟပ်မှုကို သိမ်းဆည်းရန် မအောင်မြင်ပါ။ ထပ်မံကြိုးစားပါ။');
    } finally {
      setSaving(false);
    }
  };

  const handleTextChange = (value: string) => {
    setReflectionText(value);
    setHasUnsavedChanges(true);
  };

  const formatLastSaved = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) {
      return language === 'en' ? 'Just now' : 'ယခုလေးတင်';
    } else if (diffInMinutes < 60) {
      return language === 'en' ? `${diffInMinutes} minutes ago` : `${diffInMinutes} မိနစ်ကြာ`;
    } else if (diffInMinutes < 1440) {
      const hours = Math.floor(diffInMinutes / 60);
      return language === 'en' ? `${hours} hours ago` : `${hours} နာရီကြာ`;
    } else {
      return date.toLocaleDateString();
    }
  };

  // Don't render if no reflection prompts
  if (!reflectionPrompts || reflectionPrompts.length === 0) {
    return null;
  }

  if (loading) {
    return (
      <div className={`bg-amber-50 border border-amber-200 rounded-lg p-4 ${className}`}>
        <div className="flex items-center justify-center">
          <Loader2 className="h-5 w-5 animate-spin text-amber-600 mr-2" />
          <span className="text-amber-700 text-sm">
            {language === 'en' ? 'Loading reflection...' : 'ရောင်ပြန်ဟပ်မှု တင်နေသည်...'}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-amber-50 border border-amber-200 rounded-lg p-4 space-y-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center mb-3">
        <div className="flex items-center">
          <Heart className="h-5 w-5 text-amber-600 mr-2" />
          <h3 className="font-semibold text-amber-800 text-sm">
            {language === 'en' ? 'Reflect & Grow' : 'ပြန်လည်သုံးသပ်ပြီး တိုးတက်ပါ'}
          </h3>
        </div>
        {existingReflection && (
          <div className="ml-auto flex items-center text-xs text-amber-600">
            <CheckCircle className="h-3 w-3 mr-1" />
            <span>
              {language === 'en' ? 'Saved' : 'သိမ်းဆည်းပြီး'}
            </span>
          </div>
        )}
      </div>

      {/* Reflection Prompt from Sanity */}
      <div className="prose prose-sm max-w-none text-amber-700 break-words">
        <PortableText value={reflectionPrompts} />
      </div>

      {/* User Input Area */}
      <div className="space-y-3">
        <div className="relative">
          <label htmlFor={`reflection-${lessonId}`} className="sr-only">
            {language === 'en' ? 'Your reflection' : 'သင့်ရောင်ပြန်ဟပ်မှု'}
          </label>
          <textarea
            id={`reflection-${lessonId}`}
            value={reflectionText}
            onChange={(e) => handleTextChange(e.target.value)}
            placeholder={language === 'en' 
              ? 'Write your thoughts and reflections here...' 
              : 'သင့်အတွေးများနှင့် ရောင်ပြန်ဟပ်မှုများကို ဤနေရာတွင် ရေးပါ...'}
            className="w-full p-3 border border-amber-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent resize-none bg-white text-gray-800 placeholder-gray-500"
            rows={4}
            disabled={saving}
          />
          
          {/* Character count */}
          <div className="absolute bottom-2 right-2 text-xs text-gray-500">
            {reflectionText.length}/1000
          </div>
        </div>

        {/* Save button and status */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {hasUnsavedChanges && (
              <div className="flex items-center text-xs text-amber-600">
                <Edit3 className="h-3 w-3 mr-1" />
                <span>
                  {language === 'en' ? 'Unsaved changes' : 'မသိမ်းဆည်းရသေးသော ပြောင်းလဲမှုများ'}
                </span>
              </div>
            )}
            
            {lastSaved && !hasUnsavedChanges && (
              <div className="flex items-center text-xs text-green-600">
                <CheckCircle className="h-3 w-3 mr-1" />
                <span>
                  {language === 'en' ? 'Saved' : 'သိမ်းဆည်းပြီး'} {formatLastSaved(lastSaved)}
                </span>
              </div>
            )}
          </div>

          <button
            onClick={() => handleSave(false)}
            disabled={saving || !reflectionText.trim() || !hasUnsavedChanges}
            className="flex items-center px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2"
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                {language === 'en' ? 'Saving...' : 'သိမ်းဆည်းနေသည်...'}
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                {language === 'en' ? 'Save Reflection' : 'ရောင်ပြန်ဟပ်မှု သိမ်းဆည်းရန်'}
              </>
            )}
          </button>
        </div>

        {/* Helpful tip */}
        <div className="flex items-start space-x-2 text-xs text-amber-700 bg-amber-100 p-3 rounded-lg">
          <Lightbulb className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
          <p>
            {language === 'en'
              ? 'Take a moment to reflect on what you\'ve learned. Writing down your thoughts helps reinforce the concepts and track your personal growth journey.'
              : 'သင်လေ့လာခဲ့သည့်အရာများကို ပြန်လည်သုံးသပ်ရန် အချိန်အနည်းငယ် ယူပါ။ သင့်အတွေးများကို ရေးသားခြင်းသည် သဘောတရားများကို အားဖြည့်ပေးပြီး သင့်ကိုယ်ပိုင်တိုးတက်မှုခရီးစဉ်ကို ခြေရာခံရန် ကူညီပေးသည်။'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ReflectionPrompt;