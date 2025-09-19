import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useNavigate } from 'react-router-dom';
import { useSEO } from '../hooks/useSEO';
import { useStripe } from '../hooks/useStripe';
import { fetchJourneyPaths } from '../lib/sanityClient';
import { supabase } from '../lib/supabaseClient';
import { useUserType } from '../hooks/useUserType';
import type { JourneyPath } from '../types/journey';
import { AlertCircle, Filter } from 'lucide-react';
import { CourseCard } from '../features/journey-hub';
import { useQuery } from '@tanstack/react-query';
import { AdvancedFilters } from '../components/ui';
import { FilteredContentDisplay } from '../features/journey-hub';
import { UserTypeDebugPanel, ContentValidationTest } from '../components/ui';

const JourneyHub = () => {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const { subscribeToPlan } = useStripe();
  const { userType, loading: userTypeLoading } = useUserType();
  const [progress, setProgress] = useState<Record<string, number>>({});
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);

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
    queryKey: ['journeyPaths', userType],
    queryFn: async () => {
      console.log('Fetching journey paths for user type:', userType);
      
      const paths = await fetchJourneyPaths(pathSlugs, userType || undefined);
      
      console.log('Filtered paths received:', paths.length, 'paths');
      
      return paths
        .sort((a, b) => {
          if (a.isPremium === b.isPremium) return 0;
          return a.isPremium ? 1 : -1;
        });
    },
    enabled: !userTypeLoading, // Only run query when user type is loaded
  });

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
      subscribeToPlan('monthly');
      return;
    }
    navigate(`/courses/${path.slug}`);
  };

  if (isLoading || userTypeLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]" role="status" aria-label="Loading personalized journey paths">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" aria-hidden="true"></div>
        <span className="sr-only">Loading personalized content...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12" role="alert">
        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-800 mb-2">
          {error instanceof Error ? error.message : 'Error loading journey paths'}
        </h2>
        <p className="text-gray-600">
          {language === 'en' 
            ? 'Please try again later or contact support'
            : 'နောက်မှ ထပ်မံကြိုးစားပါ သို့မဟုတ် ပံ့ပိုးမှုကို ဆက်သွယ်ပါ'}
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 sm:py-8">
      {/* User Type Debug Info (Development Only) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Debug:</strong> User Type: {userType || 'Not set'} | 
            Showing {paths?.length || 0} available paths
          </p>
        </div>
      )}
      
      <div className="mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div className="mb-4 md:mb-0">
            <h1 className="text-2xl font-bold text-gray-800 mb-2">
              {language === 'en' ? 'Your Personalized Journey' : 'သင့်ကိုယ်ပိုင်ခရီးစဉ်'}
            </h1>
            <p className="text-gray-600">
              {language === 'en'
                ? `Navigate your new life in America with guidance tailored for ${userType === 'immigrant' ? 'immigrants planning to stay long-term' : 'temporary residents'}`
                : `${userType === 'immigrant' ? 'ရေရှည်နေထိုင်ရန်စီစဉ်နေသော ရွှေ့ပြောင်းအခြေချသူများ' : 'ယာယီနေထိုင်သူများ'}အတွက် အဆင့်ဆင့်လမ်းညွှန်မှုဖြင့် အမေရိကန်တွင် သင့်ဘဝသစ်ကို လမ်းညွှန်ပါ`}
            </p>
          </div>
        </div>
      </div>

      {/* Journey Paths Grid */}
      {paths && paths.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 mb-12 sm:mb-16">
          {paths.map((path) => (
            <div key={path._id} className="w-full">
              <CourseCard 
                path={path}
                onPathClick={handlePathClick}
                progress={progress[path._id] || 0}
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            {language === 'en' ? 'No journey paths available' : 'ခရီးစဉ်လမ်းကြောင်းများ မရရှိနိုင်ပါ'}
          </h2>
          <p className="text-gray-600">
            {language === 'en' 
              ? 'Journey paths will appear here once they are published in Sanity'
              : 'Sanity တွင် ထုတ်ဝေပြီးသည်နှင့် ခရီးစဉ်လမ်းကြောင်းများ ဤနေရာတွင် ပေါ်လာမည်'}
          </p>
        </div>
      )}

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
            onClick={() => subscribeToPlan('monthly')}
            className="bg-white text-purple-600 px-6 sm:px-8 py-3 sm:py-4 rounded-lg text-lg font-medium hover:bg-purple-50 transition-colors shadow-md hover:shadow-lg whitespace-nowrap focus-ring min-h-[44px]"
          >
            {language === 'en' ? 'Upgrade Now' : 'ယခု အဆင့်မြှင့်ရန်'}
          </button>
        </div>
      </div>
      
      {/* Debug Tools - Development Only */}
      {process.env.NODE_ENV === 'development' && (
        <>
          <UserTypeDebugPanel />
          <ContentValidationTest />
        </>
      )}
    </div>
  );
};

export default JourneyHub;