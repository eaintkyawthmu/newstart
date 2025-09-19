import { PortableTextBlock } from '@portabletext/types';

export interface JourneyPath {
  _id: string;
  title: string;
  slug: string;
  description: PortableTextBlock[];
  whoIsItFor?: PortableTextBlock[];
  howItHelps?: PortableTextBlock[];
  coverImage?: {
    url: string;
    alt?: string;
  };
  duration: string;
  level: 'beginner' | 'intermediate' | 'advanced' | 'all-levels';
  prerequisites?: string[];
  objectives?: PortableTextBlock[]; 
  modules: Module[];
  isPremium: boolean;
  rating?: number;
  enrolled?: number;
  completionCriteria?: string[];
  practicalApplications?: PortableTextBlock[];
  targetAudience?: 'all' | 'immigrant' | 'nonImmigrant';
}

export interface Module {
  _id: string;
  title: string;
  description: string | PortableTextBlock[];
  order: number;
  duration: string;
  lessons: Lesson[];
  isCompleted?: boolean;
  targetAudience?: 'all' | 'immigrant' | 'nonImmigrant';
}

export interface Task {
  _key: string; // Sanity's unique key for array items
  description: PortableTextBlock[]; // Rich text description of the task
  isOptional?: boolean; // Whether this task is optional for completion
}

export interface Lesson {
  _id: string;
  title: string;
  description: string;
  order: number;
  type: 'video' | 'reading' | 'quiz' | 'exercise' | 'assessment';
  content: LessonContent;
  duration: string;
  slug: string;
  isCompleted?: boolean;
  targetAudience?: 'all' | 'immigrant' | 'nonImmigrant';
  
  // Video-specific fields
  videoType?: 'youtube' | 'selfhosted';
  youtubeVideoId?: string;
  selfHostedVideoUrl?: string;
  
  // Rich content fields
  introduction?: PortableTextBlock[];
  measurableDeliverables?: Task[]; // What you'll be able to do
  keyTakeaways?: PortableTextBlock[];
  actionableTasks?: Task[]; // Action plan
  lessonResources?: {
    title: string;
    description?: string;
    url: string;
    type: 'download' | 'external';
  }[];
  reflectionPrompts?: PortableTextBlock[];
  
  // Quiz data reference
  quiz?: {
    title: string;
    scenario?: PortableTextBlock[];
    questions: {
      questionText: string;
      questionType: 'multipleChoice' | 'trueFalse';
      options?: { text: string; isCorrect: boolean }[];
      correctAnswer?: boolean;
      feedback?: string;
      practicalApplication?: string;
      followUpAction?: string;
    }[];
    actionPlan?: PortableTextBlock[];
  };
  
  // Exercise reference
  associatedExercise?: {
    _id: string;
    title: string;
    description: PortableTextBlock[];
    steps: {
      instruction: PortableTextBlock[];
      expectedOutcome?: string;
    }[];
    estimatedTime?: string;
    difficulty?: 'beginner' | 'intermediate' | 'advanced';
  };
  
  // Parent module reference (for easier fetching)
  module?: {
    _id: string;
    title: string;
    order: number;
  };
}

export interface LessonContent {
  // Video lesson
  videoUrl?: string;
  transcript?: string;

  // Article lesson
  body?: string;
  images?: {
    url: string;
    caption: string;
    alt: string;
  }[];

  // Quiz lesson
  questions?: {
    _id: string;
    question: string;
    options: string[];
    correctAnswer: number;
    explanation: string;
  }[];

  // Interactive lesson
  interactiveType?: 'exercise' | 'simulation' | 'game';
  interactiveConfig?: Record<string, any>;
}

export interface Progress {
  userId: string;
  pathId: string;
  moduleId: string;
  lessonId: string;
  completed: boolean;
  score?: number;
  lastAttempt?: string;
}