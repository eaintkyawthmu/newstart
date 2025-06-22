import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabaseClient';
import {
  UserCircle,
  Globe,
  Calendar,
  Users,
  MapPin,
  FileText,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  GraduationCap
} from 'lucide-react';

type ProfileData = {
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
  ssnLastFour?: string;
  idLastFour?: string;
  phoneNumber?: string;
  streetAddress?: string;
  hasSsn: boolean;
  hasPhone: boolean;
  hasHousing: boolean;
  concerns?: string;
};

const ProfileSetupPage = () => {
  const navigate = useNavigate();
  const { user, refreshProfileStatus } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<ProfileData>({
    firstName: '',
    lastName: '',
    arrivalYear: new Date().getFullYear(),
    countryOfOrigin: '',
    preferredLanguage: 'en',
    zipCode: '',
    maritalStatus: 'Single',
    dependents: 0,
    employmentStatus: 'Not working yet',
    lifeGoals: [],
    hasSsn: false,
    hasPhone: false,
    hasHousing: false
  });

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }

    const loadProfile = async () => {
      try {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (error) throw error;

        if (profile) {
          setData({
            firstName: profile.first_name || '',
            lastName: profile.last_name || '',
            arrivalYear: profile.immigration_year || new Date().getFullYear(),
            countryOfOrigin: profile.country_of_origin || '',
            preferredLanguage: profile.preferred_language || 'en',
            zipCode: profile.zip_code || '',
            maritalStatus: profile.marital_status || 'Single',
            dependents: profile.dependents || 0,
            employmentStatus: profile.employment_status || 'Not working yet',
            lifeGoals: profile.life_goals || [],
            otherGoal: profile.other_goal || '',
            ssnLastFour: profile.ssn_last_four || '',
            idLastFour: profile.id_last_four || '',
            phoneNumber: profile.phone_number || '',
            streetAddress: profile.street_address || '',
            hasSsn: profile.has_ssn || false,
            hasPhone: profile.has_phone || false,
            hasHousing: profile.has_housing || false,
            concerns: profile.concerns || ''
          });
        }
      } catch (err) {
        console.error('Error loading profile:', err);
        setError(err instanceof Error ? err.message : 'Failed to load profile data');
      } finally {
        setInitialLoading(false);
      }
    };

    loadProfile();
  }, [user, navigate]);

  const totalSteps = 4;
  const progress = (currentStep / totalSteps) * 100;

  const lifeGoalsOptions = [
    { id: 'family', label: 'Build a better life for my family' },
    { id: 'home', label: 'Buy a home' },
    { id: 'job', label: 'Get a job' },
    { id: 'business', label: 'Start a business' },
    { id: 'education', label: 'Send kids to college' },
    { id: 'retirement', label: 'Save for retirement' }
  ];

  const employmentOptions = [
    { value: 'not_working', label: 'Not working yet' },
    { value: 'looking', label: 'Looking for a job' },
    { value: 'student', label: 'Student' },
    { value: 'w2', label: 'W-2 Employee' },
    { value: '1099', label: '1099/Gig/Business Owner' }
  ];

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(prev => prev + 1);
    } else {
      saveProfile();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const saveProfile = async () => {
    if (!user) return;
    
    setLoading(true);
    setError(null);

    try {
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          first_name: data.firstName,
          last_name: data.lastName,
          immigration_year: data.arrivalYear,
          country_of_origin: data.countryOfOrigin,
          preferred_language: data.preferredLanguage,
          zip_code: data.zipCode,
          marital_status: data.maritalStatus,
          dependents: data.dependents,
          employment_status: data.employmentStatus,
          life_goals: data.lifeGoals,
          other_goal: data.otherGoal,
          ssn_last_four: data.ssnLastFour,
          id_last_four: data.idLastFour,
          phone_number: data.phoneNumber,
          street_address: data.streetAddress,
          has_ssn: data.hasSsn,
          has_phone: data.hasPhone,
          has_housing: data.hasHousing,
          concerns: data.concerns,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (updateError) throw updateError;
      
      // Add a delay to ensure Supabase has time to commit the changes
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Refresh the profile status in AuthContext
      await refreshProfileStatus();
      
      // Navigate to dashboard
      navigate('/dashboard');
    } catch (err) {
      console.error('Error saving profile:', err);
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="flex items-center space-x-3 mb-6">
              <UserCircle className="h-8 w-8 text-blue-600" />
              <h2 className="text-2xl font-semibold text-gray-800">Personal Information</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  First Name*
                </label>
                <input
                  type="text"
                  required
                  value={data.firstName}
                  onChange={(e) => setData(prev => ({
                    ...prev,
                    firstName: e.target.value
                  }))}
                  className="block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Last Name*
                </label>
                <input
                  type="text"
                  required
                  value={data.lastName}
                  onChange={(e) => setData(prev => ({
                    ...prev,
                    lastName: e.target.value
                  }))}
                  className="block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Country of Origin*
              </label>
              <div className="relative">
                <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  required
                  value={data.countryOfOrigin}
                  onChange={(e) => setData(prev => ({
                    ...prev,
                    countryOfOrigin: e.target.value
                  }))}
                  className="block w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your country of origin"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Year of Arrival*
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="number"
                  required
                  min="1900"
                  max={new Date().getFullYear()}
                  value={data.arrivalYear}
                  onChange={(e) => setData(prev => ({
                    ...prev,
                    arrivalYear: parseInt(e.target.value) || new Date().getFullYear()
                  }))}
                  className="block w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ZIP Code*
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  required
                  value={data.zipCode}
                  onChange={(e) => setData(prev => ({
                    ...prev,
                    zipCode: e.target.value
                  }))}
                  className="block w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your ZIP code"
                />
              </div>
              <p className="mt-1 text-sm text-gray-500">
                To help locate resources near you
              </p>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="flex items-center space-x-3 mb-6">
              <Users className="h-8 w-8 text-blue-600" />
              <h2 className="text-2xl font-semibold text-gray-800">Family Information</h2>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Marital Status
              </label>
              <select
                value={data.maritalStatus}
                onChange={(e) => setData(prev => ({
                  ...prev,
                  maritalStatus: e.target.value
                }))}
                className="block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="Single">Single</option>
                <option value="Married">Married</option>
                <option value="Divorced">Divorced</option>
                <option value="Widowed">Widowed</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Number of Dependents
              </label>
              <input
                type="number"
                min="0"
                value={data.dependents}
                onChange={(e) => setData(prev => ({
                  ...prev,
                  dependents: parseInt(e.target.value) || 0
                }))}
                className="block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="mt-1 text-sm text-gray-500">
                Include children, elderly parents, or others you support
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Employment Status
              </label>
              <select
                value={data.employmentStatus}
                onChange={(e) => setData(prev => ({
                  ...prev,
                  employmentStatus: e.target.value
                }))}
                className="block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {employmentOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="flex items-center space-x-3 mb-6">
              <FileText className="h-8 w-8 text-blue-600" />
              <h2 className="text-2xl font-semibold text-gray-800">Document Information</h2>
            </div>

            <p className="text-gray-600 mb-6">
              Optional: Do you already have these important documents? (Leave blank if not — we'll help you get them in your journey.)
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Last 4 digits of SSN (optional)
                </label>
                <input
                  type="text"
                  maxLength={4}
                  pattern="[0-9]*"
                  value={data.ssnLastFour || ''}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '');
                    setData(prev => ({
                      ...prev,
                      ssnLastFour: value
                    }));
                  }}
                  className="block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Last 4 digits of CA State ID/Driver's License (optional)
                </label>
                <input
                  type="text"
                  maxLength={4}
                  pattern="[0-9]*"
                  value={data.idLastFour || ''}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '');
                    setData(prev => ({
                      ...prev,
                      idLastFour: value
                    }));
                  }}
                  className="block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  U.S. Phone Number
                </label>
                <input
                  type="tel"
                  value={data.phoneNumber || ''}
                  onChange={(e) => setData(prev => ({
                    ...prev,
                    phoneNumber: e.target.value
                  }))}
                  className="block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="(123) 456-7890"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Current U.S. Address (Street + ZIP, optional)
                </label>
                <input
                  type="text"
                  value={data.streetAddress || ''}
                  onChange={(e) => setData(prev => ({
                    ...prev,
                    streetAddress: e.target.value
                  }))}
                  className="block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Street address"
                />
              </div>

              <div className="pt-6">
                <h3 className="font-medium text-gray-800 mb-4">Current Status</h3>
                <div className="space-y-3">
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={data.hasSsn}
                      onChange={(e) => setData(prev => ({
                        ...prev,
                        hasSsn: e.target.checked
                      }))}
                      className="h-5 w-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                    />
                    <span className="text-gray-700">I already applied for SSN</span>
                  </label>

                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={data.hasPhone}
                      onChange={(e) => setData(prev => ({
                        ...prev,
                        hasPhone: e.target.checked
                      }))}
                      className="h-5 w-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                    />
                    <span className="text-gray-700">I already have a U.S. phone number</span>
                  </label>

                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={data.hasHousing}
                      onChange={(e) => setData(prev => ({
                        ...prev,
                        hasHousing: e.target.checked
                      }))}
                      className="h-5 w-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                    />
                    <span className="text-gray-700">I have my own place (rented or owned)</span>
                  </label>
                </div>
              </div>

              <div className="pt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Is there anything you're worried about or unsure of?
                </label>
                <textarea
                  value={data.concerns || ''}
                  onChange={(e) => setData(prev => ({
                    ...prev,
                    concerns: e.target.value
                  }))}
                  rows={4}
                  className="block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Share your concerns or questions..."
                />
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="flex items-center space-x-3 mb-6">
              <GraduationCap className="h-8 w-8 text-blue-600" />
              <h2 className="text-2xl font-semibold text-gray-800">Goals & Aspirations</h2>
            </div>

            <div className="space-y-4">
              <p className="text-gray-600">
                Select your main goals for the next few years:
              </p>

              <div className="space-y-3">
                {lifeGoalsOptions.map(goal => (
                  <label key={goal.id} className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={data.lifeGoals.includes(goal.id)}
                      onChange={(e) => {
                        setData(prev => ({
                          ...prev,
                          lifeGoals: e.target.checked
                            ? [...prev.lifeGoals, goal.id]
                            : prev.lifeGoals.filter(g => g !== goal.id)
                        }));
                      }}
                      className="h-5 w-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                    />
                    <span className="text-gray-700">{goal.label}</span>
                  </label>
                ))}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Other Goal (Optional)
                </label>
                <input
                  type="text"
                  value={data.otherGoal || ''}
                  onChange={(e) => setData(prev => ({
                    ...prev,
                    otherGoal: e.target.value
                  }))}
                  className="block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your other goal"
                />
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return data.firstName && data.lastName && data.countryOfOrigin && data.zipCode;
      default:
        return true;
    }
  };

  if (initialLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Profile Setup</h1>
          <p className="mt-2 text-gray-600">Let's personalize your experience</p>
        </div>

        <div className="mb-8">
          <div className="h-2 bg-gray-200 rounded-full">
            <div 
              className="h-2 bg-blue-600 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="mt-2 text-sm text-gray-600 text-right">
            Step {currentStep} of {totalSteps}
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start">
            <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 mr-2" />
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 mb-6">
          {renderStep()}
        </div>

        <div className="flex justify-between">
          <button
            onClick={handlePrevious}
            disabled={currentStep === 1}
            className="px-6 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            <ChevronLeft className="h-5 w-5 mr-1" />
            Previous
          </button>

          <button
            onClick={handleNext}
            disabled={loading || !isStepValid()}
            className="px-6 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
            ) : (
              <>
                {currentStep === totalSteps ? 'Complete Setup' : 'Next'}
                <ChevronRight className="h-5 w-5 ml-1" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileSetupPage;