import { useState, useEffect } from 'react';
import { useUserType } from './useUserType';
import { fetchJourneyPaths } from '../lib/sanityClient';
import { UserType } from '../types/user';
import { JourneyPath } from '../types/journey';

interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  stats: {
    totalContent: number;
    filteredContent: number;
    filterEffectiveness: number;
  };
}

interface ContentValidationHook {
  validationResult: ValidationResult | null;
  isValidating: boolean;
  runValidation: () => Promise<void>;
  testUserType: (userType: UserType) => Promise<ValidationResult>;
}

export const useContentValidation = (): ContentValidationHook => {
  const { userType } = useUserType();
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [isValidating, setIsValidating] = useState(false);

  const validateContent = async (testUserType?: UserType): Promise<ValidationResult> => {
    const errors: string[] = [];
    const warnings: string[] = [];
    const typeToTest = testUserType || userType;

    try {
      // Test content fetching for the specified user type
      const testPaths = ['new-to-america', 'build-credit', 'housing-utilities', 'us-taxes'];
      
      // Fetch content for the user type
      const userContent = await fetchJourneyPaths(testPaths, typeToTest);
      
      // Fetch all content (no filtering)
      const allContent = await fetchJourneyPaths(testPaths, undefined);

      // Validate that content was fetched
      if (allContent.length === 0) {
        errors.push('No content found in Sanity - check your Sanity configuration and data');
      }

      // Validate filtering is working
      if (typeToTest && userContent.length === allContent.length) {
        warnings.push(`No content filtering detected for user type "${typeToTest}" - all content may be marked as "all"`);
      }

      // Validate targetAudience fields
      const pathsWithTargetAudience = allContent.filter(path => path.targetAudience);
      const pathsWithoutTargetAudience = allContent.filter(path => !path.targetAudience);

      if (pathsWithoutTargetAudience.length > 0) {
        warnings.push(`${pathsWithoutTargetAudience.length} journey paths missing targetAudience field`);
      }

      // Validate module and lesson filtering
      let totalModules = 0;
      let totalLessons = 0;
      let filteredModules = 0;
      let filteredLessons = 0;

      allContent.forEach(path => {
        if (path.modules) {
          totalModules += path.modules.length;
          path.modules.forEach(module => {
            if (module.lessons) {
              totalLessons += module.lessons.length;
            }
          });
        }
      });

      userContent.forEach(path => {
        if (path.modules) {
          filteredModules += path.modules.length;
          path.modules.forEach(module => {
            if (module.lessons) {
              filteredLessons += module.lessons.length;
            }
          });
        }
      });

      // Check for proper nested filtering
      if (totalModules > 0 && filteredModules === totalModules) {
        warnings.push('No module-level filtering detected');
      }

      if (totalLessons > 0 && filteredLessons === totalLessons) {
        warnings.push('No lesson-level filtering detected');
      }

      // Calculate filter effectiveness
      const filterEffectiveness = allContent.length > 0 
        ? ((allContent.length - userContent.length) / allContent.length) * 100 
        : 0;

      return {
        isValid: errors.length === 0,
        errors,
        warnings,
        stats: {
          totalContent: allContent.length,
          filteredContent: userContent.length,
          filterEffectiveness
        }
      };

    } catch (error) {
      errors.push(`Validation failed: ${error.message}`);
      return {
        isValid: false,
        errors,
        warnings,
        stats: {
          totalContent: 0,
          filteredContent: 0,
          filterEffectiveness: 0
        }
      };
    }
  };

  const runValidation = async () => {
    setIsValidating(true);
    try {
      const result = await validateContent();
      setValidationResult(result);
    } catch (error) {
      console.error('Validation error:', error);
    } finally {
      setIsValidating(false);
    }
  };

  const testUserType = async (testType: UserType): Promise<ValidationResult> => {
    return await validateContent(testType);
  };

  // Auto-run validation when user type changes
  useEffect(() => {
    if (userType) {
      runValidation();
    }
  }, [userType]);

  return {
    validationResult,
    isValidating,
    runValidation,
    testUserType
  };
};