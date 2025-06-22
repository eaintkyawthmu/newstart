import React from 'react';
import { PortableText } from '@portabletext/react';
import { FileText, Award, AlertCircle, RefreshCw, CheckCircle } from 'lucide-react';
import { useLanguage } from '../../../../contexts/LanguageContext';

interface LessonQuizContentProps {
  lesson: any;
  userAnswers: any[];
  setUserAnswers: React.Dispatch<React.SetStateAction<any[]>>;
  quizSubmitted: boolean;
  setQuizSubmitted: React.Dispatch<React.SetStateAction<boolean>>;
  quizResults: any[];
  setQuizResults: React.Dispatch<React.SetStateAction<any[]>>;
  totalScore: number;
  setTotalScore: React.Dispatch<React.SetStateAction<number>>;
  language: string;
  trackEvent: (eventName: string, properties?: any) => void;
  startTime: Date;
  toggleCompletion: () => void;
}

const LessonQuizContent: React.FC<LessonQuizContentProps> = ({
  lesson,
  userAnswers,
  setUserAnswers,
  quizSubmitted,
  setQuizSubmitted,
  quizResults,
  setQuizResults,
  totalScore,
  setTotalScore,
  language,
  trackEvent,
  startTime,
  toggleCompletion
}) => {
  const { language: contextLanguage } = useLanguage();
  
  const handleAnswerChange = (questionIndex: number, value: number | boolean) => {
    setUserAnswers(prev => {
      const newAnswers = [...prev];
      
      if (typeof value === 'number') {
        // Multiple choice
        newAnswers[questionIndex] = {
          ...newAnswers[questionIndex],
          selectedOptionIndex: value,
          trueFalseAnswer: undefined
        };
      } else {
        // True/False
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
      
      if (question.questionType === 'multipleChoice' && userAnswer.selectedOptionIndex !== undefined) {
        // Check if the selected option is correct
        isCorrect = question.options[userAnswer.selectedOptionIndex]?.isCorrect || false;
      } else if (question.questionType === 'trueFalse' && userAnswer.trueFalseAnswer !== undefined) {
        // Check if the true/false answer is correct
        isCorrect = userAnswer.trueFalseAnswer === question.correctAnswer;
      }
      
      if (isCorrect) score++;
      
      results.push({
        questionIndex: index,
        isCorrect,
        feedback: question.feedback,
        practicalApplication: question.practicalApplication,
        followUpAction: question.followUpAction
      });
    });
    
    setQuizResults(results);
    setTotalScore(score);
    setQuizSubmitted(true);
    
    // Track quiz submission with analytics
    trackEvent('quiz_submitted', {
      lesson_id: lesson._id,
      lesson_title: lesson.title,
      score,
      total_questions: lesson.quiz.questions.length,
      passed: score / lesson.quiz.questions.length >= 0.7, // 70% passing threshold
      time_spent_seconds: Math.floor((new Date().getTime() - startTime.getTime()) / 1000)
    });
    
    // If the user scored well, mark the lesson as completed
    if (score / lesson.quiz.questions.length >= 0.7 && !quizSubmitted) {
      toggleCompletion();
    }
  };

  const handleRetakeQuiz = () => {
    setUserAnswers(lesson?.quiz?.questions && Array.isArray(lesson.quiz.questions) ? lesson.quiz.questions.map((_, index) => ({
      questionIndex: index,
      selectedOptionIndex: undefined,
      trueFalseAnswer: undefined
    })) : []);
    setQuizSubmitted(false);
    setQuizResults([]);
    setTotalScore(0);
  };

  if (!lesson?.quiz || !Array.isArray(lesson.quiz.questions) || lesson.quiz.questions.length === 0) {
    return (
      <div className="bg-gray-100 rounded-lg p-5 text-center">
        <FileText className="h-12 w-12 text-gray-400 mx-auto mb-3" />
        <p className="text-gray-600 font-medium">
          {language === 'en' ? 'Quiz content not available' : 'ဆစ်အကြောင်းအရာ မရရှိနိုင်ပါ'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
        <h2 className="text-lg font-semibold text-blue-800 mb-3 flex items-center">
          <FileText className="h-5 w-5 mr-2" />
          {lesson.quiz.title || (language === 'en' ? 'Knowledge Check' : 'အသိပညာ စစ်ဆေးခြင်း')}
        </h2>
        
        {/* Quiz scenario if available */}
        {lesson.quiz.scenario && (
          <div className="mb-4 prose max-w-none text-blue-700 text-sm">
            <PortableText value={Array.isArray(lesson.quiz.scenario) ? lesson.quiz.scenario : [lesson.quiz.scenario]} />
          </div>
        )}
        
        <p className="text-blue-700 text-sm">
          {language === 'en' 
            ? 'Test your understanding of the lesson material with this quiz.' 
            : 'ဤဆစ်ဖြင့် သင်ခန်းစာအကြောင်းအရာကို သင်နားလည်မှုကို စစ်ဆေးပါ။'}
        </p>
        
        {quizSubmitted && (
          <div className={`mt-4 p-4 rounded-lg ${
            totalScore / lesson.quiz.questions.length >= 0.7 
              ? 'bg-green-100 border border-green-200' 
              : 'bg-amber-100 border border-amber-200'
          }`}>
            <div className="flex items-center">
              {totalScore / lesson.quiz.questions.length >= 0.7 ? (
                <Award className="h-5 w-5 text-green-600 mr-2" />
              ) : (
                <AlertCircle className="h-5 w-5 text-amber-600 mr-2" />
              )}
              <div>
                <h3 className={`font-medium ${
                  totalScore / lesson.quiz.questions.length >= 0.7 ? 'text-green-800' : 'text-amber-800'
                }`}>
                  {totalScore / lesson.quiz.questions.length >= 0.7 
                    ? (language === 'en' ? 'Great job!' : 'အလုပ်ကောင်းပါသည်!')
                    : (language === 'en' ? 'Keep practicing!' : 'ဆက်လက်လေ့ကျင့်ပါ!')}
                </h3>
                <p className={`text-sm ${totalScore / lesson.quiz.questions.length >= 0.7 ? 'text-green-700' : 'text-amber-700'}`}>
                  {language === 'en' 
                    ? `You scored ${totalScore} out of ${lesson.quiz.questions.length} questions.`
                    : `သင်သည် မေးခွန်း ${lesson.quiz.questions.length} ခုအနက် ${totalScore} ခုကို မှန်ကန်စွာဖြေဆိုနိုင်ခဲ့သည်။`}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {lesson.quiz.questions.map((question: any, questionIndex: number) => (
        <div 
          key={questionIndex} 
          className={`p-4 rounded-lg border ${
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
          
          {question.questionType === 'multipleChoice' && Array.isArray(question.options) && (
            <div className="space-y-2">
              {question.options.map((option: any, optionIndex: number) => (
                <label 
                  key={optionIndex}
                  className={`flex items-center p-3 rounded-lg border ${
                    quizSubmitted
                      ? option.isCorrect
                        ? 'bg-green-100 border-green-300'
                        : userAnswers[questionIndex]?.selectedOptionIndex === optionIndex
                          ? 'bg-red-100 border-red-300'
                          : 'border-gray-200'
                      : userAnswers[questionIndex]?.selectedOptionIndex === optionIndex
                        ? 'bg-blue-50 border-blue-300'
                        : 'border-gray-200 hover:bg-gray-50'
                  } transition-colors cursor-pointer ${quizSubmitted ? 'cursor-default' : ''}`}
                >
                  <input
                    type="radio"
                    name={`question-${questionIndex}`}
                    value={optionIndex}
                    checked={userAnswers[questionIndex]?.selectedOptionIndex === optionIndex}
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
                        : userAnswers[questionIndex]?.trueFalseAnswer === value
                          ? 'bg-red-100 border-red-300'
                          : 'border-gray-200'
                      : userAnswers[questionIndex]?.trueFalseAnswer === value
                        ? 'bg-blue-50 border-blue-300'
                        : 'border-gray-200 hover:bg-gray-50'
                  } transition-colors cursor-pointer ${quizSubmitted ? 'cursor-default' : ''}`}
                >
                  <input
                    type="radio"
                    name={`question-${questionIndex}`}
                    checked={userAnswers[questionIndex]?.trueFalseAnswer === value}
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
          
          {quizSubmitted && (
            <div className="mt-4 space-y-3">
              {/* Feedback */}
              {quizResults[questionIndex]?.feedback && (
                <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-gray-700 text-sm">
                    <strong>{language === 'en' ? 'Feedback:' : 'တုံ့ပြန်ချက်:'}</strong> {quizResults[questionIndex].feedback}
                  </p>
                </div>
              )}
              
              {/* Practical Application */}
              {quizResults[questionIndex]?.practicalApplication && (
                <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-blue-700 text-sm">
                    <strong>{language === 'en' ? 'Real-world Application:' : 'လက်တွေ့အသုံးချမှု:'}</strong> {quizResults[questionIndex].practicalApplication}
                  </p>
                </div>
              )}
              
              {/* Follow-up Action */}
              {quizResults[questionIndex]?.followUpAction && (
                <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                  <p className="text-green-700 text-sm">
                    <strong>{language === 'en' ? 'Next Step:' : 'နောက်အဆင့်:'}</strong> {quizResults[questionIndex].followUpAction}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      ))}
      
      {/* Action Plan after quiz */}
      {quizSubmitted && lesson.quiz.actionPlan && (
        <div className="bg-purple-50 border border-purple-100 rounded-lg p-4 mt-6">
          <h3 className="font-semibold text-purple-800 mb-2">
            {language === 'en' ? 'Your Action Plan' : 'သင့်လုပ်ဆောင်ရန် အစီအစဉ်'}
          </h3>
          <div className="prose max-w-none text-purple-700 text-sm">
            <PortableText value={Array.isArray(lesson.quiz.actionPlan) ? lesson.quiz.actionPlan : [lesson.quiz.actionPlan]} />
          </div>
        </div>
      )}
      
      <div className="flex justify-center mt-5">
        {!quizSubmitted ? (
          <button
            onClick={handleSubmitQuiz}
            disabled={userAnswers.some(answer => 
              (answer.selectedOptionIndex === undefined && answer.trueFalseAnswer === undefined)
            )}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            <FileText className="h-5 w-5 mr-2" />
            {language === 'en' ? 'Submit Quiz' : 'ဆစ်ကို တင်သွင်းရန်'}
          </button>
        ) : (
          <button
            onClick={handleRetakeQuiz}
            className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center"
          >
            <RefreshCw className="h-5 w-5 mr-2" />
            {language === 'en' ? 'Retake Quiz' : 'ဆစ်ကို ပြန်လည်ဖြေဆိုရန်'}
          </button>
        )}
      </div>
    </div>
  );
};

export default LessonQuizContent;