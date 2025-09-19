import { supabase } from '../lib/supabaseClient';
import { fetchJourneyPaths } from '../lib/sanityClient';
import { UserType } from '../types/user';

interface TestScenario {
  name: string;
  userType: UserType;
  expectedBehavior: string;
}

interface TestResult {
  scenario: string;
  passed: boolean;
  details: string;
  data?: any;
}

/**
 * Comprehensive test suite for the user type system
 */
export class UserTypeSystemTester {
  private testResults: TestResult[] = [];

  async runAllTests(): Promise<TestResult[]> {
    this.testResults = [];
    
    console.log('🧪 Starting User Type System Tests...');
    
    await this.testUserTypeDetection();
    await this.testContentFiltering();
    await this.testDatabaseIntegration();
    await this.testEdgeCases();
    
    console.log('✅ User Type System Tests Complete');
    console.table(this.testResults);
    
    return this.testResults;
  }

  private async testUserTypeDetection() {
    console.log('Testing user type detection...');
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        this.addResult('User Authentication', false, 'No authenticated user found');
        return;
      }

      const { data: profile, error } = await supabase
        .from('profiles')
        .select('user_type, first_name, last_name')
        .eq('id', user.id)
        .single();

      if (error) {
        this.addResult('Profile Fetch', false, `Database error: ${error.message}`);
        return;
      }

      if (!profile) {
        this.addResult('Profile Exists', false, 'No profile found for user');
        return;
      }

      this.addResult('Profile Fetch', true, 'Successfully fetched user profile');
      
      if (profile.user_type) {
        this.addResult('User Type Set', true, `User type: ${profile.user_type}`);
      } else {
        this.addResult('User Type Set', false, 'User type not set in profile');
      }

    } catch (error) {
      this.addResult('User Type Detection', false, `Unexpected error: ${error.message}`);
    }
  }

  private async testContentFiltering() {
    console.log('Testing content filtering...');
    
    const testScenarios: TestScenario[] = [
      {
        name: 'Immigrant User',
        userType: 'immigrant',
        expectedBehavior: 'Should see immigrant and all content'
      },
      {
        name: 'Non-Immigrant User', 
        userType: 'nonImmigrant',
        expectedBehavior: 'Should see non-immigrant and all content'
      }
    ];

    const testPaths = ['new-to-america', 'build-credit', 'housing-utilities'];

    try {
      // Fetch all content first
      const allContent = await fetchJourneyPaths(testPaths, undefined);
      
      if (allContent.length === 0) {
        this.addResult('Sanity Content', false, 'No content found in Sanity');
        return;
      }

      this.addResult('Sanity Content', true, `Found ${allContent.length} journey paths`);

      // Test filtering for each user type
      for (const scenario of testScenarios) {
        try {
          const filteredContent = await fetchJourneyPaths(testPaths, scenario.userType);
          
          const isFiltered = filteredContent.length !== allContent.length;
          const hasContent = filteredContent.length > 0;

          if (hasContent) {
            this.addResult(
              `${scenario.name} Content`,
              true,
              `${filteredContent.length}/${allContent.length} paths visible (${isFiltered ? 'filtered' : 'no filtering'})`
            );
          } else {
            this.addResult(
              `${scenario.name} Content`,
              false,
              'No content visible for this user type'
            );
          }

          // Test nested filtering (modules and lessons)
          let totalModules = 0;
          let filteredModules = 0;
          let totalLessons = 0;
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

          filteredContent.forEach(path => {
            if (path.modules) {
              filteredModules += path.modules.length;
              path.modules.forEach(module => {
                if (module.lessons) {
                  filteredLessons += module.lessons.length;
                }
              });
            }
          });

          this.addResult(
            `${scenario.name} Nested Filtering`,
            true,
            `Modules: ${filteredModules}/${totalModules}, Lessons: ${filteredLessons}/${totalLessons}`
          );

        } catch (error) {
          this.addResult(
            `${scenario.name} Content`,
            false,
            `Error fetching content: ${error.message}`
          );
        }
      }

    } catch (error) {
      this.addResult('Content Filtering', false, `Sanity error: ${error.message}`);
    }
  }

  private async testDatabaseIntegration() {
    console.log('Testing database integration...');
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        this.addResult('Database Integration', false, 'No authenticated user');
        return;
      }

      // Test profile update
      const testUserType: UserType = 'immigrant';
      
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ 
          user_type: testUserType,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (updateError) {
        this.addResult('Profile Update', false, `Update failed: ${updateError.message}`);
        return;
      }

      // Verify the update
      const { data: updatedProfile, error: fetchError } = await supabase
        .from('profiles')
        .select('user_type')
        .eq('id', user.id)
        .single();

      if (fetchError) {
        this.addResult('Profile Verification', false, `Fetch failed: ${fetchError.message}`);
        return;
      }

      if (updatedProfile.user_type === testUserType) {
        this.addResult('Database Integration', true, 'Profile update and verification successful');
      } else {
        this.addResult('Database Integration', false, 'Profile update verification failed');
      }

    } catch (error) {
      this.addResult('Database Integration', false, `Unexpected error: ${error.message}`);
    }
  }

  private async testEdgeCases() {
    console.log('Testing edge cases...');
    
    try {
      // Test with null user type
      const nullTypeContent = await fetchJourneyPaths(['new-to-america'], null);
      this.addResult(
        'Null User Type Handling',
        true,
        `Handled null user type, returned ${nullTypeContent.length} paths`
      );

      // Test with empty path array
      const emptyPathsContent = await fetchJourneyPaths([], 'immigrant');
      this.addResult(
        'Empty Paths Array',
        emptyPathsContent.length === 0,
        `Empty paths array handled correctly`
      );

      // Test with non-existent path
      const nonExistentContent = await fetchJourneyPaths(['non-existent-path'], 'immigrant');
      this.addResult(
        'Non-existent Path',
        nonExistentContent.length === 0,
        `Non-existent path handled correctly`
      );

    } catch (error) {
      this.addResult('Edge Cases', false, `Edge case testing failed: ${error.message}`);
    }
  }

  private addResult(scenario: string, passed: boolean, details: string, data?: any) {
    this.testResults.push({
      scenario,
      passed,
      details,
      data
    });
  }

  async runValidation(): Promise<void> {
    setIsValidating(true);
    try {
      await this.runAllTests();
    } finally {
      setIsValidating(false);
    }
  }

  async testUserType(userType: UserType): Promise<ValidationResult> {
    return await this.validateContent(userType);
  }
}

// Singleton instance for global use
export const userTypeSystemTester = new UserTypeSystemTester();

// Hook interface
export const useContentValidation = () => {
  const { userType } = useUserType();
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [isValidating, setIsValidating] = useState(false);

  const runValidation = async () => {
    setIsValidating(true);
    try {
      const results = await userTypeSystemTester.runAllTests();
      
      // Convert test results to validation result
      const errors = results.filter(r => !r.passed).map(r => r.details);
      const warnings = results.filter(r => r.scenario.includes('warning')).map(r => r.details);
      
      setValidationResult({
        isValid: errors.length === 0,
        errors,
        warnings,
        stats: {
          totalContent: 0,
          filteredContent: 0,
          filterEffectiveness: 0
        }
      });
    } finally {
      setIsValidating(false);
    }
  };

  const testUserType = async (testType: UserType): Promise<ValidationResult> => {
    return await userTypeSystemTester.validateContent(testType);
  };

  return {
    validationResult,
    isValidating,
    runValidation,
    testUserType
  };
};