import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStep } from '../contexts/StepContext';
import LazyImage from '../components/LazyImage';
import { supabase } from '../lib/supabaseClient';
import {
  BookOpen, Target, Award, ChevronRight, DollarSign,
  CreditCard, FileText, Shield, Briefcase, Calendar,
  Download, CalendarClock, CheckCircle, AlertCircle,
  TrendingUp, PieChart, UserCircle, Plus, Globe, Home,
  Landmark, HeartPulse, Users, Clock, CheckSquare, Crown
} from 'lucide-react';

type UserProfile = {
  first_name: string;
  immigration_year: number;
  monthly_income: number;
  employment_status: string;
  marital_status: string;
  dependents: number;
  onboarding_tasks: string[];
  next_task: string;
  completed_welcome_steps: number[];
  country_of_origin: string;
  subscription_status: string;
  premium_tier: string;
};

const Dashboard = () => {
  const { currentStep, isCompleted } = useStep();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Mock data for savings progress
  const savingsData = [
    { month: 'Jan', amount: 500 },
    { month: 'Feb', amount: 1200 },
    { month: 'Mar', amount: 1800 },
    { month: 'Apr', amount: 2500 },
    { month: 'May', amount: 3200 },
    { month: 'Jun', amount: 4000 }
  ];

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const completedSteps = [1, 2, 3, 4, 5].filter(step => isCompleted(step as 1 | 2 | 3 | 4 | 5)).length;
  const progress = (completedSteps / 5) * 100;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Banner - Mobile optimized */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-6 text-white shadow-sm animate-fade-in hover-lift">
        <div className="flex flex-col space-y-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold mb-2">
              Welcome{profile?.first_name ? ` ${profile.first_name}` : ''}!
            </h1>
            <p className="text-blue-100 text-base sm:text-lg">
              Your journey to a successful life in America starts here
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => navigate('/guide')}
              className="px-6 py-3 bg-white text-blue-700 rounded-lg hover:bg-blue-50 transition-all duration-200 font-medium text-center focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-blue-600 min-h-[44px] press-effect"
              aria-label="Start your immigration journey course"
            >
              Start Your Journey
            </button>
            <button
              onClick={() => navigate('/profile-setup')}
              className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-400 transition-all duration-200 text-center focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-blue-500 min-h-[44px] press-effect"
              aria-label="Edit your profile information"
            >
              Edit Profile
            </button>
          </div>
        </div>
      </div>

      {/* Quick Stats - Mobile-first grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 animate-slide-up">
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm hover-lift transition-all duration-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <Globe className="h-5 w-5 text-blue-600 mr-2" aria-hidden="true" />
              <h2 className="text-base font-semibold text-gray-800">
                In America Since
              </h2>
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-gray-900">
            {profile?.immigration_year ? new Date().getFullYear() - profile.immigration_year : 0} years
          </div>
          <p className="text-sm text-gray-500 mt-2">
            {profile?.country_of_origin ? `From ${profile.country_of_origin}` : 'Country not specified'}
          </p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm hover-lift transition-all duration-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <Users className="h-5 w-5 text-blue-600 mr-2" aria-hidden="true" />
              <h2 className="text-base font-semibold text-gray-800">
                Family Status
              </h2>
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-gray-900">
            {profile?.marital_status || 'Single'}
          </p>
          <p className="text-sm text-gray-500 mt-2">
            {profile?.dependents ? `${profile.dependents} dependents` : 'No dependents'}
          </p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm sm:col-span-2 lg:col-span-1 hover-lift transition-all duration-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <Briefcase className="h-5 w-5 text-purple-600 mr-2" aria-hidden="true" />
              <h2 className="text-base font-semibold text-gray-800">
                Employment
              </h2>
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-gray-900">
            {profile?.employment_status ? 
              profile.employment_status === 'not_working' ? 'Not working yet' :
              profile.employment_status === 'looking' ? 'Looking for work' :
              profile.employment_status === 'student' ? 'Student' :
              profile.employment_status === 'w2' ? 'W-2 Employee' :
              profile.employment_status === '1099' ? '1099/Self-employed' :
              profile.employment_status
            : 'Not specified'}
          </p>
          <p className="text-sm text-gray-500 mt-2">
            {profile?.monthly_income ? (
              `$${profile.monthly_income}/month`
            ) : ''}
          </p>
        </div>
      </div>

      {/* In-Depth Learning Paths */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <BookOpen className="h-6 w-6 text-purple-600 mr-2" />
            <h2 className="text-lg font-semibold text-gray-800">
              In-Depth Learning Paths
            </h2>
          </div>
          <button 
            onClick={() => navigate('/guide')}
            className="text-blue-600 hover:text-blue-700 text-sm flex items-center"
          >
            View All
            <ChevronRight className="h-4 w-4 ml-1" />
          </button>
        </div>
        
        <p className="text-gray-600 mb-6">
          Comprehensive courses to deepen your understanding of life in America
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-all duration-200">
            <div className="aspect-video bg-gray-100 relative">
              <LazyImage
                src="https://images.pexels.com/photos/3760067/pexels-photo-3760067.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" 
                alt="New to America" 
                className="w-full h-full object-cover"
                responsive={true}
                fallbackSrc="/icons/icon-512x512.png"
              />
            </div>
            <div className="p-4">
              <h3 className="font-bold text-gray-800 mb-1">
                New to America
              </h3>
              <p className="text-sm text-gray-600 mb-3">
                Essential first steps for new immigrants
              </p>
              <button 
                onClick={() => navigate('/guide')}
                className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
              >
                Start Learning
              </button>
            </div>
          </div>
          
          <div className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-all duration-200">
            <div className="aspect-video bg-gray-100 relative">
              <LazyImage
                src="https://images.pexels.com/photos/6266257/pexels-photo-6266257.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" 
                alt="Banking & Credit" 
                className="w-full h-full object-cover"
                responsive={true}
                fallbackSrc="/icons/icon-512x512.png"
              />
            </div>
            <div className="p-4">
              <h3 className="font-bold text-gray-800 mb-1">
                Building Credit
              </h3>
              <p className="text-sm text-gray-600 mb-3">
                Build your credit history from scratch
              </p>
              <button 
                onClick={() => navigate('/guide')}
                className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
              >
                Start Learning
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Consultation */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <CalendarClock className="h-6 w-6 text-purple-600 mr-2" />
            <h2 className="text-lg font-semibold text-gray-800">
              Need Help?
            </h2>
          </div>
        </div>
        <p className="text-gray-600 mb-4">
          Book a free consultation with our immigration advisors
        </p>
        <button
          onClick={() => navigate('/consultation')}
          className="w-full px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
        >
          Book Free Consultation
        </button>
      </div>
    </div>
  );
};

export default Dashboard;