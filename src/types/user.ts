// User type definitions for the onboarding and content filtering system

export type UserType = 'immigrant' | 'nonImmigrant';

export interface UserProfile {
  id: string;
  user_type: UserType;
  first_name?: string;
  last_name?: string;
  email?: string;
  country_of_origin?: string;
  immigration_year?: number;
  preferred_language?: 'en' | 'my';
  zip_code?: string;
  marital_status?: string;
  dependents?: number;
  employment_status?: string;
  life_goals?: string[];
  other_goal?: string;
  concerns?: string;
  created_at: string;
  updated_at: string;
}

export interface OnboardingData {
  userType: UserType;
  firstName: string;
  lastName: string;
  arrivalYear: number;
  countryOfOrigin: string;
  preferredLanguage: 'en' | 'my';
  zipCode: string;
  maritalStatus: string;
  dependents: number;
  employmentStatus: string;
  lifeGoals: string[];
  otherGoal?: string;
  concerns?: string;
}

// User type determination logic
export const determineUserType = (responses: {
  permanentResident: boolean;
  planToStayLongTerm: boolean;
  visaType?: string;
}): UserType => {
  // If user indicates they moved to live permanently or plan to stay long-term
  if (responses.permanentResident || responses.planToStayLongTerm) {
    return 'immigrant';
  }
  
  // Otherwise, they're here temporarily
  return 'nonImmigrant';
};

// Content filtering types
export interface ContentFilter {
  userType: UserType;
  includeAll: boolean;
}

export interface FilteredContent {
  modules: any[];
  journeyPaths: any[];
  totalCount: number;
  filteredCount: number;
}