import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';
import { sanityClient } from '../../lib/sanityClient';
import { JourneyPath as JourneyPathType, Module, Lesson } from '../../types/journey';
import {
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
  AlertCircle
} from 'lucide-react';

const JourneyPath = () => {
  const { pathId } = useParams();
  const navigate = useNavigate();
  const { language } = useLanguage();
  const [path, setPath] = useState<JourneyPathType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentModule, setCurrentModule] = useState<number>(0);
  const [currentLesson, setCurrentLesson] = useState<number>(0);

  useEffect(() => {
    loadPath();
  }, [pathId]);

  const loadPath = async () => {
    try {
      setLoading(true);
      setError(null);

      // Try to fetch from Sanity
      const data = await sanityClient.fetch(`
        *[_type == "journeyPath" && _id == $pathId][0] {
          _id,
          title,
          slug,
          description,
          coverImage {
            "url": asset->url,
            alt
          },
          duration,
          level,
          prerequisites,
          objectives,
          isPremium,
          modules[] {
            _id,
            title,
            description,
            order,
            duration,
            lessons[] {
              _id,
              title,
              description,
              order,
              type,
              content,
              duration
            }
          }
        }
      `, { pathId });

      if (data) {
        setPath(data);
      } else {
        // Fallback to mock data if Sanity fetch fails
        setPath({
          _id: 'mock-path',
          title: 'Financial Literacy 101',
          slug: 'financial-literacy-101',
          description: 'Learn the basics of personal finance and money management',
          coverImage: {
            url: 'https://images.pexels.com/photos/3943716/pexels-photo-3943716.jpeg',
            alt: 'Financial Planning'
          },
          duration: '4-6 weeks',
          level: 'beginner',
          objectives: [
            'Understand basic financial concepts',
            'Learn budgeting techniques',
            'Build credit knowledge'
          ],
          modules: [
            {
              _id: 'module-1',
              title: 'Getting Started',
              description: 'Introduction to personal finance',
              order: 1,
              duration: '1 week',
              lessons: [
                {
                  _id: 'lesson-1',
                  title: 'What is Personal Finance?',
                  description: 'Understanding the basics',
                  order: 1,
                  type: 'video',
                  content: {
                    videoUrl: 'https://example.com/video1.mp4',
                    transcript: 'Video transcript here...'
                  },
                  duration: '15 min'
                }
              ]
            }
          ],
          isPremium: false
        });
      }
    } catch (err) {
      console.error('Error loading path:', err);
      setError(err instanceof Error ? err.message : 'Failed to load journey path');
    } finally {
      setLoading(false);
    }
  };

  const renderLessonContent = (lesson: Lesson) => {
    switch (lesson.type) {
      case 'video':
        return (
          <div className="aspect-w-16 aspect-h-9 bg-gray-100 rounded-lg overflow-hidden">
            {lesson.content.videoUrl ? (
              <iframe
                src={lesson.content.videoUrl}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <PlayCircle className="h-16 w-16 text-gray-400" />
              </div>
            )}
          </div>
        );

      case 'article':
        return (
          <div className="prose max-w-none">
            <div dangerouslySetInnerHTML={{ __html: lesson.content.body || '' }} />
            {lesson.content.images?.map((image, index) => (
              <figure key={index} className="my-4">
                <img
                  src={image.url}
                  alt={image.alt}
                  className="rounded-lg shadow-md"
                />
                {image.caption && (
                  <figcaption className="text-sm text-gray-600 mt-2">
                    {image.caption}
                  </figcaption>
                )}
              </figure>
            ))}
          </div>
        );

      case 'quiz':
        return (
          <div className="space-y-6">
            {lesson.content.questions?.map((question, index) => (
              <div key={question._id} className="bg-white p-6 rounded-lg border border-gray-200">
                <h3 className="font-medium text-lg mb-4">
                  {index + 1}. {question.question}
                </h3>
                <div className="space-y-2">
                  {question.options.map((option, optionIndex) => (
                    <label
                      key={optionIndex}
                      className="flex items-center p-3 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer"
                    >
                      <input
                        type="radio"
                        name={`question-${question._id}`}
                        value={optionIndex}
                        className="h-4 w-4 text-blue-600"
                      />
                      <span className="ml-3">{option}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
        );

      default:
        return (
          <div className="text-center py-12">
            <HelpCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">Content type not supported</p>
          </div>
        );
    }
  };

  if (loading) {
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
        <h2 className="text-xl font-semibold text-gray-800 mb-2">Failed to load journey</h2>
        <p className="text-gray-600">{error || 'Journey path not found'}</p>
      </div>
    );
  }

  const currentModuleData = path.modules[currentModule];
  const currentLessonData = currentModuleData?.lessons[currentLesson];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Path Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl text-white p-8 mb-8">
        <div className="max-w-3xl">
          <h1 className="text-3xl font-bold mb-4">{path.title}</h1>
          <p className="text-xl text-blue-100 mb-6">{path.description}</p>
          
          <div className="flex flex-wrap gap-4 text-sm">
            <div className="flex items-center">
              <Clock className="h-5 w-5 mr-2" />
              <span>{path.duration}</span>
            </div>
            <div className="flex items-center">
              <Star className="h-5 w-5 mr-2" />
              <span>{path.level}</span>
            </div>
            {path.isPremium && (
              <div className="flex items-center">
                <Lock className="h-5 w-5 mr-2" />
                <span>Premium</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {currentLessonData && (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                {currentLessonData.title}
              </h2>
              <p className="text-gray-600 mb-6">{currentLessonData.description}</p>
              {renderLessonContent(currentLessonData)}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Module Navigation */}
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <h3 className="font-semibold text-gray-800 mb-4 flex items-center">
              <BookOpen className="h-5 w-5 text-blue-600 mr-2" />
              {language === 'en' ? 'Course Content' : 'သင်ခန်းစာ အကြောင်းအရာ'}
            </h3>
            
            <div className="space-y-4">
              {path.modules.map((module, moduleIndex) => (
                <div key={module._id}>
                  <button
                    onClick={() => setCurrentModule(moduleIndex)}
                    className={`w-full text-left p-3 rounded-lg transition-colors ${
                      moduleIndex === currentModule
                        ? 'bg-blue-50 text-blue-700'
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{module.title}</span>
                      <ChevronRight className="h-5 w-5" />
                    </div>
                    <p className="text-sm text-gray-500 mt-1">{module.duration}</p>
                  </button>

                  {moduleIndex === currentModule && (
                    <div className="mt-2 ml-4 space-y-2">
                      {module.lessons.map((lesson, lessonIndex) => (
                        <button
                          key={lesson._id}
                          onClick={() => setCurrentLesson(lessonIndex)}
                          className={`w-full text-left p-2 rounded-lg transition-colors ${
                            lessonIndex === currentLesson
                              ? 'bg-blue-50 text-blue-700'
                              : 'hover:bg-gray-50'
                          }`}
                        >
                          <div className="flex items-center">
                            {lesson.isCompleted ? (
                              <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                            ) : (
                              <div className="h-4 w-4 rounded-full border-2 border-gray-300 mr-2" />
                            )}
                            <span className="text-sm">{lesson.title}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Resources */}
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <h3 className="font-semibold text-gray-800 mb-4">
              {language === 'en' ? 'Resources' : 'အရင်းအမြစ်များ'}
            </h3>
            <div className="space-y-2">
              <a
                href="#"
                className="block p-3 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center text-gray-700">
                  <FileText className="h-4 w-4 mr-2" />
                  <span className="text-sm">Course Materials</span>
                </div>
              </a>
              <a
                href="#"
                className="block p-3 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center text-gray-700">
                  <FileText className="h-4 w-4 mr-2" />
                  <span className="text-sm">Additional Reading</span>
                </div>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JourneyPath;