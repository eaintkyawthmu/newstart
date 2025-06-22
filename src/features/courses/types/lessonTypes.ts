// Define lesson page types
export type LessonPage = 'intro' | 'content' | 'takeaways' | 'actions' | 'quiz';

export type QuizOption = {
  text: string;
  isCorrect: boolean;
};

export type QuizQuestion = {
  questionText: string;
  questionType: 'multipleChoice' | 'trueFalse';
  options: QuizOption[];
  correctAnswer?: boolean; // For trueFalse questions
  feedback?: string;
  practicalApplication?: string;
  followUpAction?: string;
};

export type QuizData = {
  title: string;
  scenario?: any; // PortableText content
  questions: QuizQuestion[];
  actionPlan?: any; // PortableText content
};

export type UserAnswer = {
  questionIndex: number;
  selectedOptionIndex?: number;
  trueFalseAnswer?: boolean;
};

export type QuizResult = {
  questionIndex: number;
  isCorrect: boolean;
  feedback?: string;
  practicalApplication?: string;
  followUpAction?: string;
};

export type Task = {
  _key: string;
  description: any; // PortableText content
  isOptional?: boolean;
};

export type LessonResource = {
  title: string;
  description?: string;
  url: string;
  type: 'download' | 'external';
  resourceType?: string;
};

export type ExerciseStep = {
  instruction: any; // PortableText content
  expectedOutcome?: string;
};

export type PracticalExercise = {
  _id: string;
  title: string;
  description: any; // PortableText content
  steps: ExerciseStep[];
  estimatedTime?: string;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
};