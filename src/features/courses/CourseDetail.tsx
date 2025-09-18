import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';
import { useSEO } from '../../hooks/useSEO';
import { fetchJourneyPath } from '../../lib/sanityClient';
import { supabase } from '../../lib/supabaseClient';
import type { JourneyPath, Module, Lesson } from '../../types/journey';
import { 
  AlertCircle, 
  BookOpen, 
  Clock, 
  Star, 
  Users, 
  CheckCircle, 
  Lock, 
  PlayCircle, 
  FileText, 
  HelpCircle, 
  ChevronRight, 
  ChevronDown, 
  ChevronUp,
  BarChart, 
  AlignCenterVertical as Certificate, 
  GraduationCap, 
  ArrowRight, 
  Award, 
  Lightbulb, 
  Target,
  ArrowLeft
} from 'lucide-react';
import { PortableText } from '@portabletext/react';
import { useQuery } from '@tanstack/react-query';

const CourseDetail = () => {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const { slug } = useParams();
  const [activeTab, setActiveTab] = useState<'overview' | 'curriculum' | 'reviews'>('curriculum');
  const [expandedModule, setExpandedModule] = useState<string | null>(null);
  const [progress, setProgress] = useState<Record<string, boolean>>({});
  const [overallProgress, setOverallProgress] = useState(0);

  // SEO optimization
  useSEO({
    title: path?.title ? `${path.title} - Course Details` : 'Course Details',
    description: path?.description ? 
      (Array.isArray(path.description) ? 
        path.description[0]?.children?.[0]?.text || 'Learn essential skills for life in America' :
        'Learn essential skills for life in America') :
      'Comprehensive course designed for immigrants to succeed in America',
    keywords: ['immigration course', 'financial education', 'life skills', 'U.S. immigrants'],
    breadcrumbs: [
      { name: 'Home', url: '/' },
      { name: 'Dashboard', url: '/dashboard' },
      { name: 'Journey Hub', url: '/journey' },
      { name: path?.title || 'Course', url: `/courses/${slug}` }
    ]
  });

  // Update the query to explicitly request all module fields and lessons for progress calculation
  const { data: path, isLoading, error } = useQuery({
    queryKey: ['journeyPath', slug],
    queryFn: async () => {
      const data = await fetchJourneyPath(slug || '');
      // Ensure modules and lessons are sorted right after fetching for reliable navigation
      if (data && data.modules) {
        data.modules.sort((a, b) => (a.order || 0) - (b.order || 0));
        data.modules.forEach(module => {
          if (module.lessons) {
            module.lessons.sort((a, b) => (a.order || 0) - (b.order || 0));
          }
        });
      }
      return data;
    },
    enabled: !!slug,
  });

  useEffect(() => {
    if (path) {
      loadProgress(path);
    }
  }, [path]);

  const loadProgress = async (journeyPath: JourneyPath) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const lessonIds = (journeyPath.modules || [])
        .flatMap(module => (module.lessons || []))
        .map(lesson => lesson._id)
        .filter(Boolean);

      if (lessonIds.length === 0) {
          setOverallProgress(0);
          return;
      }

      const { data: progressData, error: progressError } = await supabase
        .from('course_progress')
        .select('lesson_id, completed')
        .eq('user_id', user.id)
        .in('lesson_id', lessonIds);

      if (progressError) throw progressError;

      const progressMap = (progressData || []).reduce((acc: Record<string, boolean>, curr) => {
        acc[curr.lesson_id] = curr.completed;
        return acc;
      }, {} as Record<string, boolean>);

      setProgress(progressMap);

      const totalLessons = lessonIds.length;
      const completedLessons = progressData?.filter(p => p.completed).length || 0;
      setOverallProgress(totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0);
    } catch (error) {
      console.error('Error loading progress:', error);
    }
  };

  // Function to handle "Start Learning" / "Continue Learning" button click
  const handleStartContinueLearning = () => {
      if (!path || !slug) return;

      let targetLessonSlug: string | null = null;

      // Find the first uncompleted lesson
      const sortedModules = [...path.modules].sort((a, b) => (a.order || 0) - (b.order || 0));

      for (const module of sortedModules) {
          const sortedLessons = module.lessons ? [...module.lessons].sort((a, b) => (a.order || 0) - (b.order || 0)) : [];
          for (const lessonItem of sortedLessons) {
              if (!progress[lessonItem._id]) { // If this lesson is not completed
                  targetLessonSlug = lessonItem.slug;
                  break; // Found the first uncompleted lesson
              }
          }
          if (targetLessonSlug) break; // If found in this module, stop searching
      }

      // If no uncompleted lesson found, but progress is 0, start from the very first lesson
      if (!targetLessonSlug && overallProgress === 0 && sortedModules.length > 0 && sortedModules[0].lessons && sortedModules[0].lessons.length > 0) {
          targetLessonSlug = sortedModules[0].lessons[0].slug;
      }

      // If all lessons are completed, or course has no lessons, navigate back to the course overview
      if (!targetLessonSlug) {
          navigate(`/courses/${path.slug}`);
      } else {
          navigate(`/courses/${path.slug}/lessons/${targetLessonSlug}`);
      }
  };

  // Get module completion status
  const getModuleProgress = (module: Module) => {
    if (!module.lessons || module.lessons.length === 0) return 0;
    
    const completedLessons = module.lessons.filter(lesson => progress[lesson._id]).length;
    return Math.round((completedLessons / module.lessons.length) * 100);
  };

  // Get module status
  const getModuleStatus = (module: Module) => {
    const moduleProgress = getModuleProgress(module);
    
    if (moduleProgress === 100) return 'completed';
    if (moduleProgress > 0) return 'in-progress';
    
    // Check if previous module is completed or in progress
    const moduleIndex = path?.modules.findIndex(m => m._id === module._id) || 0;
    if (moduleIndex === 0) return 'available'; // First module is always available
    
    const prevModule = path?.modules[moduleIndex - 1];
    if (!prevModule) return 'available';
    
    const prevModuleProgress = getModuleProgress(prevModule);
    return prevModuleProgress > 0 ? 'available' : 'locked';
  };

  // Get icon for module
  const getModuleIcon = (moduleIndex: number) => {
    const icons = [BookOpen, Target, Award, Lightbulb, Certificate, Users, FileText, PlayCircle];
    return icons[moduleIndex % icons.length];
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !path) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-800 mb-2">
          {error instanceof Error ? error.message : 'No journey paths found'}
        </h2>
        <p className="text-gray-600">Please try again later</p>
      </div>
    );
  }

  // Sort modules by order before rendering
  const sortedModules = [...path.modules].sort((a, b) => (a.order || 0) - (b.order || 0));

  return (
    <div className="pb-16 md:pb-0">
      {/* Course Header - Mobile Optimized */}
      <div className="relative bg-gradient-to-r from-blue-600 to-blue-700 text-white">
        <div className="px-4 py-6 md:py-8">
          {/* Desktop Back Button */}
          <button
            onClick={() => navigate('/journey')}
            className="hidden md:flex items-center text-blue-100 hover:text-white mb-4"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            {language === 'en' ? 'Back to Journey Hub' : 'ခရီးစဉ်စင်တာသို့ ပြန်သွားရန်'}
          </button>
          
          <div className="max-w-3xl">
            <h1 className="text-2xl md:text-3xl font-bold mb-3">{path.title}</h1>
            <div className="text-base md:text-xl text-blue-100 mb-4">
              <PortableText value={Array.isArray(path.description) ? path.description : [path.description]} />
            </div>
            
            <div className="flex flex-wrap gap-3 text-sm text-white mb-4">
              <div className="flex items-center bg-white/10 px-3 py-1 rounded-full">
                <Clock className="h-4 w-4 mr-1" />
                <span>{path.duration}</span>
              </div>
              <div className="flex items-center bg-white/10 px-3 py-1 rounded-full">
                <GraduationCap className="h-4 w-4 mr-1" />
                <span>{path.level}</span>
              </div>
              {path.rating && (
                <div className="flex items-center bg-white/10 px-3 py-1 rounded-full">
                  <Star className="h-4 w-4 text-yellow-300 mr-1" />
                  <span>{path.rating}</span>
                </div>
              )}
            </div>

            {overallProgress > 0 && (
              <div className="mb-4">
                <div className="w-full bg-white/20 rounded-full h-2">
                  <div 
                    className="bg-white h-2 rounded-full transition-all duration-300"
                    style={{ width: `${overallProgress}%` }}
                  />
                </div>
                <p className="text-white/90 mt-2 text-sm">
                  {overallProgress}% {language === 'en' ? 'Complete' : 'ပြီးဆုံး'}
                </p>
              </div>
            )}

            {/* Main "Start/Continue Learning" button */}
            <button
                onClick={handleStartContinueLearning}
                className="w-full md:w-auto flex items-center justify-center mt-2 px-6 py-3 rounded-lg font-semibold text-white bg-white/20 hover:bg-white/30 transition-colors"
            >
                {overallProgress === 0 ? (
                    <>
                        {language === 'en' ? 'Start Learning' : 'စတင်လေ့လာရန်'}
                        <ArrowRight className="h-5 w-5 ml-2" />
                    </>
                ) : (
                    <>
                        {language === 'en' ? 'Continue Learning' : 'ဆက်လက်လေ့လာရန်'}
                        <ArrowRight className="h-5 w-5 ml-2" />
                    </>
                )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Tab Navigation */}
      <div className="md:hidden border-b border-gray-200 bg-white">
        <div className="flex">
          {(['overview', 'curriculum', 'reviews'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-3 text-sm font-medium ${
                activeTab === tab
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500'
              }`}
            >
              {language === 'en' 
                ? tab.charAt(0).toUpperCase() + tab.slice(1)
                : tab === 'overview' 
                  ? 'အကျဉ်းချုပ်' 
                  : tab === 'curriculum'
                    ? 'သင်ရိုးညွှန်းတမ်း'
                    : 'သုံးသပ်ချက်များ'}
            </button>
          ))}
        </div>
      </div>

      {/* Desktop Tab Navigation - Hidden on Mobile */}
      <div className="hidden md:block border-b border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <nav className="flex space-x-8">
            {(['overview', 'curriculum', 'reviews'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {language === 'en' 
                  ? tab.charAt(0).toUpperCase() + tab.slice(1)
                  : tab === 'overview' 
                    ? 'အကျဉ်းချုပ်' 
                    : tab === 'curriculum'
                      ? 'သင်ရိုးညွှန်းတမ်း'
                      : 'သုံးသပ်ချက်များ'}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content - Mobile First */}
      <div className="px-4 py-6 md:px-8 md:py-8 max-w-7xl mx-auto">
        <div className="md:grid md:grid-cols-3 md:gap-8">
          {/* Main Column */}
          <div className="md:col-span-2 space-y-6">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Who This Program Is For*/}
                {path.whoIsItFor && (
                  <div className="bg-white rounded-lg border border-gray-200 p-5">
                    <h2 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                      <Users className="h-5 w-5 text-blue-600 mr-2" />
                      {language === 'en' ? 'Who This Program Is For' : 'ဘယ်သူတွေတက်သင့်လဲ'}
                    </h2>
                    <div className="prose max-w-none text-gray-600 text-sm">
                      <PortableText value={Array.isArray(path.whoIsItFor) ? path.whoIsItFor : [path.whoIsItFor]} />
                    </div>
                  </div>
                )}
                
                {/* How This Journey Path Will Help You*/}
                {path.howItHelps && (
                  <div className="bg-white rounded-lg border border-gray-200 p-5">
                    <h2 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                      <BookOpen className="h-5 w-5 text-blue-600 mr-2" />
                      {language === 'en' ? 'How This Journey Path Will Help You' : 'ဒီသင်တန်းလမ်းကြောင်းက သင့်ကို ဘယ်လိုအကျိုးပြုမှာလဲ'}
                    </h2>
                    <div className="prose max-w-none text-gray-600 text-sm">
                      <PortableText value={Array.isArray(path.howItHelps) ? path.howItHelps : [path.howItHelps]} />
                    </div>
                  </div>
                )}
                
                {/* What You'll Learn */}
                {path.objectives && (
                  <div className="bg-white rounded-lg border border-gray-200 p-5">
                    <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                      <GraduationCap className="h-5 w-5 text-blue-600 mr-2" />
                      {language === 'en' ? "What You'll Learn" : 'သင်လေ့လာရမည့်အရာများ'}
                    </h2>
                    <div className="prose max-w-none text-gray-600 text-sm">
                      <PortableText value={Array.isArray(path.objectives) ? path.objectives : [path.objectives]} />
                    </div>
                  </div>
                )}
                
                {/* Practical Applications */}
                {path.practicalApplications && (
                  <div className="bg-white rounded-lg border border-gray-200 p-5">
                    <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                      <Target className="h-5 w-5 text-blue-600 mr-2" />
                      {language === 'en' ? "Practical Applications" : 'လက်တွေ့အသုံးချမှုများ'}
                    </h2>
                    <div className="prose max-w-none text-gray-600 text-sm">
                      <PortableText value={Array.isArray(path.practicalApplications) ? path.practicalApplications : [path.practicalApplications]} />
                    </div>
                  </div>
                )}

                {/* Completion Criteria */}
                {path.completionCriteria && path.completionCriteria.length > 0 && (
                  <div className="bg-white rounded-lg border border-gray-200 p-5">
                    <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                      <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                      {language === 'en' ? "Completion Criteria" : 'ပြီးဆုံးရန် စံနှုန်းများ'}
                    </h2>
                    <ul className="space-y-2 text-gray-600 text-sm">
                      {path.completionCriteria.map((criteria, index) => (
                        <li key={index} className="flex items-start">
                          <CheckCircle className="h-4 w-4 text-green-500 mt-1 mr-2 flex-shrink-0" />
                          <span>{criteria}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'curriculum' && (
              <div className="space-y-4">
                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                  <div className="p-4 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-800">
                      {language === 'en' ? 'Your New Life Roadmap' : 'သင့်ဘဝသစ်လမ်းပြမြေပုံ'}
                    </h2>
                    <p className="text-sm text-gray-600">
                      {language === 'en'
                        ? `${path.modules.length || 0} modules • ${path.duration}`
                        : `${path.modules.length || 0} ပိုင်း • ${path.duration}`}
                    </p>
                  </div>

                  {/* Enhanced Module List with Visual Journey Path - Mobile First */}
                  <div className="relative">
                    {/* Vertical connecting line */}
                    <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200 z-0"></div>
                    
                    {sortedModules.map((module, moduleIndex) => {
                      const moduleProgress = getModuleProgress(module);
                      const moduleStatus = getModuleStatus(module);
                      const ModuleIcon = getModuleIcon(moduleIndex);
                      
                      return (
                        <div key={module._id} className="relative z-10">
                          <button
                            onClick={() => setExpandedModule(expandedModule === module._id ? null : module._id)}
                            className={`w-full text-left p-4 hover:bg-gray-50 transition-colors ${
                              expandedModule === module._id ? 'bg-gray-50' : ''
                            }`}
                            disabled={moduleStatus === 'locked'}
                          >
                            <div className="flex items-start">
                              {/* Module icon with status indicator */}
                              <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center z-10 ${
                                moduleStatus === 'completed' ? 'bg-green-100' : 
                                moduleStatus === 'in-progress' ? 'bg-blue-100' :
                                moduleStatus === 'available' ? 'bg-gray-100' : 'bg-gray-100 opacity-50'
                              }`}>
                                {moduleStatus === 'completed' ? (
                                  <CheckCircle className="h-6 w-6 text-green-600" />
                                ) : (
                                  <ModuleIcon className={`h-6 w-6 ${
                                    moduleStatus === 'in-progress' ? 'text-blue-600' :
                                    moduleStatus === 'available' ? 'text-gray-600' : 'text-gray-400'
                                  }`} />
                                )}
                              </div>
                              
                              <div className="ml-3 flex-grow">
                                <div className="flex items-center">
                                  <div>
                                    <h3 className={`font-medium ${
                                      moduleStatus === 'locked' ? 'text-gray-400' : 'text-gray-800'
                                    }`}>
                                      {`${moduleIndex + 1}. ${module.title}`}
                                    </h3>
                                    
                                    {module.description && (
                                      <div className={`text-sm mt-1 ${
                                        moduleStatus === 'locked' ? 'text-gray-400' : 'text-gray-600'
                                      }`}>
                                        {typeof module.description === 'string' ? (
                                          <p>{module.description}</p>
                                        ) : (
                                          <PortableText value={Array.isArray(module.description) ? module.description : [module.description]} />
                                        )}
                                      </div>
                                    )}
                                    
                                    <div className="flex items-center mt-2 text-xs">
                                      <Clock className={`h-3.5 w-3.5 mr-1 ${
                                        moduleStatus === 'locked' ? 'text-gray-400' : 'text-gray-500'
                                      }`} />
                                      <span className={moduleStatus === 'locked' ? 'text-gray-400' : 'text-gray-500'}>
                                        {module.duration}
                                      </span>
                                      
                                      {moduleStatus === 'in-progress' && (
                                        <span className="ml-2 px-1.5 py-0.5 bg-blue-100 text-blue-800 rounded-full text-xs">
                                          {language === 'en' ? 'In Progress' : 'လုပ်ဆောင်နေဆဲ'}
                                        </span>
                                      )}
                                      
                                      {moduleStatus === 'completed' && (
                                        <span className="ml-2 px-1.5 py-0.5 bg-green-100 text-green-800 rounded-full text-xs">
                                          {language === 'en' ? 'Completed' : 'ပြီးဆုံး'}
                                        </span>
                                      )}
                                      
                                      {moduleStatus === 'locked' && (
                                        <span className="ml-2 px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs flex items-center">
                                          <Lock className="h-3 w-3 mr-1" />
                                          {language === 'en' ? 'Locked' : 'လော့ခ်ချထားသည်'}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                  
                                  {/* Expand/Collapse indicator */}
                                  {moduleStatus !== 'locked' && (
                                    <div className="flex items-center">
                                      {expandedModule === module._id ? (
                                        <ChevronUp className="h-5 w-5 text-gray-400" />
                                      ) : (
                                        <ChevronDown className="h-5 w-5 text-gray-400" />
                                      )}
                                    </div>
                                  )}
                                </div>
                                
                                {/* Progress bar for the module */}
                                {moduleStatus !== 'locked' && (
                                  <div className="w-full bg-gray-200 rounded-full h-1 mt-2">
                                    <div 
                                      className={`h-1 rounded-full ${
                                        moduleStatus === 'completed' ? 'bg-green-600' : 'bg-blue-600'
                                      }`}
                                      style={{ width: `${moduleProgress}%` }}
                                    />
                                  </div>
                                )}
                              </div>
                            </div>
                          </button>

                          {expandedModule === module._id && module.lessons && (
                            <div className="pl-12 pr-4 pb-4 space-y-1">
                              {module.lessons.map((lesson, lessonIndex) => (
                                <button
                                  key={lesson._id}
                                  onClick={() => navigate(`/courses/${path.slug}/lessons/${lesson.slug}`)}
                                  className={`w-full text-left p-2 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-between ${
                                    moduleStatus === 'locked' ? 'cursor-not-allowed opacity-50' : ''
                                  }`}
                                  disabled={moduleStatus === 'locked'}
                                >
                                  <div className="flex items-center">
                                    {progress[lesson._id] ? (
                                      <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center mr-3">
                                        <CheckCircle className="h-3 w-3 text-white" />
                                      </div>
                                    ) : (
                                      <div className="w-5 h-5 rounded-full border-2 border-gray-300 flex items-center justify-center mr-3">
                                        <span className="text-xs text-gray-500">{lessonIndex + 1}</span>
                                      </div>
                                    )}
                                    <div>
                                      <span className={`text-sm ${moduleStatus === 'locked' ? 'text-gray-400' : 'text-gray-700'}`}>
                                        {lesson.title}
                                      </span>
                                      {lesson.duration && (
                                        <div className="flex items-center text-xs text-gray-500 mt-0.5">
                                          <Clock className="h-3 w-3 mr-1" />
                                          <span>{lesson.duration}</span>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                  
                                  {/* Lesson type indicator */}
                                  <div className="flex items-center">
                                    {lesson.type === 'video' && <PlayCircle className="h-4 w-4 text-gray-400 mr-1" />}
                                    {lesson.type === 'quiz' && <FileText className="h-4 w-4 text-gray-400 mr-1" />}
                                    {lesson.type === 'exercise' && <Target className="h-4 w-4 text-gray-400 mr-1" />}
                                    <ChevronRight className="h-4 w-4 text-gray-400" />
                                  </div>
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="bg-white rounded-lg border border-gray-200 p-5">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">
                  {language === 'en' ? 'Student Reviews' : 'ကျောင်းသားများ၏ သုံးသပ်ချက်များ'}
                </h2>
                <div className="text-center py-10">
                  <HelpCircle className="h-10 w-10 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600">
                    {language === 'en'
                      ? 'Reviews coming soon'
                      : 'သုံးသပ်ချက်များ မကြာမီ ရောက်ရှိလာမည်'}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar - Hidden on Mobile, Shown on Desktop */}
          <div className="hidden md:block space-y-6">
            {/* Quick Stats */}
            <div className="bg-white rounded-lg border border-gray-200 p-5">
              <h3 className="font-semibold text-gray-800 mb-4">
                {language === 'en' ? 'Course Features' : 'သင်တန်းအင်္ဂါရပ်များ'}
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">{language === 'en' ? 'Level' : 'အဆင့်'}</span>
                  <span className="font-medium text-gray-800">{path.level}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">{language === 'en' ? 'Duration' : 'ကြာချိန်'}</span>
                  <span className="font-medium text-gray-800">{path.duration}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-600">{language === 'en' ? 'Modules' : 'အပိုင်းများ'}</span>
                  <span className="font-medium text-gray-800">{sortedModules.length}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">{language === 'en' ? 'Language' : 'ဘာသာစကား'}</span>
                  <span className="font-medium text-gray-800">
                    {language === 'en' ? 'English/Burmese' : 'အင်္ဂလိပ်/မြန်မာ'}
                  </span>
                </div>
              </div>
            </div>

            {/* Certificate Preview */}
            <div className="bg-white rounded-lg border border-gray-200 p-5">
              <div className="flex items-center mb-3">
                <Certificate className="h-5 w-5 text-blue-600 mr-2" />
                <h3 className="font-semibold text-gray-800">
                  {language === 'en' ? 'Certificate Included' : 'အသိအမှတ်ပြုလက်မှတ် ပါဝင်သည်'}
                </h3>
              </div>
              <p className="text-sm text-gray-600">
                {language === 'en'
                  ? 'Earn a certificate of completion when you finish this course'
                  : 'ဤသင်တန်းပြီးဆုံးသောအခါ ပြီးမြောက်ကြောင်း အသိအမှတ်ပြုလက်မှတ် ရရှိမည်'}
              </p>
            </div>

            {/* Help Card */}
            <div className="bg-blue-50 rounded-lg border border-blue-200 p-5">
              <div className="flex items-center mb-3">
                <HelpCircle className="h-5 w-5 text-blue-600 mr-2" />
                <h3 className="font-semibold text-blue-800">
                  {language === 'en' ? 'Need Help?' : 'အကူအညီလိုပါသလား။'}
                </h3>
              </div>
              <p className="text-sm text-blue-700 mb-4">
                {language === 'en'
                  ? 'Our support team is here to help you with any questions about the course.'
                  : 'သင်တန်းနှင့်ပတ်သက်သော မေးခွန်းများအတွက် ကျွန်ုပ်တို့၏ အကူအညီပေးရေးအဖွဲ့က ကူညီပေးရန် အသင့်ရှိပါသည်။ '}
              </p>
              <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center text-sm">
                <BookOpen className="h-4 w-4 mr-2" />
                {language === 'en' ? 'View Course Guide' : 'သင်တန်းလမ်းညွှန် ကြည့်ရှုရန်'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDetail;