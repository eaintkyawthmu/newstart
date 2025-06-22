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
  HelpCircle
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

const InitialOnboardingChecklist = () => {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [profileData, setProfileData] = useState<ProfileData>({
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
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;

      if (data) {
        setProfileData({
          firstName: data.first_name || '',
          lastName: data.last_name || '',
          arrivalYear: data.immigration_year || new Date().getFullYear(),
          countryOfOrigin: data.country_of_origin || '',
          preferredLanguage: data.preferred_language || 'en',
          zipCode: data.zip_code || '',
          maritalStatus: data.marital_status || 'Single',
          dependents: data.dependents || 0,
          employmentStatus: data.employment_status || 'Not working yet',
          lifeGoals: data.life_goals || [],
          otherGoal: data.other_goal || '',
          ssnLastFour: data.ssn_last_four || '',
          idLastFour: data.id_last_four || '',
          phoneNumber: data.phone_number || '',
          streetAddress: data.street_address || '',
          hasSsn: data.has_ssn || false,
          hasPhone: data.has_phone || false,
          hasHousing: data.has_housing || false,
          concerns: data.concerns || ''
        });
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setInitialLoading(false);
    }
  };

  const updateCompletedSteps = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get current completed steps
      const { data } = await supabase
        .from('profiles')
        .select('completed_welcome_steps')
        .eq('id', user.id)
        .single();

      // Add current step if not already completed
      const completedSteps = new Set(data?.completed_welcome_steps || []);
      completedSteps.add(currentStep);

      // Update completed steps in database
      const { error } = await supabase
        .from('profiles')
        .update({
          completed_welcome_steps: Array.from(completedSteps),
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) throw error;
    } catch (error) {
      console.error('Error updating completed steps:', error);
    }
  };

  const handleNext = async () => {
    if (currentStep < 3) {
      await updateCompletedSteps();
      setCurrentStep(prev => prev + 1);
    } else {
      await updateCompletedSteps();
      saveProfile();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const saveProfile = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('profiles')
        .update({
          first_name: profileData.firstName,
          last_name: profileData.lastName,
          immigration_year: profileData.arrivalYear,
          country_of_origin: profileData.countryOfOrigin,
          preferred_language: profileData.preferredLanguage,
          zip_code: profileData.zipCode,
          marital_status: profileData.maritalStatus,
          dependents: profileData.dependents,
          employment_status: profileData.employmentStatus,
          life_goals: profileData.lifeGoals,
          other_goal: profileData.otherGoal,
          ssn_last_four: profileData.ssnLastFour,
          id_last_four: profileData.idLastFour,
          phone_number: profileData.phoneNumber,
          street_address: profileData.streetAddress,
          has_ssn: profileData.hasSsn,
          has_phone: profileData.hasPhone,
          has_housing: profileData.hasHousing,
          concerns: profileData.concerns,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) throw error;
      navigate('/journey');
    } catch (error) {
      console.error('Error saving profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const lifeGoalsOptions = [
    { id: 'family', label: language === 'en' ? 'Build a better life for my family' : 'မိသားစုအတွက် ပိုကောင်းသော ဘဝတည်ဆောက်ရန်' },
    { id: 'home', label: language === 'en' ? 'Buy a home' : 'အိမ်ဝယ်ယူရန်' },
    { id: 'job', label: language === 'en' ? 'Get a job' : 'အလုပ်ရရှိရန်' },
    { id: 'business', label: language === 'en' ? 'Start a business' : 'စီးပွားရေးလုပ်ငန်း စတင်ရန်' },
    { id: 'education', label: language === 'en' ? 'Send kids to college' : 'ကလေးများကို ကောလိပ်ပို့ရန်' },
    { id: 'retirement', label: language === 'en' ? 'Retire in the U.S.' : 'အမေရိကန်တွင် အငြိမ်းစားယူရန်' }
  ];

  const employmentOptions = [
    { value: 'not_working', label: language === 'en' ? 'Not working yet' : 'မအလုပ်မလုပ်သေးပါ' },
    { value: 'looking', label: language === 'en' ? 'Looking for a job' : 'အလုပ်ရှာနေသည်' },
    { value: 'student', label: language === 'en' ? 'Student' : 'ကျောင်းသား' },
    { value: 'w2', label: language === 'en' ? 'W-2 Employee' : 'W-2 ဝန်ထမ်း' },
    { value: '1099', label: language === 'en' ? '1099/Gig/Business Owner' : '၁၀၉၉/စီးပွားရေးပိုင်ရှင်' }
  ];

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-800 flex items-center">
              <UserCircle className="h-6 w-6 text-blue-600 mr-2" />
              {language === 'en' ? 'Step 1: Personal Profile Setup' : 'အဆင့် ၁: ကိုယ်ရေးအချက်အလက် စီစဉ်ခြင်း'}
            </h2>
            <p className="text-gray-600">
              {language === 'en' 
                ? 'Help us personalize your journey and localize guidance'
                : 'သင့်ခရီးစဉ်ကို ကိုယ်ပိုင်ပြုလုပ်ရန်နှင့် ဒေသနှင့်ကိုက်ညီသော လမ်းညွှန်မှုပေးရန် ကူညီပါ'}
            </p>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {language === 'en' ? 'First Name' : 'နာမည်'}*
                  </label>
                  <input
                    type="text"
                    required
                    value={profileData.firstName}
                    onChange={(e) => setProfileData(prev => ({
                      ...prev,
                      firstName: e.target.value
                    }))}
                    className="block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {language === 'en' ? 'Last Name' : 'မိသားစုနာမည်'}*
                  </label>
                  <input
                    type="text"
                    required
                    value={profileData.lastName}
                    onChange={(e) => setProfileData(prev => ({
                      ...prev,
                      lastName: e.target.value
                    }))}
                    className="block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {language === 'en' ? 'Year of Arrival' : 'ရောက်ရှိသည့်နှစ်'}*
                </label>
                <input
                  type="number"
                  required
                  min="1900"
                  max={new Date().getFullYear()}
                  value={profileData.arrivalYear}
                  onChange={(e) => setProfileData(prev => ({
                    ...prev,
                    arrivalYear: parseInt(e.target.value) || new Date().getFullYear()
                  }))}
                  className="block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {language === 'en' ? 'Country of Origin' : 'မူလနိုင်ငံ'}*
                </label>
                <input
                  type="text"
                  required
                  value={profileData.countryOfOrigin}
                  onChange={(e) => setProfileData(prev => ({
                    ...prev,
                    countryOfOrigin: e.target.value
                  }))}
                  className="block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {language === 'en' ? 'Preferred Language' : 'နှစ်သက်ရာ ဘာသာစကား'}*
                </label>
                <select
                  value={profileData.preferredLanguage}
                  onChange={(e) => setProfileData(prev => ({
                    ...prev,
                    preferredLanguage: e.target.value as 'en' | 'my'
                  }))}
                  className="block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="en">🇺🇸 English</option>
                  <option value="my">မြန်မာ Burmese</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {language === 'en' ? 'ZIP Code' : 'စာပို့သင်္ကေတ'}*
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="text"
                    required
                    value={profileData.zipCode}
                    onChange={(e) => setProfileData(prev => ({
                      ...prev,
                      zipCode: e.target.value
                    }))}
                    className="block w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="90210"
                  />
                </div>
                <p className="mt-1 text-sm text-gray-500">
                  {language === 'en' ? 'To help locate resources near you' : 'သင့်အနီးရှိ အရင်းအမြစ်များကို ရှာဖွေရန်'}
                </p>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-800 flex items-center">
              <Users className="h-6 w-6 text-blue-600 mr-2" />
              {language === 'en' ? 'Step 2: Life & Household Info' : 'အဆင့် ၂: လူနေမှုနှင့် အိမ်ထောင်စု အချက်အလက်'}
            </h2>
            <p className="text-gray-600">
              {language === 'en'
                ? 'Help us understand your family situation and goals'
                : 'သင့်မိသားစုအခြေအနေနှင့် ရည်မှန်းချက်များကို နားလည်ရန် ကူညီပါ'}
            </p>

            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-800 mb-4">
                  {language === 'en' ? '👨‍👩‍👧‍👦 Household' : '👨‍👩‍👧‍👦 အိမ်ထောင်စု'}
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {language === 'en' ? 'Marital Status' : 'အိမ်ထောင်ရေးအခြေအနေ'}
                    </label>
                    <select
                      value={profileData.maritalStatus}
                      onChange={(e) => setProfileData(prev => ({
                        ...prev,
                        maritalStatus: e.target.value
                      }))}
                      className="block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="Single">{language === 'en' ? 'Single' : 'အိမ်ထောင်မရှိ'}</option>
                      <option value="Married">{language === 'en' ? 'Married' : 'အိမ်ထောင်ရှိ'}</option>
                      <option value="Divorced">{language === 'en' ? 'Divorced' : 'ကွာရှင်းပြီး'}</option>
                      <option value="Widowed">{language === 'en' ? 'Widowed' : 'မုဆိုးဖို/မ'}</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {language === 'en' ? 'Number of Dependents' : 'မှီခိုသူအရေအတွက်'}
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={profileData.dependents}
                      onChange={(e) => setProfileData(prev => ({
                        ...prev,
                        dependents: parseInt(e.target.value) || 0
                      }))}
                      className="block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <p className="mt-1 text-sm text-gray-500">
                      {language === 'en' ? 'Children, elderly parents, etc.' : 'ကလေးများ၊ သက်ကြီးမိဘများ စသည်'}
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-800 mb-4">
                  {language === 'en' ? '💼 Employment' : '💼 အလုပ်အကိုင်'}
                </h3>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {language === 'en' ? 'Current Status' : 'လက်ရှိအခြေအနေ'}
                  </label>
                  <select
                    value={profileData.employmentStatus}
                    onChange={(e) => setProfileData(prev => ({
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

              <div>
                <h3 className="text-lg font-medium text-gray-800 mb-4">
                  {language === 'en' ? '🌟 Life Goals' : '🌟 ဘဝပန်းတိုင်များ'}
                </h3>
                <div className="space-y-3">
                  {lifeGoalsOptions.map(goal => (
                    <label key={goal.id} className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={profileData.lifeGoals.includes(goal.id)}
                        onChange={(e) => {
                          setProfileData(prev => ({
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
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {language === 'en' ? 'Other Goal' : 'အခြားပန်းတိုင်'}
                    </label>
                    <input
                      type="text"
                      value={profileData.otherGoal || ''}
                      onChange={(e) => setProfileData(prev => ({
                        ...prev,
                        otherGoal: e.target.value
                      }))}
                      className="block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder={language === 'en' ? 'Enter your other goal' : 'အခြားပန်းတိုင်ကို ရိုက်ထည့်ပါ'}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-800 flex items-center">
              <FileText className="h-6 w-6 text-blue-600 mr-2" />
              {language === 'en' ? 'Step 3: Document Information' : 'အဆင့် ၃: စာရွက်စာတမ်း အချက်အလက်'}
            </h2>
            <p className="text-gray-600">
              {language === 'en'
                ? 'Optional: Do you already have these important documents? (Leave blank if not — we\'ll help you get them in your journey.)'
                : 'ရွေးချယ်နိုင်သည်- ဤအရေးကြီးသော စာရွက်စာတမ်းများ သင့်တွင်ရှိပြီးပြီလား။ (မရှိသေးပါက ဘာမှမဖြည့်ပါနှင့် — သင့်ခရီးစဉ်တွင် ရယူနိုင်ရန် ကျွန်ုပ်တို့ကူညီပါမည်။)'}
            </p>

            <div className="space-y-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {language === 'en' ? 'Last 4 digits of SSN (optional)' : 'SSN ၏ နောက်ဆုံးဂဏန်း ၄ လုံး (ရွေးချယ်နိုင်)'}
                  </label>
                  <input
                    type="text"
                    maxLength={4}
                    pattern="[0-9]*"
                    value={profileData.ssnLastFour || ''}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '');
                      setProfileData(prev => ({
                        ...prev,
                        ssnLastFour: value
                      }));
                    }}
                    className="block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {language === 'en' ? 'Last 4 digits of CA State ID/Driver\'s License (optional)' : 'CA ပြည်နယ် ID/ယာဉ်မောင်းလိုင်စင်၏ နောက်ဆုံးဂဏန်း ၄ လုံး (ရွေးချယ်နိုင်)'}
                  </label>
                  <input
                    type="text"
                    maxLength={4}
                    pattern="[0-9]*"
                    value={profileData.idLastFour || ''}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '');
                      setProfileData(prev => ({
                        ...prev,
                        idLastFour: value
                      }));
                    }}
                    className="block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {language === 'en' ? 'U.S. Phone Number' : 'အမေရိကန် ဖုန်းနံပါတ်'}
                  </label>
                  <input
                    type="tel"
                    value={profileData.phoneNumber || ''}
                    onChange={(e) => setProfileData(prev => ({
                      ...prev,
                      phoneNumber: e.target.value
                    }))}
                    className="block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="(123) 456-7890"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {language === 'en' ? 'Current U.S. Address (Street + ZIP, optional)' : 'လက်ရှိ အမေရိကန် လိပ်စာ (လမ်း + ZIP၊ ရွေးချယ်နိုင်)'}
                  </label>
                  <input
                    type="text"
                    value={profileData.streetAddress || ''}
                    onChange={(e) => setProfileData(prev => ({
                      ...prev,
                      streetAddress: e.target.value
                    }))}
                    className="block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder={language === 'en' ? 'Street address' : 'လမ်းလိပ်စာ'}
                  />
                </div>
              </div>

              <div className="space-y-4 pt-6">
                <h3 className="font-medium text-gray-800">
                  {language === 'en' ? 'Current Status' : 'လက်ရှိအခြေအနေ'}
                </h3>
                
                <div className="space-y-3">
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={profileData.hasSsn}
                      onChange={(e) => setProfileData(prev => ({
                        ...prev,
                        hasSsn: e.target.checked
                      }))}
                      className="h-5 w-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                    />
                    <span className="text-gray-700">
                      {language === 'en' ? 'I already applied for SSN' : 'SSN အတွက် လျှောက်ထားပြီးပါပြီ'}
                    </span>
                  </label>

                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={profileData.hasPhone}
                      onChange={(e) => setProfileData(prev => ({
                        ...prev,
                        hasPhone: e.target.checked
                      }))}
                      className="h-5 w-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                    />
                    <span className="text-gray-700">
                      {language === 'en' ? 'I already have a U.S. phone number' : 'အမေရိကန် ဖုန်းနံပါတ် ရှိပြီးပါပြီ'}
                    </span>
                  </label>

                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={profileData.hasHousing}
                      onChange={(e) => setProfileData(prev => ({
                        ...prev,
                        hasHousing: e.target.checked
                      }))}
                      className="h-5 w-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                    />
                    <span className="text-gray-700">
                      {language === 'en' ? 'I have my own place (rented or owned)' : 'ကိုယ်ပိုင်နေရာ ရှိပါသည် (ငှားရမ်း သို့မဟုတ် ပိုင်ဆိုင်)'}
                    </span>
                  </label>
                </div>
              </div>

              <div className="pt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {language === 'en' ? 'Is there anything you\'re worried about or unsure of?' : 'သင်စိုးရိမ်နေသော သို့မဟုတ် မသေချာသော အရာများ ရှိပါသလား။'}
                </label>
                <textarea
                  value={profileData.concerns || ''}
                  onChange={(e) => setProfileData(prev => ({
                    ...prev,
                    concerns: e.target.value
                  }))}
                  rows={4}
                  className="block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder={language === 'en' ? 'Share your concerns or questions...' : 'သင့်စိုးရိမ်မှုများ သို့မဟုတ် မေးခွန်းများကို မျှဝေပါ...'}
                />
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (initialLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          {language === 'en' ? 'Welcome & Setup' : 'ကြိုဆိုခြင်းနှင့် စတင်ခြင်း'}
        </h1>
        <p className="text-gray-600">
          {language === 'en'
            ? 'Let\'s get your journey started with these important steps'
            : 'ဤအရေးကြီးသော အဆင့်များဖြင့် သင့်ခရီးစဉ်ကို စတင်ကြပါစို့'}
        </p>
      </div>

      <div className="mb-8">
        <div className="h-2 bg-gray-200 rounded-full">
          <div 
            className="h-2 bg-blue-600 rounded-full transition-all duration-300"
            style={{ width: `${(currentStep / 3) * 100}%` }}
          />
        </div>
        <div className="mt-2 text-sm text-gray-600 text-right">
          {currentStep} of 3
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
        {renderStep()}
      </div>

      <div className="flex justify-between">
        <button
          onClick={handlePrevious}
          disabled={currentStep === 1}
          className="px-6 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {language === 'en' ? 'Previous' : 'နောက်သို့'}
        </button>
        <button
          onClick={handleNext}
          disabled={loading || (currentStep === 1 && !profileData.firstName)}
          className="px-6 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
          ) : currentStep === 3 ? (
            language === 'en' ? 'Complete Setup' : 'စီစဉ်မှုပြီးဆုံးပါပြီ'
          ) : (
            language === 'en' ? 'Next' : 'ရှေ့သို့'
          )}
        </button>
      </div>
    </div>
  );
};

export default InitialOnboardingChecklist;