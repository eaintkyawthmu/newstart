import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStep } from '../contexts/StepContext';
import { useSEO } from '../hooks/useSEO';
import { useStripe } from '../hooks/useStripe';
import LazyImage from '../components/LazyImage';
import { supabase } from '../lib/supabaseClient';
import {
  BookOpen, Target, Award, ChevronRight, DollarSign,
  CreditCard, FileText, Shield, Briefcase, Calendar,
  Download, CalendarClock, CheckCircle, AlertCircle,
  TrendingUp, PieChart, UserCircle, Plus, Globe, Home,
  Landmark, HeartPulse, Users, Clock, CheckSquare, Crown
} from 'lucide-react';
import { useMilestones } from '../hooks/useMilestones';
import { useToast } from '../contexts/ToastContext';
import { ProgressTracker, DataVisualization, AnimatedCounter } from '../components/ui';

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
  const { showToast } = useToast();
  const { subscribeToPlan } = useStripe();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const { milestones, userMilestones, getBadgeImage } = useMilestones();

  // SEO optimization
  useSEO({
    title: 'Dashboard - Your Immigration Journey',
    description: 'Track your progress, access learning resources, and manage your financial journey in America.',
    keywords: ['dashboard', 'immigration progress', 'financial tracking'],
    breadcrumbs: [
      { name: 'Home', url: '/' },
      { name: 'Dashboard', url: '/dashboard' }
    ]
  });

  // Check for success or canceled query params for Stripe
  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    const success = queryParams.get('success');
    const canceled = queryParams.get('canceled');
    
    if (success === 'true') {
      showToast('success', 'Payment successful! Your premium access is now active.');
      
      // Remove query params from URL
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (canceled === 'true') {
      showToast('info', 'Payment canceled. You can try again anytime.');
      
      // Remove query params from URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  // Get recent milestones (up to 2)
  const recentMilestones = userMilestones
    .sort((a, b) => new Date(b.earned_at).getTime() - new Date(a.earned_at).getTime())
    .slice(0, 2);

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

  // Essential first steps for new arrivals
  const essentialFirstSteps = [
    {
      id: 'welcome',
      title: language === 'en' ? 'Personal Profile Setup' : 'ကိုယ်ရေးအချက်အလက် စီစဉ်ခြင်း',
      description: language === 'en' ? 'Complete your profile information' : 'သင့်ကိုယ်ရေးအချက်အလက်ကို ဖြည့်စွက်ပါ',
      steps: [
        { id: 1, title: language === 'en' ? 'Personal Information' : 'ကိုယ်ရေးအချက်အလက်' },
        { id: 2, title: language === 'en' ? 'Life & Household Info' : 'လူနေမှုနှင့် အိမ်ထောင်စု အချက်အလက်' },
        { id: 3, title: language === 'en' ? 'Document Information' : 'စာရွက်စာတမ်း အချက်အလက်' }
      ],
      route: '/steps/welcome-setup',
      icon: UserCircle,
      status: profile?.completed_welcome_steps?.length === 3 ? 'completed' : 'in-progress'
    },
    {
      id: 'documents',
      title: language === 'en' ? 'Essential Documents' : 'မရှိမဖြစ် စာရွက်စာတမ်းများ',
      description: language === 'en' ? 'Get your ID and legal documents' : 'သင့် ID နှင့် တရားဝင်စာရွက်စာတမ်းများကို ရယူပါ',
      steps: [
        { id: 1, title: language === 'en' ? 'Access I-94 Record' : 'I-94 မှတ်တမ်းကို ရယူပါ' },
        { id: 2, title: language === 'en' ? 'Apply for SSN/ITIN' : 'SSN/ITIN လျှောက်ထားပါ' },
        { id: 3, title: language === 'en' ? 'Get State ID/Driver\'s License' : 'ပြည်နယ် ID/ယာဉ်မောင်းလိုင်စင် ရယူပါ' }
      ],
      route: '/steps/initial-documents',
      icon: FileText,
      status: 'pending'
    },
    {
      id: 'safety',
      title: language === 'en' ? 'Safety & Emergency' : 'လုံခြုံရေးနှင့် အရေးပေါ်',
      description: language === 'en' ? 'Know what to do in emergencies' : 'အရေးပေါ်အခြေအနေများတွင် ဘာလုပ်ရမည်ကို သိရှိပါ',
      steps: [
        { id: 1, title: language === 'en' ? 'Know Emergency Services (911)' : 'အရေးပေါ်ဝန်ဆောင်မှုများကို သိရှိပါ (911)' },
        { id: 2, title: language === 'en' ? 'Prepare Emergency Kit' : 'အရေးပေါ်အိတ် ပြင်ဆင်ပါ' },
        { id: 3, title: language === 'en' ? 'Organize Medical Information' : 'ဆေးဘက်ဆိုင်ရာ အချက်အလက်များကို စီစဉ်ပါ' }
      ],
      route: '/steps/safety-emergency',
      icon: Shield,
      status: 'pending'
    }
  ];

  // Practical guided steps
  const practicalGuidedSteps = [
    {
      id: 'banking',
      title: language === 'en' ? 'Banking & Credit' : 'ဘဏ်လုပ်ငန်းနှင့် ခရက်ဒစ်',
      description: language === 'en' ? 'Start building your credit history' : 'သင့်ခရက်ဒစ်မှတ်တမ်းကို စတင်တည်ဆောက်ပါ',
      route: '/steps/banking-credit',
      icon: CreditCard,
      status: 'pending'
    },
    {
      id: 'housing',
      title: language === 'en' ? 'Housing & Utilities' : 'အိမ်ရာနှင့် ဝန်ဆောင်မှုများ',
      description: language === 'en' ? 'Find and set up your home' : 'သင့်အိမ်ကို ရှာဖွေပြီး စီစဉ်ပါ',
      route: '/steps/housing-utilities',
      icon: Home,
      status: 'pending'
    },
    {
      id: 'taxes',
      title: language === 'en' ? 'Taxes & Employment' : 'အခွန်နှင့် အလုပ်အကိုင်',
      description: language === 'en' ? 'Understand U.S. tax system' : 'အမေရိကန်အခွန်စနစ်ကို နားလည်ပါ',
      route: '/steps/tax-employment',
      icon: Landmark,
      status: 'pending'
    }
  ];

  const resourceCategories = [
    {
      id: 'essentials',
      title: language === 'en' ? 'Essential Resources' : 'မရှိမဖြစ် အရင်းအမြစ်များ',
      resources: [
        {
          title: language === 'en' ? 'USCIS Resources' : 'USCIS အရင်းအမြစ်များ',
          url: 'https://www.uscis.gov/tools/settling-in-the-us',
          color: 'blue'
        },
        {
          title: language === 'en' ? 'DMV Guide' : 'DMV လမ်းညွှန်',
          url: 'https://www.dmv.ca.gov/portal/driver-licenses-identification-cards/getting-a-real-id/',
          color: 'purple'
        },
        {
          title: language === 'en' ? 'Healthcare' : 'ကျန်းမာရေးစောင့်ရှောက်မှု',
          url: 'https://www.healthcare.gov/immigrants/coverage/',
          color: 'green'
        },
        {
          title: language === 'en' ? 'Tax Help' : 'အခွန်အကူအညီ',
          url: 'https://www.irs.gov/individuals/international-taxpayers/taxpayer-resources-for-foreign-nationals-and-us-citizens-abroad',
          color: 'amber'
        }
      ]
    },
    {
      id: 'community',
      title: language === 'en' ? 'Community Support' : 'အသိုင်းအဝိုင်း ပံ့ပိုးမှု',
      resources: [
        {
          title: language === 'en' ? 'Find ESL Classes' : 'ESL အတန်းများ ရှာဖွေရန်',
          url: 'https://www.uscis.gov/citizenship/find-a-class',
          color: 'indigo'
        },
        {
          title: language === 'en' ? 'Immigrant Services' : 'ရွှေ့ပြောင်းအခြေချသူ ဝန်ဆောင်မှုများ',
          url: 'https://www.immigrationhelp.org/',
          color: 'teal'
        }
      ]
    }
  ];

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

      {/* Subscription Status Banner (if not premium) */}
      {profile && profile.subscription_status !== 'active' && (
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl p-6 text-white shadow-sm animate-slide-up hover-lift">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <div className="flex items-center">
              <Crown className="h-8 w-8 mr-3 flex-shrink-0 animate-bounce-gentle" aria-hidden="true" />
              <div>
                <h2 className="text-xl font-bold">
                  {language === 'en' ? 'Unlock Premium Features' : 'Premium အင်္ဂါရပ်များကို ဖွင့်လှစ်ပါ'}
                </h2>
                <p className="text-purple-100">
                  {language === 'en' 
                    ? 'Get access to all courses, premium content, and personalized guidance'
                    : 'သင်တန်းအားလုံး၊ premium အကြောင်းအရာများနှင့် ကိုယ်ပိုင်လမ်းညွှန်မှုကို ရယူပါ'}
                </p>
              </div>
            </div>
            <button
              onClick={() => subscribeToPlan('monthly')}
              className="px-6 py-3 bg-white text-purple-700 rounded-lg hover:bg-purple-50 transition-all duration-200 font-medium focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-purple-600 press-effect min-h-[44px]"
              aria-label="Upgrade to premium subscription"
            >
              {language === 'en' ? 'Upgrade Now' : 'ယခု အဆင့်မြှင့်ရန်'}
            </button>
          </div>
        </div>
      )}

      {/* Quick Stats - Mobile-first grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 animate-slide-up">
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm hover-lift transition-all duration-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <Globe className="h-5 w-5 text-blue-600 mr-2" aria-hidden="true" />
              <h2 className="text-base font-semibold text-gray-800">
                {language === 'en' ? 'In America Since' : 'အမေရိကန်တွင် ရောက်ရှိသည်မှာ'}
              </h2>
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-gray-900">
            <AnimatedCounter 
              value={profile?.immigration_year ? new Date().getFullYear() - profile.immigration_year : 0}
              suffix={` ${language === 'en' ? 'years' : 'နှစ်'}`}
            />
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
                {language === 'en' ? 'Family Status' : 'မိသားစုအခြေအနေ'}
              </h2>
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-gray-900">
            {profile?.marital_status || 'Single'}
          </p>
          <p className="text-sm text-gray-500 mt-2">
            {profile?.dependents ? `${profile.dependents} ${language === 'en' ? 'dependents' : 'မှီခိုသူများ'}` : language === 'en' ? 'No dependents' : 'မှီခိုသူမရှိပါ'}
          </p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm sm:col-span-2 lg:col-span-1 hover-lift transition-all duration-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <Briefcase className="h-5 w-5 text-purple-600 mr-2" aria-hidden="true" />
              <h2 className="text-base font-semibold text-gray-800">
                {language === 'en' ? 'Employment' : 'အလုပ်အကိုင်'}
              </h2>
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-gray-900">
            {profile?.employment_status ? 
              profile.employment_status === 'not_working' ? (language === 'en' ? 'Not working yet' : 'မအလုပ်မလုပ်သေးပါ') :
              profile.employment_status === 'looking' ? (language === 'en' ? 'Looking for work' : 'အလုပ်ရှာနေသည်') :
              profile.employment_status === 'student' ? (language === 'en' ? 'Student' : 'ကျောင်းသား') :
              profile.employment_status === 'w2' ? 'W-2 Employee' :
              profile.employment_status === '1099' ? '1099/Self-employed' :
              profile.employment_status
            : language === 'en' ? 'Not specified' : 'သတ်မှတ်မထားပါ'}
          </p>
          <p className="text-sm text-gray-500 mt-2">
            {profile?.monthly_income ? (
              <AnimatedCounter 
                value={profile.monthly_income}
                prefix="$"
                suffix="/month"
              />
            ) : ''}
          </p>
        </div>
      </div>

      {/* Essential First Steps Section */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <CheckSquare className="h-6 w-6 text-green-600 mr-2" />
            <h2 className="text-lg font-semibold text-gray-800">
              {language === 'en' ? 'Essential First Steps' : 'မရှိမဖြစ် ပထမအဆင့်များ'}
            </h2>
          </div>
        </div>

        <p className="text-gray-600 mb-6">
          {language === 'en' 
            ? 'Complete these immediate tasks to establish your foundation in the U.S.'
            : 'အမေရိကန်တွင် သင့်အခြေခံကို တည်ဆောက်ရန် ဤချက်ချင်းလုပ်ဆောင်ရမည့် လုပ်ငန်းတာဝန်များကို ပြီးဆုံးအောင် လုပ်ဆောင်ပါ'}
        </p>

        <ProgressTracker
          steps={essentialFirstSteps.map(step => ({
            id: step.id,
            title: step.title,
            description: step.description,
            completed: step.status === 'completed',
            current: step.status === 'in-progress',
            locked: false
          }))}
          orientation="vertical"
          showDescriptions={true}
          onStepClick={(stepId) => {
            const step = essentialFirstSteps.find(s => s.id === stepId);
            if (step) navigate(step.route);
          }}
        />
      </div>

      {/* Practical Guided Steps */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <Target className="h-6 w-6 text-blue-600 mr-2" />
            <h2 className="text-lg font-semibold text-gray-800">
              {language === 'en' ? 'Practical Guided Steps' : 'လက်တွေ့ကျသော လမ်းညွှန်အဆင့်များ'}
            </h2>
          </div>
        </div>

        <p className="text-gray-600 mb-6">
          {language === 'en' 
            ? 'Step-by-step guidance for specific areas of your new life in America'
            : 'အမေရိကန်ရှိ သင့်ဘဝသစ်၏ သီးခြားနယ်ပယ်များအတွက် အဆင့်ဆင့်လမ်းညွှန်မှု'}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {practicalGuidedSteps.map((step) => (
            <div 
              key={step.id}
              className="p-4 rounded-lg border hover:shadow-sm transition-shadow cursor-pointer"
              onClick={() => navigate(step.route)}
            >
              <div className="flex flex-col h-full">
                <div className="flex items-center mb-3">
                  <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mr-3">
                    <step.icon className="h-5 w-5 text-gray-500" />
                  </div>
                  <h3 className="font-medium text-gray-800">{step.title}</h3>
                </div>
                <p className="text-sm text-gray-600 mb-3 flex-grow">{step.description}</p>
                <div className="flex justify-end">
                  <span className="text-blue-600 text-sm flex items-center">
                    {language === 'en' ? 'Get Started' : 'စတင်ရန်'}
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Milestones Section */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <Award className="h-6 w-6 text-blue-600 mr-2" />
            <h2 className="text-lg font-semibold text-gray-800">
              {language === 'en' ? 'Your Achievements' : 'သင့်အောင်မြင်မှုများ'}
            </h2>
          </div>
          <button
            onClick={() => navigate('/milestones')}
            className="text-blue-600 hover:text-blue-700 flex items-center text-sm"
          >
            {language === 'en' ? 'View All' : 'အားလုံးကြည့်ရန်'}
            <ChevronRight className="h-4 w-4 ml-1" />
          </button>
        </div>

        {userMilestones.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
            <Award className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <h3 className="text-lg font-medium text-gray-700 mb-2">
              {language === 'en' ? 'No Achievements Yet' : 'အောင်မြင်မှုများ မရှိသေးပါ'}
            </h3>
            <p className="text-gray-600 max-w-md mx-auto mb-4">
              {language === 'en' 
                ? 'Complete lessons and courses to earn achievements and rewards!'
                : 'အောင်မြင်မှုများနှင့် ဆုလက်ဆောင်များ ရရှိရန် သင်ခန်းစာများနှင့် သင်တန်းများကို ပြီးဆုံးအောင် လုပ်ဆောင်ပါ!'}
            </p>
            <button
              onClick={() => navigate('/journey')}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {language === 'en' ? 'Start Learning' : 'စတင်လေ့လာရန်'}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recentMilestones.map(userMilestone => {
              const milestone = milestones.find(m => m.id === userMilestone.milestone_id);
              if (!milestone) return null;
              
              return (
                <div key={userMilestone.id} className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-200 p-4">
                  <div className="flex items-start">
                    <div className="w-24 h-24 rounded-lg bg-white border border-blue-100 flex items-center justify-center mr-3 flex-shrink-0 overflow-hidden">
                      <img 
                        src={getBadgeImage(userMilestone.milestone_id)} 
                        alt={milestone.title} 
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{milestone.title}</h3>
                      <p className="text-sm text-gray-600 mb-2">{milestone.description}</p>
                      <div className="flex items-center text-xs text-blue-600">
                        <Clock className="h-3.5 w-3.5 mr-1" />
                        <span>
                          {language === 'en' ? 'Earned on ' : 'ရရှိသည့်ရက် '} 
                          {new Date(userMilestone.earned_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* In-Depth Learning Paths */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <BookOpen className="h-6 w-6 text-purple-600 mr-2" />
            <h2 className="text-lg font-semibold text-gray-800">
              {language === 'en' ? 'In-Depth Learning Paths' : 'အသေးစိတ်လေ့လာရေးလမ်းကြောင်းများ'}
            </h2>
          </div>
          <button 
            onClick={() => navigate('/journey')}
            className="text-blue-600 hover:text-blue-700 text-sm flex items-center"
          >
            {language === 'en' ? 'View All' : 'အားလုံးကြည့်ရန်'}
            <ChevronRight className="h-4 w-4 ml-1" />
          </button>
        </div>
        
        <p className="text-gray-600 mb-6">
          {language === 'en' 
            ? 'Comprehensive courses to deepen your understanding of life in America'
            : 'အမေရိကန်ရှိ ဘဝအကြောင်း သင့်နားလည်မှုကို နက်ရှိုင်းစေရန် ပြည့်စုံသော သင်တန်းများ'}
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
                {language === 'en' ? 'New to America' : 'အမေရိကန်သို့ အသစ်ရောက်ရှိသူ'}
              </h3>
              <p className="text-sm text-gray-600 mb-3">
                {language === 'en' 
                  ? 'Essential first steps for new immigrants'
                  : 'ရွှေ့ပြောင်းအခြေချသူအသစ်များအတွက် မရှိမဖြစ်အဆင့်များ'}
              </p>
              <button 
                onClick={() => navigate('/courses/new-to-america')}
                className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
              >
                {language === 'en' ? 'Start Learning' : 'စတင်လေ့လာရန်'}
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
                {language === 'en' ? 'Building Credit' : 'ခရက်ဒစ်တည်ဆောက်ခြင်း'}
              </h3>
              <p className="text-sm text-gray-600 mb-3">
                {language === 'en' 
                  ? 'Build your credit history from scratch'
                  : 'သင့်ခရက်ဒစ်မှတ်တမ်းကို အစမှစတင်တည်ဆောက်ပါ'}
              </p>
              <button 
                onClick={() => navigate('/courses/build-credit')}
                className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
              >
                {language === 'en' ? 'Start Learning' : 'စတင်လေ့လာရန်'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Resource Hub */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <FileText className="h-6 w-6 text-blue-600 mr-2" />
            <h2 className="text-lg font-semibold text-gray-800">
              {language === 'en' ? 'Resource Hub' : 'အရင်းအမြစ်စင်တာ'}
            </h2>
          </div>
        </div>

        <div className="space-y-6">
          {resourceCategories.map(category => (
            <div key={category.id} className="space-y-3">
              <h3 className="font-medium text-gray-700">{category.title}</h3>
              <div className="grid grid-cols-2 gap-3">
                {category.resources.map((resource, index) => (
                  <a
                    key={index}
                    href={resource.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`p-4 text-left rounded-lg bg-${resource.color}-50 hover:bg-${resource.color}-100 transition-colors`}
                  >
                    <span className={`font-medium text-${resource.color}-700 text-sm`}>{resource.title}</span>
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Consultation */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <CalendarClock className="h-6 w-6 text-purple-600 mr-2" />
            <h2 className="text-lg font-semibold text-gray-800">
              {language === 'en' ? 'Need Help?' : 'အကူအညီလိုပါသလား။'}
            </h2>
          </div>
        </div>
        <p className="text-gray-600 mb-4">
          {language === 'en'
            ? 'Book a free consultation with our immigration advisors'
            : 'ကျွန်ုပ်တို့၏ ရွှေ့ပြောင်းအခြေချမှုအကြံပေးများနှင့် အခမဲ့တိုင်ပင်ဆွေးနွေးမှု ပြုလုပ်ပါ'}
        </p>
        <button
          onClick={() => navigate('/consultation')}
          className="w-full px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
        >
          {language === 'en' ? 'Book Free Consultation' : 'အခမဲ့တိုင်ပင်ဆွေးနွေးရန်'}
        </button>
      </div>
    </div>
  );
};

export default Dashboard;