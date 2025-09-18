import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useNavigate } from 'react-router-dom';
import { useSEO } from '../hooks/useSEO';
import { fetchJourneyPath } from '../lib/sanityClient';
import { supabase } from '../lib/supabaseClient';
import type { JourneyPath } from '../types/journey';
import { AlertCircle, Filter } from 'lucide-react';
import { CourseCard } from '../features/journey-hub';
import { useQuery } from '@tanstack/react-query';
import { AdvancedFilters } from '../components/ui';

const JourneyHub = () => {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const [progress, setProgress] = useState<Record<string, number>>({});
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [filteredPaths, setFilteredPaths] = useState<JourneyPath[]>([]);

  // SEO optimization
  useSEO({
    title: 'Journey Hub - Immigration Learning Paths',
    description: 'Explore comprehensive learning paths designed specifically for immigrants to navigate life in America successfully.',
    keywords: ['immigration courses', 'learning paths', 'financial education', 'U.S. immigrants'],
    breadcrumbs: [
      { name: 'Home', url: '/' },
      { name: 'Dashboard', url: '/dashboard' },
      { name: 'Journey Hub', url: '/journey' }
    ]
  });

  // Updated path slugs to reflect immigrant journey
  const pathSlugs = [
    'new-to-america',
    'build-credit',
    'housing-utilities',
    'us-taxes',
    'health-insurance',
    'education-family',
    'self-employment'
  ];

  const { data: paths, isLoading, error } = useQuery({
    queryKey: ['journeyPaths'],
    queryFn: async () => {
      const pathPromises = pathSlugs.map(slug => fetchJourneyPath(slug));
      const paths = await Promise.all(pathPromises);
      return paths
        .filter((path): path is JourneyPath => path !== null)
        .sort((a, b) => {
          if (a.isPremium === b.isPremium) return 0;
          return a.isPremium ? 1 : -1;
        });
    },
  });

  useEffect(() => {
    if (paths) {
      setFilteredPaths(paths);
    }
  }, [paths]);

  useEffect(() => {
    if (paths) {
      loadProgress(paths);
    }
  }, [paths]);

  const loadProgress = async (journeyPaths: JourneyPath[]) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const pathLessons = journeyPaths.reduce((acc, path) => {
        acc[path._id] = (path.modules || []).flatMap(module => 
          (module.lessons || []).map(lesson => lesson._id)
        );
        return acc;
      }, {} as Record<string, string[]>);

      const { data: progressData, error: progressError } = await supabase
        .from('course_progress')
        .select('lesson_id, completed')
        .eq('user_id', user.id)
        .in('lesson_id', Object.values(pathLessons).flat());

      if (progressError) throw progressError;

      const pathProgress = journeyPaths.reduce((acc, path) => {
        const pathLessonIds = pathLessons[path._id];
        const completedLessons = progressData?.filter(
          p => pathLessonIds.includes(p.lesson_id) && p.completed
        ).length || 0;
        
        acc[path._id] = pathLessonIds.length > 0 
          ? Math.round((completedLessons / pathLessonIds.length) * 100)
          : 0;
        
        return acc;
      }, {} as Record<string, number>);

      setProgress(pathProgress);
    } catch (error) {
      console.error('Error loading progress:', error);
    }
  };

  const handlePathClick = (path: JourneyPath) => {
    if (path.isPremium) {
      navigate('/subscription');
      return;
    }
    navigate(`/courses/${path.slug}`);
  };

  const filterGroups = [
    {
      id: 'level',
      label: language === 'en' ? 'Difficulty Level' : 'ခက်ခဲမှုအဆင့်',
      type: 'select' as const,
      options: [
        { id: 'beginner', label: language === 'en' ? 'Beginner' : 'အစပိုင်း', value: 'beginner' },
        { id: 'intermediate', label: language === 'en' ? 'Intermediate' : 'အလယ်အလတ်', value: 'intermediate' },
        { id: 'advanced', label: language === 'en' ? 'Advanced' : 'အဆင့်မြင့်', value: 'advanced' }
      ]
    },
    {
      id: 'type',
      label: language === 'en' ? 'Course Type' : 'သင်တန်းအမျိုးအစား',
      type: 'multiselect' as const,
      options: [
        { id: 'free', label: language === 'en' ? 'Free' : 'အခမဲ့', value: 'free' },
        { id: 'premium', label: language === 'en' ? 'Premium' : 'ပရီမီယံ', value: 'premium' }
      ]
    },
    {
      id: 'progress',
      label: language === 'en' ? 'Progress' : 'တိုးတက်မှု',
      type: 'range' as const,
      min: 0,
      max: 100
    }
  ];

  const handleFiltersChange = (filters: Record<string, any>) => {
    if (!paths) return;
    
    let filtered = [...paths];
    
    // Apply level filter
    if (filters.level) {
      filtered = filtered.filter(path => path.level === filters.level);
    }
    
    // Apply type filter
    if (filters.type && filters.type.length > 0) {
      filtered = filtered.filter(path => {
        if (filters.type.includes('free') && !path.isPremium) return true;
        if (filters.type.includes('premium') && path.isPremium) return true;
        return false;
      });
    }
    
    // Apply progress filter
    if (filters.progress) {
      filtered = filtered.filter(path => {
        const pathProgress = progress[path._id] || 0;
        return pathProgress >= (filters.progress.min || 0) && pathProgress <= (filters.progress.max || 100);
      });
    }
    
    setFilteredPaths(filtered);
  };

  const handleResetFilters = () => {
    if (paths) {
      setFilteredPaths(paths);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]" role="status" aria-label="Loading journey paths">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" aria-hidden="true"></div>
        <span className="sr-only">Loading journey paths...</span>
      </div>
    );
  }

  if (error || !paths?.length) {
    return (
      <div className="text-center py-12" role="alert">
        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-800 mb-2">
          {error instanceof Error ? error.message : 'No journey paths found'}
        </h2>
        <p className="text-gray-600">Please try again later</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 sm:py-8">
      <div className="mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div className="mb-4 md:mb-0">
            <h1 className="text-2xl font-bold text-gray-800 mb-2">
              {language === 'en' ? 'Your Immigration Journey' : 'သင့်ရွှေ့ပြောင်းအခြေချမှုခရီးစဉ်'}
            </h1>
            <p className="text-gray-600">
              {language === 'en'
                ? 'Navigate your new life in America with step-by-step guidance tailored for immigrants'
                : 'ရွှေ့ပြောင်းအခြေချသူများအတွက် အဆင့်ဆင့်လမ်းညွှန်မှုဖြင့် အမေရိကန်တွင် သင့်ဘဝသစ်ကို လမ်းညွှန်ပါ'}
            </p>
          </div>
          
          <button
            onClick={() => setIsFiltersOpen(true)}
            className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <Filter className="h-5 w-5 mr-2 text-gray-500" />
            {language === 'en' ? 'Filter Courses' : 'သင်တန်းများ စစ်ထုတ်ရန်'}
          </button>
        </div>
      </div>

      {/* Improved responsive grid layout */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 mb-12 sm:mb-16">
        {filteredPaths.map((path) => (
          <div key={path._id} className="w-full">
            <CourseCard 
              path={path}
              onPathClick={handlePathClick}
              progress={progress[path._id] || 0}
            />
          </div>
        ))}
      </div>

      {/* Premium upgrade section */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl p-6 sm:p-8 text-white shadow-xl">
        <div className="flex flex-col lg:flex-row items-center justify-between">
          <div className="mb-6 lg:mb-0 text-center lg:text-left">
            <h2 className="text-2xl sm:text-3xl font-bold mb-2">
              {language === 'en' ? 'Unlock Premium Content' : 'Premium အကြောင်းအရာများကို လက်လှမ်းမီရန်'}
            </h2>
            <p className="text-lg sm:text-xl text-purple-100">
              {language === 'en'
                ? 'Get access to all premium lessons and expert guidance'
                : 'Premium သင်ခန်းစာအားလုံးနှင့် ကျွမ်းကျင်သူလမ်းညွှန်မှုများကို ရယူပါ'}
            </p>
          </div>
          <button 
            onClick={() => navigate('/subscription')}
            className="bg-white text-purple-600 px-6 sm:px-8 py-3 sm:py-4 rounded-lg text-lg font-medium hover:bg-purple-50 transition-colors shadow-md hover:shadow-lg whitespace-nowrap focus-ring min-h-[44px]"
          >
            {language === 'en' ? 'Upgrade Now' : 'ယခု အဆင့်မြှင့်ရန်'}
          </button>
        </div>
      </div>
      
      {/* Advanced Filters */}
      <AdvancedFilters
        filterGroups={filterGroups}
        onFiltersChange={handleFiltersChange}
        onReset={handleResetFilters}
        isOpen={isFiltersOpen}
        onClose={() => setIsFiltersOpen(false)}
      />
    </div>
  );
};

export default JourneyHub;