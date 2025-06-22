import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import {
  UserCircle,
  ArrowLeft,
  Users,
  Building,
  Home,
  GraduationCap,
  Briefcase,
  MapPin,
  ChevronDown,
  ChevronUp,
  Clock,
  Mail,
  Truck,
  CheckSquare,
  FileText,
  Phone,
  HelpCircle,
  Shield,
  ChevronRight
} from 'lucide-react';

interface StepProgress {
  step_id: number;
  status: 'completed' | 'in-progress' | 'pending';
  user_id: string;
}

const JourneyCardList = () => {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const [progress, setProgress] = useState<Record<number, StepProgress>>({});
  const [completedWelcomeSteps, setCompletedWelcomeSteps] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProgress();
  }, []);

  const fetchProgress = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch journey progress
      const { data: journeyData, error: journeyError } = await supabase
        .from('journey_progress')
        .select('*')
        .eq('user_id', user.id);

      if (journeyError) throw journeyError;

      // Fetch completed welcome steps
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('completed_welcome_steps')
        .eq('id', user.id)
        .single();

      if (profileError) throw profileError;

      const progressMap = (journeyData || []).reduce((acc: Record<number, StepProgress>, curr) => {
        acc[curr.step_id] = curr;
        return acc;
      }, {});

      setProgress(progressMap);
      setCompletedWelcomeSteps(profileData?.completed_welcome_steps || []);
    } catch (error) {
      console.error('Error fetching progress:', error);
    } finally {
      setLoading(false);
    }
  };

  const journeySteps = [
    {
      id: 'welcome',
      title: language === 'en' ? 'New to America' : 'အမေရိကန်သို့ အသစ်ရောက်ရှိသူ',
      description: language === 'en' ? 'Essential first steps for absolute beginners' : 'အခြေခံကျသော ပထမဆုံးအဆင့်များ',
      steps: [
        { id: 1, title: language === 'en' ? 'Personal Profile Setup' : 'ကိုယ်ရေးအချက်အလက် စီစဉ်ခြင်း' },
        { id: 2, title: language === 'en' ? 'Life & Household Info' : 'လူနေမှုနှင့် အိမ်ထောင်စု အချက်အလက်' },
        { id: 3, title: language === 'en' ? 'Document Information' : 'စာရွက်စာတမ်း အချက်အလက်' }
      ],
      route: '/steps/welcome-setup',
      icon: UserCircle
    },
    {
      id: 'documents',
      title: language === 'en' ? 'Initial Document Setup' : 'ကနဦး စာရွက်စာတမ်း စီစဉ်ခြင်း',
      description: language === 'en' ? 'Get your essential documents and identification' : 'သင့်မရှိမဖြစ် စာရွက်စာတမ်းများနှင့် အထောက်အထားများကို ရယူပါ',
      steps: [
        { id: 1, title: language === 'en' ? 'Access I-94 Record' : 'I-94 မှတ်တမ်းကို ရယူပါ' },
        { id: 2, title: language === 'en' ? 'Apply for SSN/ITIN' : 'SSN/ITIN လျှောက်ထားပါ' },
        { id: 3, title: language === 'en' ? 'Get State ID/Driver\'s License' : 'ပြည်နယ် ID/ယာဉ်မောင်းလိုင်စင် ရယူပါ' }
      ],
      route: '/steps/initial-documents',
      icon: FileText
    },
    {
      id: 'safety',
      title: language === 'en' ? 'Safety & Emergency' : 'လုံခြုံရေးနှင့် အရေးပေါ်',
      description: language === 'en' ? 'Essential safety knowledge and emergency preparedness' : 'မရှိမဖြစ် လုံခြုံရေးဗဟုသုတနှင့် အရေးပေါ်ကြိုတင်ပြင်ဆင်မှု',
      steps: [
        { id: 1, title: language === 'en' ? 'Know Emergency Services (911)' : 'အရေးပေါ်ဝန်ဆောင်မှုများကို သိရှိပါ (911)' },
        { id: 2, title: language === 'en' ? 'Prepare Emergency Kit' : 'အရေးပေါ်အိတ် ပြင်ဆင်ပါ' },
        { id: 3, title: language === 'en' ? 'Organize Medical Information' : 'ဆေးဘက်ဆိုင်ရာ အချက်အလက်များကို စီစဉ်ပါ' }
      ],
      route: '/steps/safety-emergency',
      icon: Shield
    },
    {
      id: 'banking',
      title: language === 'en' ? 'Banking & Credit' : 'ဘဏ်လုပ်ငန်းနှင့် ခရက်ဒစ်',
      description: language === 'en' ? 'Start building your credit history from scratch' : 'သင့်ခရက်ဒစ်မှတ်တမ်းကို အစမှစတင်တည်ဆောက်ပါ',
      steps: [],
      route: '/steps/banking-credit',
      icon: Building
    },
    {
      id: 'housing',
      title: language === 'en' ? 'Housing & Utilities' : 'အိမ်ရာနှင့် ဝန်ဆောင်မှုများ',
      description: language === 'en' ? 'Find and set up your home in America' : 'အမေရိကန်တွင် သင့်အိမ်ကို ရှာဖွေပြီး စီစဉ်ပါ',
      steps: [],
      route: '/steps/housing-utilities',
      icon: Home
    },
    {
      id: 'taxes',
      title: language === 'en' ? 'Taxes & Employment' : 'အခွန်နှင့် အလုပ်အကိုင်',
      description: language === 'en' ? 'Understand U.S. tax system and employment' : 'အမေရိကန်အခွန်စနစ်နှင့် အလုပ်အကိုင်ကို နားလည်ပါ',
      steps: [],
      route: '/steps/tax-employment',
      icon: Briefcase
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6">
      {journeySteps.map((step) => (
        <div 
          key={step.id}
          className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-4">
              <div className={`rounded-full p-2 ${
                step.id === 'welcome' && completedWelcomeSteps?.length === 3
                  ? 'bg-blue-100'
                  : step.id === 'documents' && (progress[2]?.status === 'completed' || checklist?.ssn && checklist?.dmv)
                  ? 'bg-blue-100'
                  : step.id === 'safety' && (progress[3]?.status === 'completed')
                  ? 'bg-blue-100'
                  : 'bg-gray-100'
              }`}>
                <step.icon className={`h-6 w-6 ${
                  step.id === 'welcome' && completedWelcomeSteps?.length === 3
                    ? 'text-blue-600'
                    : step.id === 'documents' && (progress[2]?.status === 'completed' || checklist?.ssn && checklist?.dmv)
                    ? 'text-blue-600'
                    : step.id === 'safety' && (progress[3]?.status === 'completed')
                    ? 'text-blue-600'
                    : 'text-gray-400'
                }`} />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-800">{step.title}</h2>
                <p className="text-gray-600 mt-1">{step.description}</p>
                
                <div className="mt-4 space-y-2">
                  {step.steps.map((substep, index) => (
                    <div 
                      key={substep.id}
                      className="flex items-center space-x-2"
                    >
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        step.id === 'welcome' && completedWelcomeSteps?.includes(substep.id)
                          ? 'bg-blue-500 border-blue-500'
                          : step.id === 'documents' && checklist?.[['i94', 'ssn', 'dmv'][index]]
                          ? 'bg-blue-500 border-blue-500'
                          : step.id === 'safety' && checklist?.[['emergency_contacts', 'emergency_kit', 'medical_info'][index]]
                          ? 'bg-blue-500 border-blue-500'
                          : 'border-gray-300'
                      }`}>
                        {((step.id === 'welcome' && completedWelcomeSteps?.includes(substep.id)) ||
                          (step.id === 'documents' && checklist?.[['i94', 'ssn', 'dmv'][index]]) ||
                          (step.id === 'safety' && checklist?.[['emergency_contacts', 'emergency_kit', 'medical_info'][index]])) && (
                          <CheckSquare className="h-3 w-3 text-white" />
                        )}
                      </div>
                      <span className={((step.id === 'welcome' && completedWelcomeSteps?.includes(substep.id)) ||
                          (step.id === 'documents' && checklist?.[['i94', 'ssn', 'dmv'][index]]) ||
                          (step.id === 'safety' && checklist?.[['emergency_contacts', 'emergency_kit', 'medical_info'][index]]))
                        ? 'text-gray-500 line-through'
                        : 'text-gray-600'
                      }>
                        {substep.title}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            <button
              onClick={() => navigate(step.route)}
              className="flex items-center text-blue-600 hover:text-blue-700"
            >
              {language === 'en' ? 'View Details' : 'အသေးစိတ်ကြည့်ရန်'}
              <ChevronRight className="h-5 w-5 ml-1" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default JourneyCardList;