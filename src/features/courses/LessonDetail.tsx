import React, { useState, useEffect } from 'react';
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
  Award,
  BookOpen,
  PlayCircle,
  FileText,
  Lightbulb,
  Target,
  CheckCircle,
  Clock,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  Download,
  ExternalLink,
  RefreshCw,
  RotateCcw
} from 'lucide-react';
import { PortableText } from '@portabletext/react';

const LessonDetail = () => {
  const { pathSlug, lessonSlug } = useParams();
  const navigate = useNavigate();
  const { language } = useLanguage();
  const { trackEvent, trackLessonCompleted } = useAnalytics();
  const { checkAndAwardMilestones } = useMilestones();
  const [completed, setCompleted] = useState(false);
  const [startTime] = useState<Date>(new Date());
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['intro']));
  
  // Quiz state
  const [userAnswers, setUserAnswers] = useState<any[]>([]);
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizResults, setQuizResults] = useState<any[]>([]);
  const [totalScore, setTotalScore] = useState(0);

  // Task completion state
  const [completedTasks, setCompletedTasks] = useState<string[]>([]);

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
            order
          }
        }
      }
    `, { pathSlug }),
    enabled: !!pathSlug
  });

  // Fetch current lesson details
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
          url,
          type
        },
        reflectionPrompts,
        videoType,
        youtubeVideoId,
        selfHostedVideoUrl,
        quiz,
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
      
      // Initialize quiz state
      if (lesson.quiz?.questions && Array.isArray(lesson.quiz.questions)) {
        const initialUserAnswers = lesson.quiz.questions.map((_, index) => ({
          questionIndex: index,
          selectedOptionIndex: undefined,
          trueFalseAnswer: undefined
        }));
        setUserAnswers(initialUserAnswers);
      }
    }
  }, [lesson?._id]);
  
  useEffect(() => {
  setExpandedSections(new Set(['intro']));
  // optional: jump to top when switching lessons
  window.scrollTo({ top: 0, behavior: 'auto' }); // or 'instant' if you prefer
  }, [lessonSlug]);
  
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

      const newStatus = !completed;
      setCompleted(newStatus);

      const { error } = await supabase
        .from('course_progress')
        .upsert({
          user_id: user.id,
          lesson_id: lesson._id,
          course_id: path._id,
          module_id: lesson.module?._id || null,
          completed: newStatus,
          completed_lesson_tasks: completedTasks,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id,lesson_id'
        });

      if (error) throw error;
      
      if (newStatus) {
        const timeSpent = Math.floor((new Date().getTime() - startTime.getTime()) / 1000);
        trackLessonCompleted(lesson._id, lesson.title, timeSpent);
        await checkAndAwardMilestones('lesson', lesson._id);
      }
    } catch (err) {
      console.error('Error updating completion status:', err);
      setCompleted(!completed);
    }
  };

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(sectionId)) {
        newSet.delete(sectionId);
      } else {
        newSet.add(sectionId);
      }
      return newSet;
    });
  };

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      // Expand the section if it's not already expanded
      if (!expandedSections.has(sectionId)) {
        toggleSection(sectionId);
      }
    }
  };

  // Find adjacent lessons for navigation
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
        const currentLesson = sortedLessons[i];
        
        if (currentLesson.slug === lessonSlug) {
          foundCurrent = true;
          
          // Find previous lesson
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
          
          // Find next lesson
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
      }
      
      if (foundCurrent) break;
    }

    return { prevLesson, nextLesson };
  };

  // Quiz handlers
  const handleAnswerChange = (questionIndex: number, value: number | boolean) => {
    setUserAnswers(prev => {
      const newAnswers = [...prev];
      
      if (typeof value === 'number') {
        newAnswers[questionIndex] = {
          ...newAnswers[questionIndex],
          selectedOptionIndex: value,
          trueFalseAnswer: undefined
        };
      } else {
        newAnswers[questionIndex] = {
          ...newAnswers[questionIndex],
          selectedOptionIndex: undefined,
          trueFalseAnswer: value
        };
      }
      
      return newAnswers;
    });
  };

  const handleSubmitQuiz = () => {
    if (!lesson?.quiz?.questions || !Array.isArray(lesson.quiz.questions)) return;
    
    const results: any[] = [];
    let score = 0;
    
    lesson.quiz.questions.forEach((question: any, index: number) => {
      const userAnswer = userAnswers[index];
      let isCorrect = false;
      
      if (question.questionType === 'multipleChoice' && userAnswer?.selectedOptionIndex !== undefined) {
        isCorrect = question.options[userAnswer.selectedOptionIndex]?.isCorrect || false;
      } else if (question.questionType === 'trueFalse' && userAnswer?.trueFalseAnswer !== undefined) {
        isCorrect = userAnswer.trueFalseAnswer === question.correctAnswer;
      }
      
      if (isCorrect) score++;
      
      results.push({
        questionIndex: index,
        isCorrect,
        feedback: question.feedback
      });
    });
    
    setQuizResults(results);
    setTotalScore(score);
    setQuizSubmitted(true);
    
    // Track quiz submission
    trackEvent('quiz_submitted', {
      lesson_id: lesson._id,
      lesson_title: lesson.title,
      score,
      total_questions: lesson.quiz.questions.length,
      passed: score / lesson.quiz.questions.length >= 0.7,
      time_spent_seconds: Math.floor((new Date().getTime() - startTime.getTime()) / 1000)
    });
    
    // Auto-complete lesson if quiz passed
    if (score / lesson.quiz.questions.length >= 0.7 && !completed) {
      toggleCompletion();
    }
  };

  const handleRetakeQuiz = () => {
    setUserAnswers(lesson?.quiz?.questions?.map((_, index) => ({
      questionIndex: index,
      selectedOptionIndex: undefined,
      trueFalseAnswer: undefined
    })) || []);
    setQuizSubmitted(false);
    setQuizResults([]);
    setTotalScore(0);
  };

  // Calculate progress
  const calculateProgress = () => {
    const totalTasks = [
      ...(lesson?.measurableDeliverables || []),
      ...(lesson?.actionableTasks || [])
    ].length;
    
    if (totalTasks === 0) return completed ? 100 : 0;
    
    const completedCount = completedTasks.length;
    const taskProgress = (completedCount / totalTasks) * 80; // Tasks worth 80%
    const completionBonus = completed ? 20 : 0; // Completion worth 20%
    
    return Math.min(Math.round(taskProgress + completionBonus), 100);
  };

  if (pathLoading || lessonLoading) {
    return (
      <div className="min-h-screen bg-gray-50 overflow-x-hidden flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!lesson || !path) {
    return (
      <div className="min-h-screen bg-gray-50 overflow-x-hidden flex items-center justify-center p-4">
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
  const progress = calculateProgress();

  return (
    <div className="min-h-screen bg-gray-50 overflow-x-hidden">
      {/* Header  */}
      <header className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
        <div className="flex items-center justify-between px-3 py-2 min-h-[56px]">
          
          <div className="flex-1 text-center px-2 min-w-0">
            <h1 className="text-sm font-semibold text-gray-900 truncate">
              {lesson.title}
            </h1>
            <div className="flex items-center justify-center text-xs text-gray-500 mt-0.5">
              <Clock className="w-3 h-3 mr-1" />
              <span>{lesson.duration}</span>
              <span className="mx-2">•</span>
              <span>{progress}% {language === 'en' ? 'complete' : 'ပြီးဆုံး'}</span>
            </div>
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
              : (language === 'en' ? 'Mark as complete' : 'ပြီးဆုံးအဖြစ် မှတ်သားရန် ')}
          >
            <Award className="w-5 h-5" />
          </button>
        </div>
        
        {/* Progress Bar */}
        <div className="hidden md:block w-full bg-gray-200 h-1">
          <div 
            className="bg-blue-600 h-1 transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </header>

      {/* Main Content -  Vertical Scrolling */}
      <main className="pb-[calc(10rem+env(safe-area-inset-bottom))] md:pb-24">
        <div className="max-w-4xl mx-auto px-3 py-4 space-y-4 overflow-x-hidden">
          
          {/* Introduction Section */}
          <section id="intro" className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden scroll-mt-24">
            <button
              onClick={() => toggleSection('intro')}
              className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center">
                <BookOpen className="w-5 h-5 text-blue-600 mr-3" />
                <h2 className="text-lg font-semibold text-gray-900">
                  {language === 'en' ? 'Introduction' : 'မိတ်ဆက် '}
                </h2>
              </div>
              {expandedSections.has('intro') ? (
                <ChevronUp className="w-5 h-5 text-gray-400" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-400" />
              )}
            </button>
            
            {expandedSections.has('intro') && (
              <div className="px-4 pb-4 border-t border-gray-100">
                {lesson.introduction && (
                  <div className="prose prose-sm max-w-none text-gray-700 mb-4 break-words prose-a:break-all">
                    <PortableText value={Array.isArray(lesson.introduction) ? lesson.introduction : [lesson.introduction]} />
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
                            <PortableText value={Array.isArray(deliverable.description) ? deliverable.description : [deliverable.description]} />
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
          </section>

          {/* Content Section */}
          {(lesson.content || lesson.type === 'video') && (
            <section id="content" className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden scroll-mt-24">
              <button
                onClick={() => toggleSection('content')}
                className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center">
                  {lesson.type === 'video' ? (
                    <PlayCircle className="w-5 h-5 text-blue-600 mr-3" />
                  ) : (
                    <FileText className="w-5 h-5 text-blue-600 mr-3" />
                  )}
                  <h2 className="text-lg font-semibold text-gray-900">
                    {language === 'en' ? 'Lesson Content' : 'သင်ခန်းစာအကြောင်းအရာ'}
                  </h2>
                </div>
                {expandedSections.has('content') ? (
                  <ChevronUp className="w-5 h-5 text-gray-400" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-400" />
                )}
              </button>
              
              {expandedSections.has('content') && (
                <div className="px-4 pb-4 border-t border-gray-100">
                  {/* Video Content */}
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
                  
                  {/* Text Content */}
                  {lesson.content && (
                    <div className="prose prose-sm max-w-none text-gray-700 break-words prose-a:break-all">
                      <PortableText value={Array.isArray(lesson.content) ? lesson.content : [lesson.content]} />
                    </div>
                  )}
                </div>
              )}
            </section>
          )}

          {/* Key Takeaways Section */}
          {lesson.keyTakeaways && (
            <section id="takeaways" className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden scroll-mt-24">
              <button
                onClick={() => toggleSection('takeaways')}
                className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center">
                  <Lightbulb className="w-5 h-5 text-green-600 mr-3" />
                  <h2 className="text-lg font-semibold text-gray-900">
                    {language === 'en' ? 'Key Takeaways' : 'အဓိကအချက်များ'}
                  </h2>
                </div>
                {expandedSections.has('takeaways') ? (
                  <ChevronUp className="w-5 h-5 text-gray-400" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-400" />
                )}
              </button>
              
              {expandedSections.has('takeaways') && (
                <div className="px-4 pb-4 border-t border-gray-100">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <div className="prose prose-sm max-w-none text-green-700 break-words prose-a:break-all">
                      <PortableText value={Array.isArray(lesson.keyTakeaways) ? lesson.keyTakeaways : [lesson.keyTakeaways]} />
                    </div>
                  </div>
                  
                  {lesson.reflectionPrompts && (
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mt-4">
                      <h3 className="font-semibold text-amber-800 mb-2 text-sm">
                        {language === 'en' ? 'Reflect & Grow' : 'ပြန်လည်သုံးသပ်ပြီး တိုးတက်ပါ'}
                      </h3>
                      <div className="prose prose-sm max-w-none text-amber-700">
                        <PortableText value={Array.isArray(lesson.reflectionPrompts) ? lesson.reflectionPrompts : [lesson.reflectionPrompts]} />
                      </div>
                    </div>
                  )}
                </div>
              )}
            </section>
          )}

          {/* Action Plan Section */}
          {((lesson.actionableTasks && lesson.actionableTasks.length > 0) || 
            (lesson.lessonResources && lesson.lessonResources.length > 0)) && (
            <section id="actions" className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden scroll-mt-24">
              <button
                onClick={() => toggleSection('actions')}
                className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center">
                  <Target className="w-5 h-5 text-purple-600 mr-3" />
                  <h2 className="text-lg font-semibold text-gray-900">
                    {language === 'en' ? 'Action Plan' : 'လုပ်ဆောင်ရန်အစီအစဉ်'}
                  </h2>
                </div>
                {expandedSections.has('actions') ? (
                  <ChevronUp className="w-5 h-5 text-gray-400" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-400" />
                )}
              </button>
              
              {expandedSections.has('actions') && (
                <div className="px-4 pb-4 border-t border-gray-100 space-y-4">
                  {/* Action Tasks */}
                  {lesson.actionableTasks && lesson.actionableTasks.length > 0 && (
                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                      <h3 className="font-semibold text-purple-800 mb-3 text-sm">
                        {language === 'en' ? 'Tasks to Complete' : 'ပြီးဆုံးရန် လုပ်ငန်းတာဝန်များ'}
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
                              <PortableText value={Array.isArray(task.description) ? task.description : [task.description]} />
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

                  {/* Resources */}
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
                            {resource.type === 'download' ? (
                              <Download className="w-4 h-4 text-gray-500 mr-2 flex-shrink-0" />
                            ) : (
                              <ExternalLink className="w-4 h-4 text-gray-500 mr-2 flex-shrink-0" />
                            )}
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
            </section>
          )}

          {/* Quiz Section */}
          {lesson.quiz && lesson.quiz.questions && lesson.quiz.questions.length > 0 && (
            <section id="quiz" className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden scroll-mb-40">
              <button
                onClick={() => toggleSection('quiz')}
                className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center">
                  <FileText className="w-5 h-5 text-amber-600 mr-3" />
                  <h2 className="text-lg font-semibold text-gray-900">
                    {language === 'en' ? 'Knowledge Check' : 'အသိပညာ စစ်ဆေးခြင်း'}
                  </h2>
                </div>
                {expandedSections.has('quiz') ? (
                  <ChevronUp className="w-5 h-5 text-gray-400" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-400" />
                )}
              </button>
              
              {expandedSections.has('quiz') && (
                <div className="px-4 pb-4 border-t border-gray-100">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                    <h3 className="text-base font-semibold text-blue-800 mb-2">
                      {lesson.quiz.title || (language === 'en' ? 'Knowledge Check' : 'အသိပညာ စစ်ဆေးခြင်း')}
                    </h3>
                    <p className="text-blue-700 text-sm">
                      {language === 'en' 
                        ? 'Test your understanding of the lesson material.' 
                        : 'သင်ခန်းစာအကြောင်းအရာကို သင်နားလည်မှုကို စစ်ဆေးပါ။'}
                    </p>
                    
                    {quizSubmitted && (
                      <div className={`mt-3 p-3 rounded-lg ${
                        totalScore / lesson.quiz.questions.length >= 0.7 
                          ? 'bg-green-100 border border-green-200' 
                          : 'bg-amber-100 border border-amber-200'
                      }`}>
                        <div className="flex items-center">
                          {totalScore / lesson.quiz.questions.length >= 0.7 ? (
                            <Award className="w-4 h-4 text-green-600 mr-2" />
                          ) : (
                            <AlertCircle className="w-4 h-4 text-amber-600 mr-2" />
                          )}
                          <div>
                            <h4 className={`font-medium text-sm ${
                              totalScore / lesson.quiz.questions.length >= 0.7 ? 'text-green-800' : 'text-amber-800'
                            }`}>
                              {totalScore / lesson.quiz.questions.length >= 0.7 
                                ? (language === 'en' ? 'Great job!' : 'အလုပ်ကောင်းပါသည်!')
                                : (language === 'en' ? 'Keep practicing!' : 'ဆက်လက်လေ့ကျင့်ပါ!')}
                            </h4>
                            <p className={`text-xs ${totalScore / lesson.quiz.questions.length >= 0.7 ? 'text-green-700' : 'text-amber-700'}`}>
                              {language === 'en' 
                                ? `You scored ${totalScore} out of ${lesson.quiz.questions.length} questions.`
                                : `သင်သည် မေးခွန်း ${lesson.quiz.questions.length} ခုအနက် ${totalScore} ခုကို မှန်ကန်စွာဖြေဆိုနိုင်ခဲ့သည်။`}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Quiz Questions */}
                  <div className="space-y-4">
                    {lesson.quiz.questions.map((question: any, questionIndex: number) => (
                      <div 
                        key={questionIndex} 
                        className={`p-3 rounded-lg border ${
                          quizSubmitted 
                            ? quizResults[questionIndex]?.isCorrect 
                              ? 'bg-green-50 border-green-200' 
                              : 'bg-red-50 border-red-200'
                            : 'bg-white border-gray-200'
                        }`}
                      >
                        <h4 className="text-sm font-medium text-gray-800 mb-3">
                          {questionIndex + 1}. {question.questionText}
                        </h4>
                        
                        {question.questionType === 'multipleChoice' && question.options && (
                          <div className="space-y-2">
                            {question.options.map((option: any, optionIndex: number) => (
                              <label 
                                key={optionIndex}
                                className={`flex items-center p-2 rounded-lg border cursor-pointer transition-colors ${
                                  quizSubmitted
                                    ? option.isCorrect
                                      ? 'bg-green-100 border-green-300'
                                      : userAnswers[questionIndex]?.selectedOptionIndex === optionIndex
                                        ? 'bg-red-100 border-red-300'
                                        : 'border-gray-200'
                                    : userAnswers[questionIndex]?.selectedOptionIndex === optionIndex
                                      ? 'bg-blue-50 border-blue-300'
                                      : 'border-gray-200 hover:bg-gray-50'
                                } ${quizSubmitted ? 'cursor-default' : ''}`}
                              >
                                <input
                                  type="radio"
                                  name={`question-${questionIndex}`}
                                  checked={userAnswers[questionIndex]?.selectedOptionIndex === optionIndex}
                                  onChange={() => !quizSubmitted && handleAnswerChange(questionIndex, optionIndex)}
                                  className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500 flex-shrink-0"
                                  disabled={quizSubmitted}
                                />
                                <span className="ml-2 text-sm flex-1">{option.text}</span>
                                
                                {quizSubmitted && option.isCorrect && (
                                  <CheckCircle className="ml-auto w-4 h-4 text-green-600 flex-shrink-0" />
                                )}
                              </label>
                            ))}
                          </div>
                        )}
                        
                        {question.questionType === 'trueFalse' && (
                          <div className="space-y-2">
                            {[true, false].map((value, index) => (
                              <label 
                                key={index}
                                className={`flex items-center p-2 rounded-lg border cursor-pointer transition-colors ${
                                  quizSubmitted
                                    ? value === question.correctAnswer
                                      ? 'bg-green-100 border-green-300'
                                      : userAnswers[questionIndex]?.trueFalseAnswer === value
                                        ? 'bg-red-100 border-red-300'
                                        : 'border-gray-200'
                                    : userAnswers[questionIndex]?.trueFalseAnswer === value
                                      ? 'bg-blue-50 border-blue-300'
                                      : 'border-gray-200 hover:bg-gray-50'
                                } ${quizSubmitted ? 'cursor-default' : ''}`}
                              >
                                <input
                                  type="radio"
                                  name={`question-${questionIndex}`}
                                  checked={userAnswers[questionIndex]?.trueFalseAnswer === value}
                                  onChange={() => !quizSubmitted && handleAnswerChange(questionIndex, value)}
                                  className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500 flex-shrink-0"
                                  disabled={quizSubmitted}
                                />
                                <span className="ml-2 text-sm flex-1">
                                  {value ? (language === 'en' ? 'True' : 'မှန်သည်') : (language === 'en' ? 'False' : 'မမှန်ပါ')}
                                </span>
                                
                                {quizSubmitted && value === question.correctAnswer && (
                                  <CheckCircle className="ml-auto w-4 h-4 text-green-600 flex-shrink-0" />
                                )}
                              </label>
                            ))}
                          </div>
                        )}
                        
                        {quizSubmitted && quizResults[questionIndex]?.feedback && (
                          <div className="mt-3 p-2 bg-gray-50 rounded-lg border border-gray-200">
                            <p className="text-gray-700 text-sm">
                              <strong>{language === 'en' ? 'Feedback:' : 'တုံ့ပြန်ချက်:'}</strong> {quizResults[questionIndex].feedback}
                            </p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  
                  {/* Quiz Actions */}
                  <div className="flex justify-center mt-4 space-x-3">
                    {!quizSubmitted ? (
                      <button
                        onClick={handleSubmitQuiz}
                        disabled={userAnswers.some(answer => 
                          !answer || (answer.selectedOptionIndex === undefined && answer.trueFalseAnswer === undefined)
                        )}
                        className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center text-sm min-h-[44px]"
                      >
                        <FileText className="w-4 h-4 mr-2" />
                        {language === 'en' ? 'Submit Quiz' : 'ဆစ်ကို တင်သွင်းရန်'}
                      </button>
                    ) : (
                      <button
                        onClick={handleRetakeQuiz}
                        className="px-4 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center text-sm min-h-[44px]"
                      >
                        <RefreshCw className="w-4 h-4 mr-2" />
                        {language === 'en' ? 'Retake Quiz' : 'ပြန်လည်ဖြေဆိုရန်'}
                      </button>
                    )}
                  </div>
                </div>
              )}
            </section>
          )}

        </div>
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed left-0 right-0 bottom-[calc(64px+env(safe-area-inset-bottom))] md:bottom-0 bg-white border-t border-gray-200 shadow-lg z-50">
        <div className="flex items-center justify-between px-4 py-3 max-w-4xl mx-auto">
          {prevLesson ? (
            <button
              onClick={() => navigate(`/courses/${pathSlug}/lessons/${prevLesson.slug}`)}
              className="flex items-center px-3 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors min-h-[44px] text-sm"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              <span className="hidden sm:inline">{language === 'en' ? 'Previous' : 'နောက်သို့'}</span>
            </button>
          ) : (
            <button
              onClick={() => navigate(`/courses/${pathSlug}`)}
              className="flex items-center px-3 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors min-h-[44px] text-sm"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              <span className="hidden sm:inline">{language === 'en' ? 'Course' : 'သင်တန်း'}</span>
            </button>
          )}

          {/* Progress Indicator */}
          <div className="hidden md:flex items-center space-x-1 sm:space-x-2">
            <div className="w-12 sm:w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-blue-600 transition-all duration-500 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="text-xs text-gray-600 font-medium hidden sm:inline">{progress}%</span>
          </div>

          {nextLesson ? (
            <button
              onClick={() => navigate(`/courses/${pathSlug}/lessons/${nextLesson.slug}`)}
              className="flex items-center px-3 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors min-h-[44px] text-sm"
            >
              <span className="hidden sm:inline">{language === 'en' ? 'Next' : 'ရှေ့သို့'}</span>
              <ChevronRight className="w-4 h-4 ml-1" />
            </button>
          ) : (
            <button
              onClick={() => navigate(`/courses/${pathSlug}`)}
              className="flex items-center px-3 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 transition-colors min-h-[44px] text-sm"
            >
              <CheckCircle className="w-4 h-4 mr-1" />
              <span className="hidden sm:inline">{language === 'en' ? 'Complete' : 'ပြီးဆုံး'}</span>
            </button>
          )}
        </div>
      </nav>
    </div>
  );
};

export default LessonDetail;