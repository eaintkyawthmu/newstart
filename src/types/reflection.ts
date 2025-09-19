export interface Reflection {
  id: string;
  user_id: string;
  lesson_id: string;
  reflection_text: string;
  created_at: string;
  updated_at: string;
}

export interface ReflectionFormData {
  lessonId: string;
  reflectionText: string;
}

export interface ReflectionStats {
  totalReflections: number;
  reflectionsThisWeek: number;
  reflectionsThisMonth: number;
  averageLength: number;
  longestReflection: number;
  mostRecentReflection: Date | null;
}