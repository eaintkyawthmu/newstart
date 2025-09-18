import React, { useState, useEffect } from 'react';
import { PortableText } from '@portabletext/react';
import { 
  CheckCircle, 
  AlertCircle, 
  ChevronRight, 
  BookOpen, 
  Target, 
  Lightbulb,
  FileText,
  ExternalLink,
  Download,
  ChevronLeft,
  RefreshCw,
  Award,
  Clock,
  List,
  PlayCircle
} from 'lucide-react';
import { sampleLesson } from '../data/sampleLesson';

// Define lesson page types
type LessonPage = 'intro' | 'learn' | 'takeaways' | 'actions' | 'quiz' | 'exercise';

const LessonViewer: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<LessonPage>('intro');
  const [completedTasks, setCompletedTasks] = useState<string[]>([]);
  const [lessonCompleted, setLessonCompleted] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  
  // Quiz state
  const [userAnswers, setUserAnswers] = useState<{questionIndex: number, answer: number | boolean}[]>([]);
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizResults, setQuizResults] = useState<{questionIndex: number, isCorrect: boolean, feedback?: string}[]>([]);
  const [totalScore, setTotalScore] = useState(0);

  useEffect(() => {
    // Initialize quiz state if this is a quiz lesson
    if (sampleLesson.quiz?.questions) {
      const initialAnswers = sampleLesson.quiz.questions.map((_, index) => ({
        questionIndex: index,
        answer: undefined
      }));
      setUserAnswers(initialAnswers);
    }
  }, []);

  const handleTaskCompletion = (taskKey: string, isCompleted: boolean) => {
    if (isCompleted) {
      setCompletedTasks(prev => [...prev, taskKey]);
    } else {
      setCompletedTasks(prev => prev.filter(key => key !== taskKey));
    }
  };

  const handleMarkLessonComplete = () => {
    // Check if all required tasks are completed
    const requiredDeliverables = sampleLesson.measurableDeliverables.filter(task => !task.isOptional);
    const requiredTasks = sampleLesson.actionableTasks.filter(task => !task.isOptional);
    
    const allRequiredDeliverables = requiredDeliverables.every(task => 
      completedTasks.includes(task._key)
    );
    
    const allRequiredTasks = requiredTasks.every(task => 
      completedTasks.includes(task._key)
    );
    
    if (allRequiredDeliverables && allRequiredTasks) {
      setLessonCompleted(true);
    } else {
      alert('Please complete all required tasks before marking the lesson as complete.');
    }
  };

  // Calculate progress
  const totalTasks = sampleLesson.measurableDeliverables.length + sampleLesson.actionableTasks.length;
  const progress = totalTasks > 0 ? Math.round((completedTasks.length / totalTasks) * 100) : 0;

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

  // Get available pages for this lesson
  const getAvailablePages = (): LessonPage[] => {
    const pages: LessonPage[] = [];
    
    // Introduction is always available
    pages.push('intro');
    
    // Learn page is available if there's content
    if (sampleLesson.content) {
      pages.push('learn');
    }
    
    // Takeaways page is available if there are key takeaways
    if (sampleLesson.keyTakeaways) {
      pages.push('takeaways');
    }
    
    // Actions page is available if there are action items or resources
    if (sampleLesson.actionableTasks?.length > 0 || sampleLesson.lessonResources?.length > 0) {
      pages.push('actions');
    }
    
    // Quiz page is available if there's a quiz
    if (sampleLesson.quiz?.questions?.length > 0) {
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

  // Handle quiz answer selection
  const handleAnswerChange = (questionIndex: number, answer: number | boolean) => {
    setUserAnswers(prev => {
      const newAnswers = [...prev];
      newAnswers[questionIndex] = { questionIndex, answer };
      return newAnswers;
    });
  };

  // Handle quiz submission
  const handleSubmitQuiz = () => {
    if (!sampleLesson.quiz?.questions) return;
    
    const results = [];
    let score = 0;
    
    for (let i = 0; i < sampleLesson.quiz.questions.length; i++) {
      const question = sampleLesson.quiz.questions[i];
      const userAnswer = userAnswers[i]?.answer;
      let isCorrect = false;
      
      if (question.questionType === 'multipleChoice' && typeof userAnswer === 'number') {
        isCorrect = question.options[userAnswer]?.isCorrect || false;
      } else if (question.questionType === 'trueFalse' && typeof userAnswer === 'boolean') {
        isCorrect = userAnswer === question.correctAnswer;
      }
      
      if (isCorrect) score++;
      
      results.push({
        questionIndex: i,
        isCorrect,
        feedback: question.feedback
      });
    }
    
    setQuizResults(results);
    setTotalScore(score);
    setQuizSubmitted(true);
  };

  // Handle quiz retake
  const handleRetakeQuiz = () => {
    setUserAnswers(sampleLesson.quiz?.questions?.map((_, index) => ({
      questionIndex: index,
      answer: undefined
    })) || []);
    setQuizSubmitted(false);
    setQuizResults([]);
    setTotalScore(0);
  };

  // Get page title
  const getPageTitle = (): string => {
    switch (currentPage) {
      case 'intro':
        return 'Introduction';
      case 'learn':
        return 'Lesson Content';
      case 'takeaways':
        return 'Key Takeaways';
      case 'actions':
        return 'Action Plan';
      case 'quiz':
        return 'Knowledge Check';
      case 'exercise':
        return 'Practical Exercise';
      default:
        return '';
    }
  };

  // Get page icon
  const getPageIcon = () => {
    switch (currentPage) {
      case 'intro':
        return <BookOpen className="h-5 w-5 text-blue-600" />;
      case 'learn':
        return <PlayCircle className="h-5 w-5 text-blue-600" />;
      case 'takeaways':
        return <Lightbulb className="h-5 w-5 text-green-600" />;
      case 'actions':
        return <Target className="h-5 w-5 text-purple-600" />;
      case 'quiz':
        return <FileText className="h-5 w-5 text-amber-600" />;
      case 'exercise':
        return <List className="h-5 w-5 text-indigo-600" />;
      default:
        return null;
    }
  };

  // Render the current page content
  const renderPageContent = () => {
    switch (currentPage) {
      case 'intro':
        return (
          <div className="space-y-6">
            {/* Introduction */}
            <div className="prose max-w-none">
              <PortableText value={sampleLesson.introduction} />
            </div>
            
            {/* Measurable Deliverables */}
            <div className="bg-blue-50 border border-blue-100 rounded-lg p-5">
              <h2 className="font-semibold text-blue-800 mb-4 flex items-center">
                <Target className="h-5 w-5 mr-2" />
                What You'll Achieve
              </h2>
              <div className="space-y-3">
                {sampleLesson.measurableDeliverables.map((deliverable) => (
                  <label key={deliverable._key} className="flex items-start space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={completedTasks.includes(deliverable._key)}
                      onChange={(e) => handleTaskCompletion(deliverable._key, e.target.checked)}
                      className="h-5 w-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500 flex-shrink-0 mt-1"
                    />
                    <div className={`text-gray-700 ${completedTasks.includes(deliverable._key) ? 'line-through text-gray-500' : ''}`}>
                      <PortableText value={deliverable.description} />
                    </div>
                    {!deliverable.isOptional && (
                      <span className="ml-auto px-2 py-0.5 bg-red-100 text-red-800 text-xs rounded-full flex-shrink-0">
                        Required
                      </span>
                    )}
                  </label>
                ))}
              </div>
            </div>
          </div>
        );
      
      case 'learn':
        return (
          <div className="space-y-6">
            {/* Main Content */}
            <div className="prose max-w-none">
              <PortableText value={sampleLesson.content} />
            </div>
          </div>
        );
      
      case 'takeaways':
        return (
          <div className="space-y-6">
            {/* Key Takeaways */}
            <div className="bg-green-50 border border-green-100 rounded-lg p-5">
              <h2 className="font-semibold text-green-800 mb-4 flex items-center">
                <Lightbulb className="h-5 w-5 mr-2" />
                Key Takeaways
              </h2>
              <div className="space-y-2 text-green-700">
                <PortableText value={sampleLesson.keyTakeaways} />
              </div>
            </div>
            
            {/* Reflection Prompts */}
            {sampleLesson.reflectionPrompts && (
              <div className="bg-amber-50 border border-amber-100 rounded-lg p-5 mt-6">
                <h2 className="font-semibold text-amber-800 mb-4">Reflect & Grow</h2>
                <div className="space-y-3 text-amber-700">
                  <PortableText value={sampleLesson.reflectionPrompts} />
                </div>
              </div>
            )}
          </div>
        );
      
      case 'actions':
        return (
          <div className="space-y-6">
            {/* Action Items */}
            <div className="bg-purple-50 border border-purple-100 rounded-lg p-5">
              <h2 className="font-semibold text-purple-800 mb-4 flex items-center">
                <Target className="h-5 w-5 mr-2" />
                Your Action Plan
              </h2>
              <div className="space-y-3">
                {sampleLesson.actionableTasks.map((task) => (
                  <label key={task._key} className="flex items-start space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={completedTasks.includes(task._key)}
                      onChange={(e) => handleTaskCompletion(task._key, e.target.checked)}
                      className="h-5 w-5 text-purple-600 rounded border-gray-300 focus:ring-purple-500 flex-shrink-0 mt-1"
                    />
                    <div className={`text-gray-700 ${completedTasks.includes(task._key) ? 'line-through text-gray-500' : ''}`}>
                      <PortableText value={task.description} />
                    </div>
                    {!task.isOptional && (
                      <span className="ml-auto px-2 py-0.5 bg-red-100 text-red-800 text-xs rounded-full flex-shrink-0">
                        Required
                      </span>
                    )}
                  </label>
                ))}
              </div>
            </div>

            {/* Resources */}
            {sampleLesson.lessonResources && sampleLesson.lessonResources.length > 0 && (
              <div className="border border-gray-200 rounded-lg p-5 mt-6">
                <h2 className="font-semibold text-gray-800 mb-4">Additional Resources</h2>
                <div className="space-y-3">
                  {sampleLesson.lessonResources.map((resource, index) => (
                    <a
                      key={index}
                      href={resource.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      {resource.type === 'download' ? (
                        <Download className="h-5 w-5 text-gray-500 mr-3" />
                      ) : (
                        <ExternalLink className="h-5 w-5 text-gray-500 mr-3" />
                      )}
                      <div>
                        <p className="font-medium text-gray-800">{resource.title}</p>
                        {resource.description && (
                          <p className="text-sm text-gray-600">{resource.description}</p>
                        )}
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      
      case 'quiz':
        return (
          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-100 rounded-lg p-5">
              <h2 className="text-lg font-semibold text-blue-800 mb-3 flex items-center">
                <FileText className="h-5 w-5 mr-2" />
                {sampleLesson.quiz?.title || 'Knowledge Check'}
              </h2>
              <p className="text-blue-700 mb-4">
                Test your understanding of the lesson material with this quiz.
              </p>
              
              {quizSubmitted && (
                <div className={`mt-4 p-4 rounded-lg ${
                  totalScore / sampleLesson.quiz.questions.length >= 0.7 
                    ? 'bg-green-100 border border-green-200' 
                    : 'bg-amber-100 border border-amber-200'
                }`}>
                  <div className="flex items-center">
                    {totalScore / sampleLesson.quiz.questions.length >= 0.7 ? (
                      <Award className="h-5 w-5 text-green-600 mr-2" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-amber-600 mr-2" />
                    )}
                    <div>
                      <h3 className={`font-medium ${
                        totalScore / sampleLesson.quiz.questions.length >= 0.7 ? 'text-green-800' : 'text-amber-800'
                      }`}>
                        {totalScore / sampleLesson.quiz.questions.length >= 0.7 
                          ? 'Great job!' 
                          : 'Keep practicing!'}
                      </h3>
                      <p className={`text-sm ${totalScore / sampleLesson.quiz.questions.length >= 0.7 ? 'text-green-700' : 'text-amber-700'}`}>
                        You scored {totalScore} out of {sampleLesson.quiz.questions.length} questions.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            {sampleLesson.quiz?.questions.map((question, questionIndex) => (
              <div 
                key={questionIndex} 
                className={`p-5 rounded-lg border ${
                  quizSubmitted 
                    ? quizResults[questionIndex]?.isCorrect 
                      ? 'bg-green-50 border-green-200' 
                      : 'bg-red-50 border-red-200'
                    : 'bg-white border-gray-200'
                }`}
              >
                <h3 className="text-base font-medium text-gray-800 mb-3">
                  {questionIndex + 1}. {question.questionText}
                </h3>
                
                {question.questionType === 'multipleChoice' && (
                  <div className="space-y-2">
                    {question.options.map((option, optionIndex) => (
                      <label 
                        key={optionIndex}
                        className={`flex items-center p-3 rounded-lg border ${
                          quizSubmitted
                            ? option.isCorrect
                              ? 'bg-green-100 border-green-300'
                              : userAnswers[questionIndex]?.answer === optionIndex
                                ? 'bg-red-100 border-red-300'
                                : 'border-gray-200'
                            : userAnswers[questionIndex]?.answer === optionIndex
                              ? 'bg-blue-50 border-blue-300'
                              : 'border-gray-200 hover:bg-gray-50'
                        } transition-colors cursor-pointer ${quizSubmitted ? 'cursor-default' : ''}`}
                      >
                        <input
                          type="radio"
                          name={`question-${questionIndex}`}
                          checked={userAnswers[questionIndex]?.answer === optionIndex}
                          onChange={() => !quizSubmitted && handleAnswerChange(questionIndex, optionIndex)}
                          className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                          disabled={quizSubmitted}
                        />
                        <span className="ml-3 text-sm">{option.text}</span>
                        
                        {quizSubmitted && option.isCorrect && (
                          <CheckCircle className="ml-auto h-4 w-4 text-green-600" />
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
                        className={`flex items-center p-3 rounded-lg border ${
                          quizSubmitted
                            ? value === question.correctAnswer
                              ? 'bg-green-100 border-green-300'
                              : userAnswers[questionIndex]?.answer === value
                                ? 'bg-red-100 border-red-300'
                                : 'border-gray-200'
                            : userAnswers[questionIndex]?.answer === value
                              ? 'bg-blue-50 border-blue-300'
                              : 'border-gray-200 hover:bg-gray-50'
                        } transition-colors cursor-pointer ${quizSubmitted ? 'cursor-default' : ''}`}
                      >
                        <input
                          type="radio"
                          name={`question-${questionIndex}`}
                          checked={userAnswers[questionIndex]?.answer === value}
                          onChange={() => !quizSubmitted && handleAnswerChange(questionIndex, value)}
                          className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                          disabled={quizSubmitted}
                        />
                        <span className="ml-3 text-sm">{value ? 'True' : 'False'}</span>
                        
                        {quizSubmitted && value === question.correctAnswer && (
                          <CheckCircle className="ml-auto h-4 w-4 text-green-600" />
                        )}
                      </label>
                    ))}
                  </div>
                )}
                
                {quizSubmitted && quizResults[questionIndex]?.feedback && (
                  <div className="mt-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="text-gray-700 text-sm">
                      <strong>Feedback:</strong> {quizResults[questionIndex].feedback}
                    </p>
                  </div>
                )}
              </div>
            ))}
            
            <div className="flex justify-center mt-6">
              {!quizSubmitted ? (
                <button
                  onClick={handleSubmitQuiz}
                  disabled={userAnswers.some(answer => answer.answer === undefined)}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  <FileText className="h-5 w-5 mr-2" />
                  Submit Quiz
                </button>
              ) : (
                <button
                  onClick={handleRetakeQuiz}
                  className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center"
                >
                  <RefreshCw className="h-5 w-5 mr-2" />
                  Retake Quiz
                </button>
              )}
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  const availablePages = getAvailablePages();
  const currentPageIndex = availablePages.indexOf(currentPage);

  return (
    <div 
      className="max-w-4xl mx-auto"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">{sampleLesson.title}</h1>
        <div className="flex items-center text-sm text-gray-600 mb-4">
          <span className="mr-4">{sampleLesson.duration}</span>
          <span>{sampleLesson.module.title}</span>
        </div>
        
        {/* Progress bar */}
        <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
          <div 
            className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex justify-between text-sm text-gray-600">
          <span>{completedTasks.length} of {totalTasks} tasks completed</span>
          <span>{progress}% complete</span>
        </div>
      </div>

      {/* Page Navigation Tabs */}
      <div className="mb-6 border-b border-gray-200 overflow-x-auto hide-scrollbar">
        <div className="flex">
          {availablePages.map((page) => (
            <button
              key={page}
              onClick={() => goToPage(page)}
              className={`px-4 py-3 font-medium text-sm border-b-2 whitespace-nowrap ${
                currentPage === page
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {page === 'intro' && 'Introduction'}
              {page === 'learn' && 'Lesson Content'}
              {page === 'takeaways' && 'Key Takeaways'}
              {page === 'actions' && 'Action Plan'}
              {page === 'quiz' && 'Knowledge Check'}
              {page === 'exercise' && 'Practice Exercise'}
            </button>
          ))}
        </div>
      </div>

      {/* Current Page Title - Mobile Only */}
      <div className="md:hidden flex items-center mb-4">
        {getPageIcon()}
        <h2 className="ml-2 text-lg font-semibold text-gray-800">{getPageTitle()}</h2>
      </div>

      {/* Page Content */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm mb-6 overflow-y-auto max-h-[70vh]">
        {renderPageContent()}
      </div>

      {/* Page Navigation Dots - Mobile Only */}
      <div className="md:hidden flex justify-center mb-4 space-x-2">
        {availablePages.map((page, index) => (
          <button
            key={page}
            onClick={() => goToPage(page)}
            className={`w-2.5 h-2.5 rounded-full ${
              currentPage === page ? 'bg-blue-600' : 'bg-gray-300'
            }`}
            aria-label={`Go to page ${index + 1}`}
          />
        ))}
      </div>

      {/* Page Navigation Buttons */}
      <div className="flex justify-between mb-8">
        <button
          onClick={handlePrevPage}
          disabled={currentPageIndex === 0}
          className={`flex items-center px-4 py-2 rounded-lg border border-gray-300 text-gray-700 ${
            currentPageIndex === 0 
              ? 'opacity-50 cursor-not-allowed' 
              : 'hover:bg-gray-50'
          }`}
        >
          <ChevronLeft className="h-5 w-5 mr-1" />
          <span className="hidden md:inline">Previous</span>
        </button>

        {currentPageIndex === availablePages.length - 1 ? (
          <button
            onClick={handleMarkLessonComplete}
            disabled={lessonCompleted}
            className={`flex items-center px-6 py-2 rounded-lg ${
              lessonCompleted
                ? 'bg-green-100 text-green-700 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {lessonCompleted ? (
              <>
                <CheckCircle className="h-5 w-5 mr-2" />
                Lesson Completed
              </>
            ) : (
              'Mark Lesson Complete'
            )}
          </button>
        ) : (
          <button
            onClick={handleNextPage}
            className="flex items-center px-6 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
          >
            <span className="hidden md:inline">Continue</span>
            <span className="md:hidden">Next</span>
            <ChevronRight className="h-5 w-5 ml-1" />
          </button>
        )}
      </div>
    </div>
  );
};

export default LessonViewer;