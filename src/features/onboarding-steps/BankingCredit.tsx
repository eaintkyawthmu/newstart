import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import {
  Building,
  ArrowLeft,
  AlertCircle,
  ExternalLink,
  FileText,
  Mail,
  Clock,
  ChevronDown,
  ChevronUp,
  Heart,
  Lightbulb,
  Wallet
} from 'lucide-react';

const BankingCredit = () => {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const [checklist, setChecklist] = useState<Record<string, boolean>>({});
  const [expandedCard, setExpandedCard] = useState<string | null>(null);

  useEffect(() => {
    loadProgress();
  }, []);

  const loadProgress = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('profiles')
        .select('checklist_items')
        .eq('id', user.id)
        .single();

      if (error) throw error;

      if (data?.checklist_items) {
        const savedChecklist: Record<string, boolean> = {
          ssn: false,
          dmv: false,
          phone: false,
          medical: false
        };
        
        data.checklist_items.forEach((item: string) => {
          savedChecklist[item] = true;
        });
        
        setChecklist(savedChecklist);
      }
    } catch (error) {
      console.error('Error loading progress:', error);
    }
  };

  const updateChecklist = async (taskId: string, checked: boolean) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const newChecklist = { ...checklist, [taskId]: checked };
      setChecklist(newChecklist);

      const completedItems = Object.entries(newChecklist)
        .filter(([_, isChecked]) => isChecked)
        .map(([id]) => id);

      const { error } = await supabase
        .from('profiles')
        .update({
          checklist_items: completedItems,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) throw error;
    } catch (error) {
      console.error('Error updating checklist:', error);
      setChecklist(prev => ({ ...prev, [taskId]: !checked }));
    }
  };

  const ssnSteps = [
    {
      id: 'prepare',
      title: language === 'en' ? 'Documents to Prepare' : 'ပြင်ဆင်ရန် စာရွက်စာတမ်းများ',
      items: [
        language === 'en' ? 'Valid passport with visa' : 'သက်တမ်းရှိ ပတ်စ်ပို့နှင့် ဗီဇာ',
        language === 'en' ? 'I-94 travel record' : 'I-94 ခရီးသွားမှတ်တမ်း',
        language === 'en' ? 'Employment authorization (if applicable)' : 'အလုပ်လုပ်ခွင့် (သက်ဆိုင်ပါက)',
        language === 'en' ? 'Birth certificate' : 'မွေးစာရင်း'
      ]
    },
    {
      id: 'application',
      title: language === 'en' ? 'Application Process' : 'လျှောက်ထားမှု လုပ်ငန်းစဉ်',
      items: [
        language === 'en' ? 'Schedule appointment at local SSA office' : 'SSA ရုံးတွင် ချိန်းဆိုမှု စီစဉ်ပါ',
        language === 'en' ? 'Fill out Form SS-5' : 'Form SS-5 ဖြည့်စွက်ပါ',
        language === 'en' ? 'Bring all required documents' : 'လိုအပ်သော စာရွက်စာတမ်းအားလုံး ယူဆောင်လာပါ',
        language === 'en' ? 'Attend in-person interview' : 'လူကိုယ်တိုင် တွေ့ဆုံမေးမြန်းခြင်းသို့ တက်ရောက်ပါ'
      ]
    },
    {
      id: 'timeline',
      title: language === 'en' ? 'Expected Timeline' : 'မျှော်မှန်းအချိန်ဇယား',
      items: [
        language === 'en' ? 'Application review: 2-4 weeks' : 'လျှောက်လွှာစိစစ်ခြင်း- ၂-၄ ပတ်',
        language === 'en' ? 'Card delivery: 7-10 business days' : 'ကတ်ပို့ဆောင်ခြင်း- လုပ်ငန်းရက် ၇-၁၀ ရက်',
        language === 'en' ? 'Total process: 3-6 weeks' : 'စုစုပေါင်းလုပ်ငန်းစဉ်- ၃-၆ ပတ်'
      ]
    }
  ];

  const renderSsnCard = () => (
    <div className="p-4 bg-white rounded-lg border border-gray-200 space-y-4">
      <button
        onClick={() => setExpandedCard(expandedCard === 'ssn' ? null : 'ssn')}
        className="w-full flex items-center justify-between"
      >
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <input
              type="checkbox"
              checked={checklist.ssn}
              onChange={(e) => updateChecklist('ssn', e.target.checked)}
              className="h-5 w-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
            />
          </div>
          <div className="ml-3">
            <p className="font-medium text-gray-800">
              {language === 'en' ? '🧾 Apply for SSN/ITIN' : '🧾 SSN/ITIN လျှောက်ထားပါ'}
            </p>
          </div>
        </div>
        {expandedCard === 'ssn' ? (
          <ChevronUp className="h-5 w-5 text-gray-400" />
        ) : (
          <ChevronDown className="h-5 w-5 text-gray-400" />
        )}
      </button>

      {expandedCard === 'ssn' && (
        <div className="mt-4 space-y-6">
          {ssnSteps.map((step) => (
            <div key={step.id} className="space-y-2">
              <h4 className="font-medium text-gray-800 flex items-center">
                {step.id === 'prepare' && <FileText className="h-4 w-4 text-blue-600 mr-2" />}
                {step.id === 'application' && <Mail className="h-4 w-4 text-blue-600 mr-2" />}
                {step.id === 'timeline' && <Clock className="h-4 w-4 text-blue-600 mr-2" />}
                {step.title}
              </h4>
              <ul className="space-y-2 ml-6">
                {step.items.map((item, index) => (
                  <li key={index} className="flex items-center text-gray-600 text-sm">
                    <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mr-2"></div>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div className="pt-4 border-t border-gray-200">
            <h4 className="font-medium text-gray-800 mb-2">
              {language === 'en' ? 'Helpful Resources' : 'အကူအညီဖြစ်စေမည့် အရင်းအမြစ်များ'}
            </h4>
            <div className="space-y-2">
              <a
                href="https://www.ssa.gov/ssnumber/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center text-blue-600 hover:text-blue-700"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                {language === 'en' ? 'Official SSA Website' : 'တရားဝင် SSA ဝက်ဘ်ဆိုက်'}
              </a>
              <a
                href="https://www.ssa.gov/forms/ss-5.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center text-blue-600 hover:text-blue-700"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                {language === 'en' ? 'Form SS-5 (Application)' : 'Form SS-5 (လျှောက်လွှာ)'}
              </a>
              <a
                href="https://secure.ssa.gov/ICON/main.jsp"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center text-blue-600 hover:text-blue-700"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                {language === 'en' ? 'Find Local SSA Office' : 'နီးစပ်ရာ SSA ရုံး ရှာဖွေရန်'}
              </a>
            </div>
          </div>

          <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
            <div className="flex items-start">
              <AlertCircle className="h-5 w-5 text-blue-500 mt-0.5 mr-2" />
              <p className="text-sm text-blue-700">
                {language === 'en'
                  ? 'Processing times may vary. You can check your application status online using the confirmation number provided during your appointment.'
                  : 'လုပ်ငန်းစဉ်ကြာချိန်များ ကွာခြားနိုင်ပါသည်။ သင့်ချိန်းဆိုမှုအတွင်း ပေးထားသော အတည်ပြုနံပါတ်ကို အသုံးပြု၍ သင့်လျှောက်လွှာအခြေအနေကို အွန်လိုင်းတွင် စစ်ဆေးနိုင်ပါသည်။'}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <button
        onClick={() => navigate('/journey')}
        className="flex items-center text-gray-600 hover:text-gray-800"
      >
        <ArrowLeft className="h-5 w-5 mr-2" />
        {language === 'en' ? 'Back to Journey Hub' : 'ခရီးစဉ်စင်တာသို့ ပြန်သွားရန်'}
      </button>

      <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
        <div className="flex items-center mb-6">
          <Building className="h-8 w-8 text-blue-600 mr-3" />
          <h1 className="text-2xl font-bold text-gray-800">
            {language === 'en' ? 'Banking & Credit Setup' : 'ဘဏ်လုပ်ငန်းနှင့် ခရက်ဒစ် စီစဉ်ခြင်း'}
          </h1>
        </div>

        <div className="prose max-w-none mb-8">
          <p className="text-gray-600">
            {language === 'en'
              ? 'Setting up your banking and starting to build credit are crucial steps in your financial journey. Follow this guide to get started safely and effectively.'
              : 'သင့်ဘဏ်လုပ်ငန်းကို စီစဉ်ခြင်းနှင့် ခရက်ဒစ်တည်ဆောက်ခြင်းစတင်ခြင်းသည် သင့်ငွေကြေးခရီးတွင် အရေးကြီးသော အဆင့်များဖြစ်သည်။ ဘေးကင်းပြီး ထိရောက်စွာ စတင်ရန် ဤလမ်းညွှန်ကို လိုက်နာပါ။'}
          </p>
        </div>

        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-gray-800 flex items-center">
            <FileText className="h-6 w-6 text-blue-600 mr-2" />
            {language === 'en' ? 'Step 3: Getting Started Checklist' : 'အဆင့် ၃: စတင်ရန် စစ်ဆေးရန်စာရင်း'}
          </h2>
          <p className="text-gray-600">
            {language === 'en'
              ? 'Essential tasks to help you settle in'
              : 'သင်အခြေချနိုင်ရန် မရှိမဖြစ်လုပ်ငန်းစဉ်များ'}
          </p>

          <div className="space-y-6">
            <div>
              <h3 className="font-medium text-gray-800 mb-4">
                {language === 'en' ? 'Essential Documents' : 'မရှိမဖြစ် စာရွက်စာတမ်းများ'}
              </h3>
              <div className="space-y-4">
                {renderSsnCard()}

                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <input
                        type="checkbox"
                        checked={checklist.dmv}
                        onChange={(e) => updateChecklist('dmv', e.target.checked)}
                        className="h-5 w-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                      />
                    </div>
                    <div className="ml-3">
                      <p className="font-medium text-gray-800">
                        {language === 'en' ? '🪪 Get CA ID/Driver\'s License' : '🪪 CA ID/ယာဉ်မောင်းလိုင်စင် ရယူပါ'}
                      </p>
                      <a
                        href="https://www.dmv.ca.gov/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:text-blue-700 flex items-center mt-1"
                      >
                        {language === 'en' ? 'Learn More' : 'ပိုမိုလေ့လာရန်'}
                        <ExternalLink className="h-4 w-4 ml-1" />
                      </a>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <input
                        type="checkbox"
                        checked={checklist.phone}
                        onChange={(e) => updateChecklist('phone', e.target.checked)}
                        className="h-5 w-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                      />
                    </div>
                    <div className="ml-3">
                      <p className="font-medium text-gray-800">
                        {language === 'en' ? '📞 Set up phone + internet plan' : '📞 ဖုန်း + အင်တာနက် အစီအစဉ် စီစဉ်ပါ'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <input
                        type="checkbox"
                        checked={checklist.medical}
                        onChange={(e) => updateChecklist('medical', e.target.checked)}
                        className="h-5 w-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                      />
                    </div>
                    <div className="ml-3">
                      <p className="font-medium text-gray-800">
                        {language === 'en' ? '🏥 Apply for Medi-Cal or Covered California' : '🏥 Medi-Cal သို့မဟုတ် Covered California လျှောက်ထားပါ'}
                      </p>
                      <a
                        href="https://www.coveredca.com/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:text-blue-700 flex items-center mt-1"
                      >
                        {language === 'en' ? 'Learn More' : 'ပိုမိုလေ့လာရန်'}
                        <ExternalLink className="h-4 w-4 ml-1" />
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start">
                <AlertCircle className="h-5 w-5 text-blue-500 mt-0.5 mr-3" />
                <div>
                  <h3 className="font-semibold text-blue-800 mb-1">
                    {language === 'en' ? 'Important Documents to Keep' : 'သိမ်းဆည်းရန် အရေးကြီးစာရွက်စာတမ်းများ'}
                  </h3>
                  <ul className="text-blue-700 text-sm space-y-1">
                    <li>• {language === 'en' ? 'Passport and visa documents' : 'ပတ်စ်ပို့နှင့် ဗီဇာစာရွက်စာတမ်းများ'}</li>
                    <li>• {language === 'en' ? 'Birth certificates' : 'မွေးစာရင်းများ'}</li>
                    <li>• {language === 'en' ? 'Social Security card' : 'Social Security ကတ်'}</li>
                    <li>• {language === 'en' ? 'Immigration documents' : 'လူဝင်မှုကြီးကြပ်ရေး စာရွက်စာတမ်းများ'}</li>
                    <li>• {language === 'en' ? 'Tax records' : 'အခွန်မှတ်တမ်းများ'}</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BankingCredit;