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
  Award
} from 'lucide-react';

// Import components
import LessonHeader from './components/LessonHeader';
import LessonNavigation from './components/LessonNavigation';
import LessonContent from './components/LessonContent';
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
  const contentRef = useRef<HTMLDivElement>(null);
  
  // Quiz state
  const [userAnswers, setUserAnswers] = useState<any[]>([]);
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizResults, setQuizResults] = useState<any[]>([]);
  const [totalScore, setTotalScore] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(0);

  // Task completion state
  const [completedTasks, setCompletedTasks] = useState<string[]>([]);
  const [showMilestoneModal, setShowMilestoneModal] = useState(false);
  const [earnedMilestone, setEarnedMilestone] = useState<string | null>(null);

  // SEO optimization
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

  // SEO optimization - moved after data fetching to ensure variables are initialized
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
        setTotalQuestions(lesson.quiz.questions.length);
        
        // Initialize empty user answers for each question
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

      // Add event listener for global completion toggle
      window.addEventListener('toggle-lesson-completion', toggleCompletion as any);
      return () => {
        window.removeEventListener('toggle-lesson-completion', toggleCompletion as any);
      };
    }
  }, [lesson?._id]);

  // Handle touch events for swiping
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isSwipe = Math.abs(distance) > 50; // Minimum distance for a swipe
    
    if (isSwipe) {
      if (distance > 0) {
        // Swipe left - go to next page
        handleNextPage();
      } else {
        // Swipe right - go to previous page
        handlePrevPage();
      }
    }
    
    // Reset touch values
    setTouchStart(null);
    setTouchEnd(null);
  };

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
      // Revert state if update fails
      setCompletedTasks(completedTasks);
    }
  };

  const toggleCompletion = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || !lesson || !path) {
        console.error('Missing required data for toggle completion');
        return;
      }

      // Determine if all required tasks are completed
      const allRequiredTasks = [
        ...(lesson.measurableDeliverables || []),
        ...(lesson.actionableTasks || [])
      ].filter(task => !task.isOptional);

      const allRequiredTasksCompleted = allRequiredTasks.every(task =>
        completedTasks.includes(task._key)
      );

      const newStatus = !completed;

      if (!newStatus || allRequiredTasksCompleted) { // Allow unmarking or marking if all required tasks are done
        const progressData = {
          user_id: user.id,
          lesson_id: lesson._id,
          course_id: path._id,
          module_id: lesson.module?._id || null, // Make module_id optional
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
        
        // Track lesson completion
        if (newStatus) {
          const timeSpent = Math.floor((new Date().getTime() - startTime.getTime()) / 1000);
          trackLessonCompleted(lesson._id, lesson.title, timeSpent);
          
          // Check for milestones
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

    // Sort modules by order
    const sortedModules = [...path.modules].sort((a, b) => (a.order || 0) - (b.order || 0));

    for (const module of sortedModules) {
      if (!module.lessons) continue;

      // Sort lessons within module
      const sortedLessons = [...module.lessons].sort((a, b) => (a.order || 0) - (b.order || 0));

      for (let i = 0; i < sortedLessons.length; i++) {
        const lesson = sortedLessons[i];
        
        if (lesson.slug === lessonSlug) {
          foundCurrent = true;
          if (i > 0) {
            prevLesson = sortedLessons[i - 1];
          } else {
            // Check previous module's last lesson
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
            // Check next module's first lesson
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
    
    // Introduction is always available
    pages.push('intro');
    
    // Content page is available if there's content or it's a video/exercise lesson
    if (lesson?.content || lesson?.type === 'video' || lesson?.type === 'exercise') {
      pages.push('content');
    }
    
    // Takeaways page is available if there are key takeaways
    if (lesson?.keyTakeaways) {
      pages.push('takeaways');
    }
    
    // Actions page is available if there are action items or resources
    if ((lesson?.actionableTasks && lesson.actionableTasks.length > 0) || 
        (lesson?.lessonResources && lesson.lessonResources.length > 0)) {
      pages.push('actions');
    }
    
    // Quiz page is available if it's a quiz lesson or has an associated quiz
    if (lesson?.type === 'quiz' || lesson?.quiz) {
      pages.push('quiz');
    }
    
    return pages;
  };

  // Navigation between pages
  const handleNextPage = () => {
    const pages = getAvailablePages();
    const currentIndex = pages.indexOf(currentPage);
    
    if (currentIndex < pages.length - 1) {
      setCurrentPage(pages[currentIndex + 1]);
      // Scroll to top when changing pages
      window.scrollTo(0, 0);
    }
  };

  const handlePrevPage = () => {
    const pages = getAvailablePages();
    const currentIndex = pages.indexOf(currentPage);
    
    if (currentIndex > 0) {
      setCurrentPage(pages[currentIndex - 1]);
      // Scroll to top when changing pages
      window.scrollTo(0, 0);
    }
  };

  const goToPage = (page: LessonPage) => {
    setCurrentPage(page);
    // Scroll to top when changing pages
    window.scrollTo(0, 0);
  };

  if (pathLoading || lessonLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!lesson || !path) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-800 mb-2">
          {language === 'en' ? 'Lesson not found' : 'သင်ခန်းစာ မတွေ့ရှိပါ'}
        </h2>
        <button
          onClick={() => navigate(`/courses/${pathSlug}`)}
          className="text-blue-600 hover:text-blue-700"
        >
          {language === 'en' ? 'Return to Course' : 'သင်တန်းသို့ ပြန်သွားရန်'}
        </button>
      </div>
    );
  }

  const { prevLesson, nextLesson } = findAdjacentLessons();
  const availablePages = getAvailablePages();
  const currentPageIndex = availablePages.indexOf(currentPage);

  return (
    <div className="w-full min-h-screen overflow-x-hidden bg-gray-50" role="main" aria-labelledby="lesson-title">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm animate-fade-in" role="article">
          {/* Mobile Header */}
          <LessonHeader 
            title={lesson.title}
            completed={completed}
            toggleCompletion={toggleCompletion}
            navigateBack={() => navigate(`/courses/${pathSlug}`)}
          />

          {/* Navigation Tabs - Mobile specific */}
          <div className="md:hidden">
            <LessonNavigation 
              availablePages={availablePages}
              currentPage={currentPage}
              goToPage={goToPage}
            />
          </div>

          {/* Desktop Navigation Tabs - Hidden on Mobile */}
          <div className="hidden md:block border-b border-gray-200">
            <LessonNavigation 
              availablePages={availablePages}
              currentPage={currentPage}
              goToPage={goToPage}
              isDesktop={true}
            />
          </div>

          {/* Main Content Area */}
          <div 
            className="p-2 sm:p-5 focus-within:outline-none"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            ref={contentRef}
            role="tabpanel"
            id={`${currentPage}-panel`}
            aria-label="Lesson content"
          >
            {/* Desktop Header - Hidden on Mobile */}
            <div className="hidden md:flex items-center justify-between mb-6 animate-slide-down">
              <button
                onClick={() => navigate(`/courses/${pathSlug}`)}
                className="flex items-center text-gray-600 hover:text-gray-800 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-lg p-2 press-effect"
                aria-label={language === 'en' ? 'Return to course overview' : 'သင်တန်းခြုံငုံသုံးသပ်ချက်သို့ ပြန်သွားရန်'}
              >
                <ArrowLeft className="h-5 w-5 mr-2" aria-hidden="true" />
                {language === 'en' ? 'Back to Course' : 'သင်တန်းသို့ ပြန်သွားရန်'}
              </button>

              <button
                onClick={toggleCompletion}
                className={`flex items-center px-4 py-2 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 press-effect ${
                  completed
                    ? 'bg-green-100 text-green-700 hover:bg-green-200 focus:ring-green-500'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 focus:ring-blue-500'
                }`}
                aria-pressed={completed}
              >
                <Award className="h-5 w-5 mr-2" aria-hidden="true" />
                {completed
                  ? (language === 'en' ? 'Completed' : 'ပြီးဆုံး')
                  : (language === 'en' ? 'Mark as Complete' : 'ပြီးဆုံးအဖြစ် မှတ်သားရန်')}
              </button>
            </div>

            {/* Lesson Content */}
            <LessonContent
              lesson={lesson}
              currentPage={currentPage}
              completedTasks={completedTasks}
              handleTaskCompletion={handleTaskCompletion}
              userAnswers={userAnswers}
              setUserAnswers={setUserAnswers}
              quizSubmitted={quizSubmitted}
              setQuizSubmitted={setQuizSubmitted}
              quizResults={quizResults}
              setQuizResults={setQuizResults}
              totalScore={totalScore}
              setTotalScore={setTotalScore}
              language={language}
              trackEvent={trackEvent}
              startTime={startTime}
              toggleCompletion={toggleCompletion}
            />

            {/* Page Navigation Dots - Mobile Only */}
            <div className="md:hidden flex justify-center mt-4 space-x-2 animate-fade-in">
              {availablePages.map((page, index) => (
                <button
                  key={page}
                  onClick={() => goToPage(page)}
                  className={`w-2.5 h-2.5 rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                    currentPage === page ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                  aria-label={`Go to page ${index + 1}`}
                />
              ))}
            </div>

            {/* Page Navigation Buttons */}
            <div className="flex justify-between mt-4 mb-2 animate-fade-in">
              <button
                onClick={handlePrevPage}
                disabled={currentPageIndex === 0}
                className={`flex items-center px-4 py-2 rounded-lg border border-gray-300 text-gray-700 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 min-h-[44px] ${
                  currentPageIndex === 0 
                    ? 'opacity-50 cursor-not-allowed' 
                    : 'hover:bg-gray-50 press-effect'
                }`}
                aria-label={language === 'en' ? 'Go to previous section' : 'ယခင်အပိုင်းသို့ သွားရန်'}
              >
                <ChevronLeft className="h-5 w-5 mr-1" aria-hidden="true" />
                <span className="hidden md:inline">{language === 'en' ? 'Previous' : 'နောက်သို့'}</span>
              </button>

              {currentPageIndex === availablePages.length - 1 ? (
                <div className="flex space-x-3 animate-slide-up">
                  {nextLesson ? (
                    <button
                      onClick={() => navigateToLesson(nextLesson.slug)}
                      className="flex items-center px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 press-effect min-h-[44px]"
                      aria-label={`Continue to next lesson: ${nextLesson.title}`}
                    >
                      <span className="hidden md:inline">{language === 'en' ? 'Next Lesson' : 'နောက်သင်ခန်းစာ'}</span>
                      <span className="md:hidden">{language === 'en' ? 'Next' : 'ရှေ့သို့'}</span>
                      <ChevronRight className="h-5 w-5 ml-1" aria-hidden="true" />
                    </button>
                  ) : (
                    <button
                      onClick={() => navigate(`/courses/${pathSlug}`)}
                      className="flex items-center px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 press-effect min-h-[44px]"
                      aria-label={language === 'en' ? 'Complete lesson and return to course' : 'သင်ခန်းစာပြီးဆုံးပြီး သင်တန်းသို့ ပြန်သွားရန်'}
                    >
                      <span>{language === 'en' ? 'Finish' : 'ပြီးဆုံး'}</span>
                      <Award className="h-5 w-5 ml-1" aria-hidden="true" />
                    </button>
                  )}
                </div>
              ) : (
                <button
                  onClick={handleNextPage}
                  className="flex items-center px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 press-effect min-h-[44px]"
                  aria-label={language === 'en' ? 'Continue to next section' : 'နောက်အပိုင်းသို့ ဆက်လက်သွားရန်'}
                >
                  <span className="hidden md:inline">{language === 'en' ? 'Continue' : 'ဆက်လက်'}</span>
                  <span className="md:hidden">{language === 'en' ? 'Next' : 'ရှေ့သို့'}</span>
                  <ChevronRight className="h-5 w-5 ml-1" aria-hidden="true" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Milestone Earned Modal */}
        <LessonMilestoneModal
          show={showMilestoneModal}
          onClose={() => setShowMilestoneModal(false)}
          milestoneName={earnedMilestone}
          language={language}
        />
      </div>
    </div>
  );
};

export default LessonDetail;