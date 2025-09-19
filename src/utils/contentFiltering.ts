import { UserType } from '../types/user';
import { JourneyPath, Module, Lesson } from '../types/journey';

/**
 * Content filtering utilities for user type-based content personalization
 */

export interface FilteredContent {
  journeyPaths: JourneyPath[];
  modules: Module[];
  lessons: Lesson[];
  totalCount: number;
  filteredCount: number;
  filterCriteria: {
    userType: UserType | null;
    includeAll: boolean;
  };
}

/**
 * Filter journey paths based on user type
 */
export const filterJourneyPaths = (
  paths: JourneyPath[], 
  userType: UserType | null
): JourneyPath[] => {
  if (!userType) {
    // If no user type, show only content marked for 'all'
    return paths.filter(path => 
      !path.targetAudience || path.targetAudience === 'all'
    );
  }

  return paths.filter(path => 
    !path.targetAudience || 
    path.targetAudience === 'all' || 
    path.targetAudience === userType
  );
};

/**
 * Filter modules within a journey path based on user type
 */
export const filterModules = (
  modules: Module[], 
  userType: UserType | null
): Module[] => {
  if (!userType) {
    return modules.filter(module => 
      !module.targetAudience || module.targetAudience === 'all'
    );
  }

  return modules.filter(module => 
    !module.targetAudience || 
    module.targetAudience === 'all' || 
    module.targetAudience === userType
  ).map(module => ({
    ...module,
    lessons: filterLessons(module.lessons, userType)
  }));
};

/**
 * Filter lessons based on user type
 */
export const filterLessons = (
  lessons: Lesson[], 
  userType: UserType | null
): Lesson[] => {
  if (!userType) {
    return lessons.filter(lesson => 
      !lesson.targetAudience || lesson.targetAudience === 'all'
    );
  }

  return lessons.filter(lesson => 
    !lesson.targetAudience || 
    lesson.targetAudience === 'all' || 
    lesson.targetAudience === userType
  );
};

/**
 * Get comprehensive filtered content for a user
 */
export const getFilteredContent = (
  allContent: {
    journeyPaths: JourneyPath[];
    modules: Module[];
    lessons: Lesson[];
  },
  userType: UserType | null
): FilteredContent => {
  const filteredJourneyPaths = filterJourneyPaths(allContent.journeyPaths, userType);
  const filteredModules = filterModules(allContent.modules, userType);
  const filteredLessons = filterLessons(allContent.lessons, userType);

  const totalCount = allContent.journeyPaths.length + allContent.modules.length + allContent.lessons.length;
  const filteredCount = filteredJourneyPaths.length + filteredModules.length + filteredLessons.length;

  return {
    journeyPaths: filteredJourneyPaths,
    modules: filteredModules,
    lessons: filteredLessons,
    totalCount,
    filteredCount,
    filterCriteria: {
      userType,
      includeAll: true
    }
  };
};

/**
 * Check if content should be visible to user based on target audience
 */
export const shouldShowContent = (
  targetAudience: 'all' | 'immigrant' | 'nonImmigrant' | undefined,
  userType: UserType | null
): boolean => {
  // Always show content marked for 'all' or without target audience
  if (!targetAudience || targetAudience === 'all') {
    return true;
  }

  // If no user type is set, only show 'all' content
  if (!userType) {
    return false;
  }

  // Show content that matches user's type
  return targetAudience === userType;
};

/**
 * Get content statistics for analytics
 */
export const getContentStats = (
  allContent: {
    journeyPaths: JourneyPath[];
    modules: Module[];
    lessons: Lesson[];
  },
  userType: UserType | null
) => {
  const filtered = getFilteredContent(allContent, userType);
  
  return {
    userType,
    totalAvailable: {
      journeyPaths: allContent.journeyPaths.length,
      modules: allContent.modules.length,
      lessons: allContent.lessons.length,
      total: filtered.totalCount
    },
    visibleToUser: {
      journeyPaths: filtered.journeyPaths.length,
      modules: filtered.modules.length,
      lessons: filtered.lessons.length,
      total: filtered.filteredCount
    },
    filterEffectiveness: {
      percentageFiltered: ((filtered.totalCount - filtered.filteredCount) / filtered.totalCount) * 100,
      contentReduction: filtered.totalCount - filtered.filteredCount
    }
  };
};