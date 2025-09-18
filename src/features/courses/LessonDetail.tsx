import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';
import { useSEO } from '../../hooks/useSEO';
import { sanityClient } from '../../lib/sanityClient';
import { supabase } from '../../lib/supabaseClient';
import { useQuery } from '@tanstack/react-query';
import { useAnalytics } from '../../hooks/useAnalytics';
import { useMilestones } from '../../hooks/useMilestones';
import {
  ArrowLeft,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Award,
  BookOpen,
  PlayCircle,
  FileText,
  Lightbulb,
  Target,
  CheckCircle
} from 'lucide-react';

// Import components
import LessonMilestoneModal from './components/LessonMilestoneModal';
import { LessonPage } from './types/lessonTypes';

const LessonDetail = () => {
  const { pathSlug, lessonSlug } = useParams();
  const navigate = useNavigate();
  const { language } = useLanguage();
  const { trackEvent, trackLessonCompleted } = useAnalytics();
  const { checkAndAwardMilestones } = useMilestones();
  const [completed, setCompleted] = useState(false);
  const [startTime] = useState<Date>(new Date());
  const [currentPage, setCurrentPage] = useState<LessonPage>('intro');
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  
  // Quiz state
  const [userAnswers, setUserAnswers] = useState<any[]>([]);
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizResults, setQuizResults] = useState<any[]>([]);
  const [totalScore, setTotalScore] = useState(0);

  // Task completion state
  const [completedTasks, setCompletedTasks] = useState<string[]>([]);
  const [showMilestoneModal, setShowMilestoneModal] = useState(false);
  const [earnedMilestone, setEarnedMilestone] = useState<string | null>(null);

  // Fetch the entire journey path to get context for navigation
  const { data: path, isLoading: pathLoading } = useQuery({
    queryKey: ['journeyPath', pathSlug],
    queryFn: () => sanityClient.fetch(`
      *[_type == "journeyPath" && slug.current == $pathSlug][0] {
        _id,
        title,
        slug,
        modules[] {
          _id,
          title,
          order,
          lessons[] {
            _id,
            title,
            slug,
            type,
            duration,
            content
          }
        }
      }
    `, { pathSlug }),
    enabled: !!pathSlug
  });

  // Fetch current lesson details with all fields
  const { data: lesson, isLoading: lessonLoading } = useQuery({
    queryKey: ['lesson', lessonSlug],
    queryFn: () => sanityClient.fetch(`
      *[_type == "lesson" && slug.current == $lessonSlug][0] {
        _id,
        title,
        type,
        duration,
        introduction,
        measurableDeliverables[]{
          _key,
          description,
          isOptional
        },
        content,
        keyTakeaways,
        actionableTasks[]{
          _key,
          description,
          isOptional
        },
        lessonResources[]{
          title,
          description,
          resourceType,
          url,
          file{asset->{url}},
          openInNewTab
        },
        reflectionPrompts,
        videoType,
        youtubeVideoId,
        selfHostedVideoUrl,
        "quiz": associatedQuiz->{
          title,
          scenario,
          questions[]{
            questionText,
            questionType,
            options[]{
              text,
              isCorrect
            },
            correctAnswer,
            feedback,
            practicalApplication,
            followUpAction
          },
          actionPlan
        },
        "associatedExercise": associatedExercise->{
          _id,
          title,
          description,
          steps[]{
            instruction,
            expectedOutcome
          },
          estimatedTime,
          difficulty
        },
        "module": parentModule-> {
          _id,
          title,
          order
        }
      }
    `, { lessonSlug }),
    enabled: !!lessonSlug
  });

  // SEO optimization
  useSEO({
    title: lesson?.title ? `${lesson.title} - Lesson` : 'Lesson',
    description: lesson?.introduction ? 
      (Array.isArray(lesson.introduction) ? 
        lesson.introduction[0]?.children?.[0]?.text || 'Learn essential skills for life in America' :
        'Learn essential skills for life in America') :
      'Interactive lesson designed to help immigrants succeed in America',
    keywords: ['immigration lesson', 'financial education', 'life skills', 'interactive learning'],
    breadcrumbs: [
      { name: 'Home', url: '/' },
      { name: 'Dashboard', url: '/dashboard' },
      { name: 'Journey Hub', url: '/journey' },
      { name: path?.title || 'Course', url: `/courses/${pathSlug}` },
      { name: lesson?.title || 'Lesson', url: `/courses/${pathSlug}/lessons/${lessonSlug}` }
    ]
  });

  useEffect(() => {
    if (lesson?._id) {
      loadProgress();
      
      // Initialize quiz state if this is a quiz lesson
      if (lesson.type === 'quiz' && lesson.quiz?.questions && Array.isArray(lesson.quiz.questions)) {
        const initialUserAnswers = lesson.quiz.questions.map((_, index) => ({
          questionIndex: index,
          selectedOptionIndex: undefined,
          trueFalseAnswer: undefined
        }));
        
        setUserAnswers(initialUserAnswers);
      }

      // Reset to intro page when lesson changes
      setCurrentPage('intro');
      
      // Scroll to top when lesson changes
      window.scrollTo(0, 0);
    }
  }, [lesson?._id]);

  const loadProgress = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || !lesson?._id) return;

      const { data: progressData } = await supabase
        .from('course_progress')
        .select('completed, completed_lesson_tasks')
        .eq('user_id', user.id)
        .eq('lesson_id', lesson._id)
        .maybeSingle();

      setCompleted(progressData?.completed || false);
      setCompletedTasks(progressData?.completed_lesson_tasks || []);
    } catch (error) {
      console.error('Error loading progress:', error);
    }
  };

  const handleTaskCompletion = async (taskKey: string, isCompleted: boolean) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || !lesson || !path) return;

      const newCompletedTasks = isCompleted
        ? [...completedTasks, taskKey]
        : completedTasks.filter(key => key !== taskKey);

      setCompletedTasks(newCompletedTasks);

      const { error } = await supabase
        .from('course_progress')
        .upsert({
          user_id: user.id,
          lesson_id: lesson._id,
          course_id: path._id,
          module_id: lesson.module?._id || null,
          completed_lesson_tasks: newCompletedTasks,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id,lesson_id'
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error updating task completion:', error);
      setCompletedTasks(completedTasks);
    }
  };

  const toggleCompletion = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || !lesson || !path) return;

      const allRequiredTasks = [
        ...(lesson.measurableDeliverables || []),
        ...(lesson.actionableTasks || [])
      ].filter(task => !task.isOptional);

      const allRequiredTasksCompleted = allRequiredTasks.every(task =>
        completedTasks.includes(task._key)
      );

      const newStatus = !completed;

      if (!newStatus || allRequiredTasksCompleted) {
        const progressData = {
          user_id: user.id,
          lesson_id: lesson._id,
          course_id: path._id,
          module_id: lesson.module?._id || null,
          completed: newStatus,
          updated_at: new Date().toISOString()
        };

        const { error } = await supabase
          .from('course_progress')
          .upsert(progressData, {
            onConflict: 'user_id,lesson_id'
          });

        if (error) throw error;
        setCompleted(newStatus);
        
        if (newStatus) {
          const timeSpent = Math.floor((new Date().getTime() - startTime.getTime()) / 1000);
          trackLessonCompleted(lesson._id, lesson.title, timeSpent);
          await checkAndAwardMilestones('lesson', lesson._id);
        }
      } else {
        alert(language === 'en' ? 'Please complete all required tasks before marking as complete.' : 'ပြီးဆုံးအဖြစ် မှတ်သားခြင်းမပြုမီ လိုအပ်သော လုပ်ငန်းဆောင်တာများအားလုံးကို ပြီးမြောက်အောင် လုပ်ဆောင်ပါ။');
      }
    } catch (err) {
      console.error('Error updating completion status:', err);
    }
  };

  // Find current, previous, and next lessons
  const findAdjacentLessons = () => {
    if (!path?.modules || !lessonSlug) return { prevLesson: null, nextLesson: null };

    let prevLesson = null;
    let nextLesson = null;
    let foundCurrent = false;

    const sortedModules = [...path.modules].sort((a, b) => (a.order || 0) - (b.order || 0));

    for (const module of sortedModules) {
      if (!module.lessons) continue;

      const sortedLessons = [...module.lessons].sort((a, b) => (a.order || 0) - (b.order || 0));

      for (let i = 0; i < sortedLessons.length; i++) {
        const lesson = sortedLessons[i];
        
        if (lesson.slug === lessonSlug) {
          foundCurrent = true;
          if (i > 0) {
            prevLesson = sortedLessons[i - 1];
          } else {
            const moduleIndex = sortedModules.indexOf(module);
            if (moduleIndex > 0) {
              const prevModule = sortedModules[moduleIndex - 1];
              const prevModuleLessons = prevModule.lessons?.sort((a, b) => (a.order || 0) - (b.order || 0));
              prevLesson = prevModuleLessons?.[prevModuleLessons.length - 1] || null;
            }
          }
          
          if (i < sortedLessons.length - 1) {
            nextLesson = sortedLessons[i + 1];
          } else {
            const moduleIndex = sortedModules.indexOf(module);
            if (moduleIndex < sortedModules.length - 1) {
              const nextModule = sortedModules[moduleIndex + 1];
              const nextModuleLessons = nextModule.lessons?.sort((a, b) => (a.order || 0) - (b.order || 0));
              nextLesson = nextModuleLessons?.[0] || null;
            }
          }
          break;
        }
        
        if (!foundCurrent) {
          prevLesson = lesson;
        }
      }
      
      if (foundCurrent) break;
    }

    return { prevLesson, nextLesson };
  };

  const navigateToLesson = (lessonSlug: string) => {
    if (!pathSlug) return;
    navigate(`/courses/${pathSlug}/lessons/${lessonSlug}`);
  };

  // Get available pages for this lesson
  const getAvailablePages = (): LessonPage[] => {
    const pages: LessonPage[] = [];
    
    pages.push('intro');
    
    if (lesson?.content || lesson?.type === 'video' || lesson?.type === 'exercise') {
      pages.push('content');
    }
    
    if (lesson?.keyTakeaways) {
      pages.push('takeaways');
    }
    
    if ((lesson?.actionableTasks && lesson.actionableTasks.length > 0) || 
        (lesson?.lessonResources && lesson.lessonResources.length > 0)) {
      pages.push('actions');
    }
    
    if (lesson?.type === 'quiz' || lesson?.quiz) {
      pages.push('quiz');
    }
    
    return pages;
  };

  // Handle swipe navigation
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isSwipe = Math.abs(distance) > 50;
    
    if (isSwipe) {
      if (distance > 0) {
        handleNextPage();
      } else {
        handlePrevPage();
      }
    }
    
    setTouchStart(null);
    setTouchEnd(null);
  };

  // Navigation between pages
  const handleNextPage = () => {
    const pages = getAvailablePages();
    const currentIndex = pages.indexOf(currentPage);
    
    if (currentIndex < pages.length - 1) {
      setCurrentPage(pages[currentIndex + 1]);
      scrollToPage(currentIndex + 1);
    }
  };

  const handlePrevPage = () => {
    const pages = getAvailablePages();
    const currentIndex = pages.indexOf(currentPage);
    
    if (currentIndex > 0) {
      setCurrentPage(pages[currentIndex - 1]);
      scrollToPage(currentIndex - 1);
    }
  };

  const goToPage = (page: LessonPage) => {
    const pages = getAvailablePages();
    const pageIndex = pages.indexOf(page);
    setCurrentPage(page);
    scrollToPage(pageIndex);
  };

  const scrollToPage = (pageIndex: number) => {
    if (scrollContainerRef.current) {
      const scrollWidth = scrollContainerRef.current.scrollWidth;
      const containerWidth = scrollContainerRef.current.clientWidth;
      const pages = getAvailablePages();
      const scrollPosition = (scrollWidth / pages.length) * pageIndex;
      
      scrollContainerRef.current.scrollTo({
        left: scrollPosition,
        behavior: 'smooth'
      });
    }
  };

  // Get page icon
  const getPageIcon = (page: LessonPage) => {
    switch (page) {
      case 'intro':
        return <BookOpen className="w-4 h-4" />;
      case 'content':
        return lesson?.type === 'video' 
          ? <PlayCircle className="w-4 h-4" /> 
          : <FileText className="w-4 h-4" />;
      case 'takeaways':
        return <Lightbulb className="w-4 h-4" />;
      case 'actions':
        return <Target className="w-4 h-4" />;
      case 'quiz':
        return <FileText className="w-4 h-4" />;
      default:
        return null;
    }
  };

  // Get page title
  const getPageTitle = (page: LessonPage): string => {
    switch (page) {
      case 'intro':
        return language === 'en' ? 'Introduction' : 'မိတ်ဆက်';
      case 'content':
        return language === 'en' ? 'Content' : 'အကြောင်းအရာ';
      case 'takeaways':
        return language === 'en' ? 'Takeaways' : 'အချက်များ';
      case 'actions':
        return language === 'en' ? 'Actions' : 'လုပ်ဆောင်ရန်';
      case 'quiz':
        return language === 'en' ? 'Quiz' : 'မေးခွန်းတို';
      default:
        return '';
    }
  };

  if (pathLoading || lessonLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!lesson || !path) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            {language === 'en' ? 'Lesson not found' : 'သင်ခန်းစာ မတွေ့ရှိပါ'}
          </h2>
          <button
            onClick={() => navigate(`/courses/${pathSlug}`)}
            className="text-blue-600 hover:text-blue-700 underline"
          >
            {language === 'en' ? 'Return to Course' : 'သင်တန်းသို့ ပြန်သွားရန်'}
          </button>
        </div>
      </div>
    );
  }

  const { prevLesson, nextLesson } = findAdjacentLessons();
  const availablePages = getAvailablePages();
  const currentPageIndex = availablePages.indexOf(currentPage);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-3 py-2 flex items-center justify-between sticky top-0 z-40">
        <button
          onClick={() => navigate(`/courses/${pathSlug}`)}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
          aria-label={language === 'en' ? 'Go back to course' : 'သင်တန်းသို့ ပြန်သွားရန်'}
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        
        <div className="flex-1 text-center px-2">
          <h1 className="text-sm font-semibold text-gray-900 truncate">
            {lesson.title}
          </h1>
          <p className="text-xs text-gray-500">
            {lesson.duration} • {getPageTitle(currentPage)}
          </p>
        </div>
        
        <button
          onClick={toggleCompletion}
          className={`p-2 rounded-lg transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center ${
            completed
              ? 'text-green-600 bg-green-50'
              : 'text-gray-400 hover:bg-gray-100'
          }`}
          aria-label={completed 
            ? (language === 'en' ? 'Mark as incomplete' : 'မပြီးဆုံးသေးသည်ဟု မှတ်သားရန်') 
            : (language === 'en' ? 'Mark as complete' : 'ပြီးဆုံးအဖြစ် မှတ်သားရန်')}
        >
          <Award className="w-5 h-5" />
        </button>
      </header>

      {/* Horizontal Scrolling Content */}
      <div className="flex-1 relative">
        <div 
          ref={scrollContainerRef}
          className="flex overflow-x-auto snap-x snap-mandatory h-full hide-scrollbar"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          style={{ scrollBehavior: 'smooth' }}
        >
          {availablePages.map((page, index) => (
            <div
              key={page}
              className="w-full flex-shrink-0 snap-center h-full overflow-y-auto"
              style={{ minWidth: '100vw' }}
            >
              <div className="p-3 h-full">
                {/* Page Content */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 h-full flex flex-col">
                  {/* Page Header */}
                  <div className="p-3 border-b border-gray-100 flex items-center">
                    {getPageIcon(page)}
                    <h2 className="ml-2 text-base font-semibold text-gray-800">
                      {getPageTitle(page)}
                    </h2>
                  </div>
                  
                  {/* Page Content */}
                  <div className="flex-1 p-3 overflow-y-auto">
                    {page === 'intro' && (
                      <div className="space-y-4">
                        {lesson.introduction && (
                          <div className="prose prose-sm max-w-none text-gray-700">
                            <div dangerouslySetInnerHTML={{ 
                              __html: Array.isArray(lesson.introduction) 
                                ? lesson.introduction.map(block => block.children?.[0]?.text || '').join(' ')
                                : lesson.introduction 
                            }} />
                          </div>
                        )}
                        
                        {lesson.measurableDeliverables && lesson.measurableDeliverables.length > 0 && (
                          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                            <h3 className="font-semibold text-blue-800 mb-3 flex items-center text-sm">
                              <Target className="w-4 h-4 mr-2" />
                              {language === 'en' ? 'What You\'ll Achieve' : 'သင်ရရှိမည့်အရာများ'}
                            </h3>
                            <div className="space-y-2">
                              {lesson.measurableDeliverables.map((deliverable: any) => (
                                <label 
                                  key={deliverable._key} 
                                  className="flex items-start space-x-2 cursor-pointer hover:bg-blue-100 p-2 rounded-md transition-colors"
                                >
                                  <input
                                    type="checkbox"
                                    checked={completedTasks.includes(deliverable._key)}
                                    onChange={(e) => handleTaskCompletion(deliverable._key, e.target.checked)}
                                    className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 flex-shrink-0 mt-0.5"
                                  />
                                  <div className={`text-sm text-gray-700 flex-1 ${
                                    completedTasks.includes(deliverable._key) ? 'line-through text-gray-500' : ''
                                  }`}>
                                    <div dangerouslySetInnerHTML={{ 
                                      __html: Array.isArray(deliverable.description) 
                                        ? deliverable.description.map(block => block.children?.[0]?.text || '').join(' ')
                                        : deliverable.description 
                                    }} />
                                  </div>
                                  {!deliverable.isOptional && (
                                    <span className="px-1.5 py-0.5 bg-red-100 text-red-800 text-xs rounded-full flex-shrink-0">
                                      {language === 'en' ? 'Required' : 'လိုအပ်သည်'}
                                    </span>
                                  )}
                                </label>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {page === 'content' && (
                      <div className="space-y-4">
                        {lesson.type === 'video' && lesson.youtubeVideoId && (
                          <div className="aspect-video rounded-lg overflow-hidden bg-gray-100 mb-4">
                            <iframe
                              src={`https://www.youtube.com/embed/${lesson.youtubeVideoId}?rel=0&modestbranding=1`}
                              title={lesson.title}
                              className="w-full h-full"
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              allowFullScreen
                            />
                          </div>
                        )}
                        
                        {lesson.content && (
                          <div className="prose prose-sm max-w-none text-gray-700">
                            <div dangerouslySetInnerHTML={{ 
                              __html: Array.isArray(lesson.content) 
                                ? lesson.content.map(block => block.children?.[0]?.text || '').join(' ')
                                : lesson.content 
                            }} />
                          </div>
                        )}
                      </div>
                    )}

                    {page === 'takeaways' && (
                      <div className="space-y-4">
                        {lesson.keyTakeaways && (
                          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                            <h3 className="font-semibold text-green-800 mb-3 flex items-center text-sm">
                              <Lightbulb className="w-4 h-4 mr-2" />
                              {language === 'en' ? 'Key Takeaways' : 'အဓိကအချက်များ'}
                            </h3>
                            <div className="prose prose-sm max-w-none text-green-700">
                              <div dangerouslySetInnerHTML={{ 
                                __html: Array.isArray(lesson.keyTakeaways) 
                                  ? lesson.keyTakeaways.map(block => block.children?.[0]?.text || '').join(' ')
                                  : lesson.keyTakeaways 
                              }} />
                            </div>
                          </div>
                        )}

                        {lesson.reflectionPrompts && (
                          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                            <h3 className="font-semibold text-amber-800 mb-3 text-sm">
                              {language === 'en' ? 'Reflect & Grow' : 'ပြန်လည်သုံးသပ်ပြီး တိုးတက်ပါ'}
                            </h3>
                            <div className="prose prose-sm max-w-none text-amber-700">
                              <div dangerouslySetInnerHTML={{ 
                                __html: Array.isArray(lesson.reflectionPrompts) 
                                  ? lesson.reflectionPrompts.map(block => block.children?.[0]?.text || '').join(' ')
                                  : lesson.reflectionPrompts 
                              }} />
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {page === 'actions' && (
                      <div className="space-y-4">
                        {lesson.actionableTasks && lesson.actionableTasks.length > 0 && (
                          <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                            <h3 className="font-semibold text-purple-800 mb-3 flex items-center text-sm">
                              <Target className="w-4 h-4 mr-2" />
                              {language === 'en' ? 'Your Action Plan' : 'သင့်လုပ်ဆောင်ရန် အစီအစဉ်'}
                            </h3>
                            <div className="space-y-2">
                              {lesson.actionableTasks.map((task: any) => (
                                <label 
                                  key={task._key} 
                                  className="flex items-start space-x-2 cursor-pointer hover:bg-purple-100 p-2 rounded-md transition-colors"
                                >
                                  <input
                                    type="checkbox"
                                    checked={completedTasks.includes(task._key)}
                                    onChange={(e) => handleTaskCompletion(task._key, e.target.checked)}
                                    className="w-4 h-4 text-purple-600 rounded border-gray-300 focus:ring-purple-500 flex-shrink-0 mt-0.5"
                                  />
                                  <div className={`text-sm text-gray-700 flex-1 ${
                                    completedTasks.includes(task._key) ? 'line-through text-gray-500' : ''
                                  }`}>
                                    <div dangerouslySetInnerHTML={{ 
                                      __html: Array.isArray(task.description) 
                                        ? task.description.map(block => block.children?.[0]?.text || '').join(' ')
                                        : task.description 
                                    }} />
                                  </div>
                                  {!task.isOptional && (
                                    <span className="px-1.5 py-0.5 bg-red-100 text-red-800 text-xs rounded-full flex-shrink-0">
                                      {language === 'en' ? 'Required' : 'လိုအပ်သည်'}
                                    </span>
                                  )}
                                </label>
                              ))}
                            </div>
                          </div>
                        )}

                        {lesson.lessonResources && lesson.lessonResources.length > 0 && (
                          <div className="border border-gray-200 rounded-lg p-3">
                            <h3 className="font-semibold text-gray-800 mb-3 text-sm">
                              {language === 'en' ? 'Additional Resources' : 'ထပ်ဆောင်းအရင်းအမြစ်များ'}
                            </h3>
                            <div className="space-y-2">
                              {lesson.lessonResources.map((resource: any, index: number) => (
                                <a
                                  key={index}
                                  href={resource.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center p-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                                >
                                  <FileText className="w-4 h-4 text-gray-500 mr-2 flex-shrink-0" />
                                  <div className="flex-1 min-w-0">
                                    <p className="font-medium text-gray-800 text-sm truncate">{resource.title}</p>
                                    {resource.description && (
                                      <p className="text-xs text-gray-600 truncate">{resource.description}</p>
                                    )}
                                  </div>
                                </a>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {page === 'quiz' && lesson.quiz && (
                      <div className="space-y-4">
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                          <h3 className="text-base font-semibold text-blue-800 mb-2 flex items-center">
                            <FileText className="w-4 h-4 mr-2" />
                            {lesson.quiz.title || (language === 'en' ? 'Knowledge Check' : 'အသိပညာ စစ်ဆေးခြင်း')}
                          </h3>
                          <p className="text-blue-700 text-sm">
                            {language === 'en' 
                              ? 'Test your understanding of the lesson material.' 
                              : 'သင်ခန်းစာအကြောင်းအရာကို သင်နားလည်မှုကို စစ်ဆေးပါ။'}
                          </p>
                        </div>
                        
                        {lesson.quiz.questions && lesson.quiz.questions.map((question: any, questionIndex: number) => (
                          <div key={questionIndex} className="bg-white border border-gray-200 rounded-lg p-3">
                            <h4 className="text-sm font-medium text-gray-800 mb-3">
                              {questionIndex + 1}. {question.questionText}
                            </h4>
                            
                            {question.questionType === 'multipleChoice' && question.options && (
                              <div className="space-y-2">
                                {question.options.map((option: any, optionIndex: number) => (
                                  <label 
                                    key={optionIndex}
                                    className="flex items-center p-2 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors"
                                  >
                                    <input
                                      type="radio"
                                      name={`question-${questionIndex}`}
                                      className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500 flex-shrink-0"
                                    />
                                    <span className="ml-2 text-sm text-gray-700 flex-1">{option.text}</span>
                                  </label>
                                ))}
                              </div>
                            )}
                            
                            {question.questionType === 'trueFalse' && (
                              <div className="space-y-2">
                                {[true, false].map((value, index) => (
                                  <label 
                                    key={index}
                                    className="flex items-center p-2 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors"
                                  >
                                    <input
                                      type="radio"
                                      name={`question-${questionIndex}`}
                                      className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500 flex-shrink-0"
                                    />
                                    <span className="ml-2 text-sm text-gray-700 flex-1">
                                      {value ? 'True' : 'False'}
                                    </span>
                                  </label>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                        
                        <div className="flex justify-center">
                          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm min-h-[44px]">
                            {language === 'en' ? 'Submit Quiz' : 'ဆစ်ကို တင်သွင်းရန်'}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Dots */}
      <div className="bg-white border-t border-gray-200 px-4 py-3">
        <div className="flex items-center justify-center space-x-2 mb-3">
          {availablePages.map((page, index) => (
            <button
              key={page}
              onClick={() => goToPage(page)}
              className={`w-2 h-2 rounded-full transition-all duration-200 ${
                currentPage === page ? 'bg-blue-600 w-6' : 'bg-gray-300'
              }`}
              aria-label={`Go to ${getPageTitle(page)}`}
            />
          ))}
        </div>
        
        {/* Navigation Buttons */}
        <div className="flex items-center justify-between">
          <button
            onClick={handlePrevPage}
            disabled={currentPageIndex === 0}
            className={`flex items-center px-4 py-2 rounded-lg border border-gray-300 text-gray-700 transition-colors min-h-[44px] ${
              currentPageIndex === 0 
                ? 'opacity-50 cursor-not-allowed' 
                : 'hover:bg-gray-50'
            }`}
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            <span className="text-sm">{language === 'en' ? 'Previous' : 'နောက်သို့'}</span>
          </button>

          {currentPageIndex === availablePages.length - 1 ? (
            <div className="flex space-x-2">
              {nextLesson ? (
                <button
                  onClick={() => navigateToLesson(nextLesson.slug)}
                  className="flex items-center px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors min-h-[44px]"
                >
                  <span className="text-sm">{language === 'en' ? 'Next Lesson' : 'နောက်သင်ခန်းစာ'}</span>
                  <ChevronRight className="w-4 h-4 ml-1" />
                </button>
              ) : (
                <button
                  onClick={() => navigate(`/courses/${pathSlug}`)}
                  className="flex items-center px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 transition-colors min-h-[44px]"
                >
                  <CheckCircle className="w-4 h-4 mr-1" />
                  <span className="text-sm">{language === 'en' ? 'Complete' : 'ပြီးဆုံး'}</span>
                </button>
              )}
            </div>
          ) : (
            <button
              onClick={handleNextPage}
              className="flex items-center px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors min-h-[44px]"
            >
              <span className="text-sm">{language === 'en' ? 'Next' : 'ရှေ့သို့'}</span>
              <ChevronRight className="w-4 h-4 ml-1" />
            </button>
          )}
        </div>
      </div>

      {/* Milestone Modal */}
      <LessonMilestoneModal
        show={showMilestoneModal}
        onClose={() => setShowMilestoneModal(false)}
        milestoneName={earnedMilestone}
        language={language}
      />
    </div>
  );
};

export default LessonDetail;