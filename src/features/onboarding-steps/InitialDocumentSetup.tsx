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
  Wallet,
  CreditCard,
  Phone,
  Globe,
  Landmark,
  Truck
} from 'lucide-react';

const InitialDocumentSetup = () => {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const [checklist, setChecklist] = useState<Record<string, boolean>>({});
  const [expandedCard, setExpandedCard] = useState<string | null>('ssn');

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
          i94: false,
          bank_checking: false,
          bank_savings: false,
          internet: false
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

  const i94Steps = [
    {
      id: 'access',
      title: language === 'en' ? 'How to Access Your I-94' : 'သင့် I-94 ကို ဘယ်လိုရယူမလဲ',
      items: [
        language === 'en' ? 'Visit the CBP I-94 website (i94.cbp.dhs.gov)' : 'CBP I-94 ဝက်ဘ်ဆိုက်သို့ သွားပါ (i94.cbp.dhs.gov)',
        language === 'en' ? 'Enter your personal information' : 'သင့်ကိုယ်ရေးအချက်အလက်များ ဖြည့်သွင်းပါ',
        language === 'en' ? 'View and print your I-94 record' : 'သင့် I-94 မှတ်တမ်းကို ကြည့်ရှုပြီး ပရင့်ထုတ်ပါ'
      ]
    },
    {
      id: 'importance',
      title: language === 'en' ? 'Why It\'s Important' : 'အဘယ်ကြောင့် အရေးကြီးသနည်း',
      items: [
        language === 'en' ? 'Proves legal entry into the U.S.' : 'အမေရိကန်သို့ တရားဝင်ဝင်ရောက်ကြောင်း သက်သေပြသည်',
        language === 'en' ? 'Required for SSN application' : 'SSN လျှောက်ထားရန် လိုအပ်သည်',
        language === 'en' ? 'Needed for DMV ID/driver\'s license' : 'DMV ID/ယာဉ်မောင်းလိုင်စင်အတွက် လိုအပ်သည်',
        language === 'en' ? 'Verifies authorized stay duration' : 'ခွင့်ပြုထားသော နေထိုင်ခွင့်ကာလကို အတည်ပြုသည်'
      ]
    }
  ];

  const dmvSteps = [
    {
      id: 'prepare',
      title: language === 'en' ? 'Documents to Prepare' : 'ပြင်ဆင်ရန် စာရွက်စာတမ်းများ',
      items: [
        language === 'en' ? 'Proof of identity (passport, visa)' : 'မည်သူမည်ဝါဖြစ်ကြောင်း အထောက်အထား (ပတ်စ်ပို့၊ ဗီဇာ)',
        language === 'en' ? 'Proof of residency (2 documents)' : 'နေထိုင်မှုအထောက်အထား (စာရွက်စာတမ်း ၂ ခု)',
        language === 'en' ? 'Social Security Number or SSN ineligibility letter' : 'လူမှုဖူလုံရေးနံပါတ် သို့မဟုတ် SSN အကျုံးမဝင်ကြောင်း စာ',
        language === 'en' ? 'Proof of legal presence (I-94)' : 'တရားဝင်ရှိနေကြောင်း အထောက်အထား (I-94)'
      ]
    },
    {
      id: 'application',
      title: language === 'en' ? 'Application Process' : 'လျှောက်ထားမှု လုပ်ငန်းစဉ်',
      items: [
        language === 'en' ? 'Complete application form DL 44' : 'လျှောက်လွှာပုံစံ DL 44 ကို ဖြည့်စွက်ပါ',
        language === 'en' ? 'Schedule appointment online' : 'အွန်လိုင်းတွင် ချိန်းဆိုမှု စီစဉ်ပါ',
        language === 'en' ? 'Pay application fee' : 'လျှောက်လွှာကြေး ပေးဆောင်ပါ',
        language === 'en' ? 'Take vision test' : 'အမြင်အာရုံ စစ်ဆေးမှု ခံယူပါ',
        language === 'en' ? 'Take photo and fingerprints' : 'ဓာတ်ပုံရိုက်ပြီး လက်ဗွေယူပါ',
        language === 'en' ? 'Pass written knowledge test' : 'စာဖြင့်ရေးသားထားသော ဗဟုသုတ စစ်ဆေးမှုကို အောင်မြင်ပါ'
      ]
    }
  ];

  const bankingSteps = [
    {
      id: 'documents',
      title: language === 'en' ? 'Documents Needed' : 'လိုအပ်သော စာရွက်စာတမ်းများ',
      items: [
        language === 'en' ? 'Government-issued ID (passport, driver\'s license)' : 'အစိုးရထုတ်ပေးသော ID (ပတ်စ်ပို့၊ ယာဉ်မောင်းလိုင်စင်)',
        language === 'en' ? 'Social Security Number (or ITIN)' : 'လူမှုဖူလုံရေးနံပါတ် (သို့မဟုတ် ITIN)',
        language === 'en' ? 'Proof of address (utility bill, lease)' : 'လိပ်စာအထောက်အထား (ဝန်ဆောင်မှုငွေတောင်းခံလွှာ၊ အိမ်ငှားစာချုပ်)',
        language === 'en' ? 'Initial deposit (varies by bank)' : 'ကနဦးအပ်ငွေ (ဘဏ်အလိုက် ကွဲပြားသည်)'
      ]
    },
    {
      id: 'accounts',
      title: language === 'en' ? 'Types of Accounts' : 'အကောင့်အမျိုးအစားများ',
      items: [
        language === 'en' ? 'Checking: For daily transactions, bills, and purchases' : 'Checking: နေ့စဉ်ငွေလွှဲပြောင်းမှုများ၊ ငွေတောင်းခံလွှာများနှင့် ဝယ်ယူမှုများအတွက်',
        language === 'en' ? 'Savings: For emergency funds and future goals' : 'Savings: အရေးပေါ်ရန်ပုံငွေနှင့် အနာဂတ်ပန်းတိုင်များအတွက်',
        language === 'en' ? 'Consider no-fee accounts for beginners' : 'အစပိုင်းသူများအတွက် အခကြေးငွေမရှိသော အကောင့်များကို စဉ်းစားပါ'
      ]
    },
    {
      id: 'tips',
      title: language === 'en' ? 'Banking Tips' : 'ဘဏ်လုပ်ငန်းအကြံပြုချက်များ',
      items: [
        language === 'en' ? 'Compare fees and minimum balance requirements' : 'အခကြေးငွေများနှင့် အနည်းဆုံးလက်ကျန်ငွေ လိုအပ်ချက်များကို နှိုင်းယှဉ်ပါ',
        language === 'en' ? 'Set up direct deposit for paychecks' : 'လစာများအတွက် တိုက်ရိုက်အပ်ငွေ စီစဉ်ပါ',
        language === 'en' ? 'Download the bank\'s mobile app' : 'ဘဏ်၏ မိုဘိုင်းအက်ပ်ကို ဒေါင်းလုဒ်လုပ်ပါ',
        language === 'en' ? 'Sign up for online banking' : 'အွန်လိုင်းဘဏ်လုပ်ငန်းအတွက် စာရင်းသွင်းပါ'
      ]
    }
  ];

  const phoneInternetSteps = [
    {
      id: 'phone',
      title: language === 'en' ? 'Getting a U.S. Phone Number' : 'အမေရိကန် ဖုန်းနံပါတ် ရယူခြင်း',
      items: [
        language === 'en' ? 'Choose a carrier (T-Mobile, AT&T, Verizon, etc.)' : 'ဝန်ဆောင်မှုပေးသူ ရွေးချယ်ပါ (T-Mobile, AT&T, Verizon, စသည်)',
        language === 'en' ? 'Decide between prepaid or postpaid plan' : 'ကြိုတင်ငွေဖြည့် သို့မဟုတ် လစဉ်ကျသင့်ငွေ အစီအစဉ်ကြား ဆုံးဖြတ်ပါ',
        language === 'en' ? 'Required documents: ID and proof of address' : 'လိုအပ်သော စာရွက်စာတမ်းများ- ID နှင့် လိပ်စာအထောက်အထား',
        language === 'en' ? 'Consider family plans for multiple lines' : 'လိုင်းအများအပြားအတွက် မိသားစုအစီအစဉ်များကို စဉ်းစားပါ'
      ]
    },
    {
      id: 'internet',
      title: language === 'en' ? 'Setting Up Home Internet' : 'အိမ်အင်တာနက် တပ်ဆင်ခြင်း',
      items: [
        language === 'en' ? 'Research providers in your area' : 'သင့်ဒေသရှိ ဝန်ဆောင်မှုပေးသူများကို လေ့လာပါ',
        language === 'en' ? 'Compare plans and speeds' : 'အစီအစဉ်များနှင့် အမြန်နှုန်းများကို နှိုင်းယှဉ်ပါ',
        language === 'en' ? 'Schedule installation appointment' : 'တပ်ဆင်ရန် ချိန်းဆိုမှု စီစဉ်ပါ',
        language === 'en' ? 'Consider bundled services (internet + TV)' : 'ပေါင်းစည်းဝန်ဆောင်မှုများကို စဉ်းစားပါ (အင်တာနက် + TV)'
      ]
    },
    {
      id: 'tips',
      title: language === 'en' ? 'Money-Saving Tips' : 'ငွေချွေတာရေး အကြံပြုချက်များ',
      items: [
        language === 'en' ? 'Ask about new customer promotions' : 'ဖောက်သည်သစ်ပရိုမိုးရှင်းများအကြောင်း မေးမြန်းပါ',
        language === 'en' ? 'Check if your employer offers phone discounts' : 'သင့်အလုပ်ရှင်က ဖုန်းလျှော့စျေးများ ပေးသလားဆိုတာ စစ်ဆေးပါ',
        language === 'en' ? 'Look for low-income internet programs' : 'ဝင်ငွေနည်းသူများအတွက် အင်တာနက်အစီအစဉ်များကို ရှာဖွေပါ',
        language === 'en' ? 'Avoid international calling fees with apps like WhatsApp' : 'WhatsApp ကဲ့သို့သော အက်ပ်များဖြင့် နိုင်ငံတကာခေါ်ဆိုမှု အခကြေးငွေများကို ရှောင်ကြဉ်ပါ'
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

  const renderI94Card = () => (
    <div className="p-4 bg-white rounded-lg border border-gray-200 space-y-4">
      <button
        onClick={() => setExpandedCard(expandedCard === 'i94' ? null : 'i94')}
        className="w-full flex items-center justify-between"
      >
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <input
              type="checkbox"
              checked={checklist.i94}
              onChange={(e) => updateChecklist('i94', e.target.checked)}
              className="h-5 w-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
            />
          </div>
          <div className="ml-3">
            <p className="font-medium text-gray-800">
              {language === 'en' ? '✈️ Access Your I-94 Record' : '✈️ သင့် I-94 မှတ်တမ်းကို ရယူပါ'}
            </p>
          </div>
        </div>
        {expandedCard === 'i94' ? (
          <ChevronUp className="h-5 w-5 text-gray-400" />
        ) : (
          <ChevronDown className="h-5 w-5 text-gray-400" />
        )}
      </button>

      {expandedCard === 'i94' && (
        <div className="mt-4 space-y-6">
          {i94Steps.map((step) => (
            <div key={step.id} className="space-y-2">
              <h4 className="font-medium text-gray-800 flex items-center">
                {step.id === 'access' && <Globe className="h-4 w-4 text-blue-600 mr-2" />}
                {step.id === 'importance' && <Lightbulb className="h-4 w-4 text-blue-600 mr-2" />}
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
                href="https://i94.cbp.dhs.gov/I94/#/home"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center text-blue-600 hover:text-blue-700"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                {language === 'en' ? 'Official I-94 Website' : 'တရားဝင် I-94 ဝက်ဘ်ဆိုက်'}
              </a>
              <a
                href="https://help.cbp.gov/s/article/Article-982?language=en_US"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center text-blue-600 hover:text-blue-700"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                {language === 'en' ? 'I-94 FAQ' : 'I-94 မေးလေ့ရှိသော မေးခွန်းများ'}
              </a>
            </div>
          </div>

          <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
            <div className="flex items-start">
              <AlertCircle className="h-5 w-5 text-blue-500 mt-0.5 mr-2" />
              <p className="text-sm text-blue-700">
                {language === 'en'
                  ? 'Your I-94 is a critical document that proves you legally entered the U.S. You\'ll need it for many important applications, including your SSN and driver\'s license.'
                  : 'သင့် I-94 သည် သင် အမေရိကန်သို့ တရားဝင်ဝင်ရောက်ကြောင်း သက်သေပြသည့် အရေးကြီးသော စာရွက်စာတမ်းဖြစ်သည်။ သင့် SSN နှင့် ယာဉ်မောင်းလိုင်စင်အပါအဝင် အရေးကြီးသော လျှောက်လွှာများစွာအတွက် ၎င်းကို လိုအပ်ပါမည်။'}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderDmvCard = () => (
    <div className="p-4 bg-white rounded-lg border border-gray-200 space-y-4">
      <button
        onClick={() => setExpandedCard(expandedCard === 'dmv' ? null : 'dmv')}
        className="w-full flex items-center justify-between"
      >
        <div className="flex items-center">
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
              {language === 'en' ? '🪪 Get State ID/Driver\'s License' : '🪪 ပြည်နယ် ID/ယာဉ်မောင်းလိုင်စင် ရယူပါ'}
            </p>
          </div>
        </div>
        {expandedCard === 'dmv' ? (
          <ChevronUp className="h-5 w-5 text-gray-400" />
        ) : (
          <ChevronDown className="h-5 w-5 text-gray-400" />
        )}
      </button>

      {expandedCard === 'dmv' && (
        <div className="mt-4 space-y-6">
          {dmvSteps.map((step) => (
            <div key={step.id} className="space-y-2">
              <h4 className="font-medium text-gray-800 flex items-center">
                {step.id === 'prepare' && <FileText className="h-4 w-4 text-blue-600 mr-2" />}
                {step.id === 'application' && <Mail className="h-4 w-4 text-blue-600 mr-2" />}
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
                href="https://www.dmv.ca.gov/portal/driver-licenses-identification-cards/real-id/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center text-blue-600 hover:text-blue-700"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                {language === 'en' ? 'California DMV REAL ID Guide' : 'ကယ်လီဖိုးနီးယား DMV REAL ID လမ်းညွှန်'}
              </a>
              <a
                href="https://www.dmv.ca.gov/portal/appointments/select-appointment-type"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center text-blue-600 hover:text-blue-700"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                {language === 'en' ? 'Schedule DMV Appointment' : 'DMV ချိန်းဆိုမှု စီစဉ်ရန်'}
              </a>
              <a
                href="https://www.dmv.ca.gov/portal/driver-licenses-identification-cards/driver-licenses-dl/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center text-blue-600 hover:text-blue-700"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                {language === 'en' ? 'Driver\'s License Information' : 'ယာဉ်မောင်းလိုင်စင် အချက်အလက်'}
              </a>
            </div>
          </div>

          <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
            <div className="flex items-start">
              <AlertCircle className="h-5 w-5 text-blue-500 mt-0.5 mr-2" />
              <p className="text-sm text-blue-700">
                {language === 'en'
                  ? 'A state ID or driver\'s license is essential for identification in the U.S. It\'s accepted for most daily transactions and is more convenient than carrying your passport.'
                  : 'ပြည်နယ် ID သို့မဟုတ် ယာဉ်မောင်းလိုင်စင်သည် အမေရိကန်တွင် မှတ်ပုံတင်ရန် မရှိမဖြစ်လိုအပ်သည်။ ၎င်းသည် နေ့စဉ်ငွေပေးချေမှုအများစုအတွက် လက်ခံပြီး သင့်ပတ်စ်ပို့ကို သယ်ဆောင်ခြင်းထက် ပိုမိုအဆင်ပြေသည်။'}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderBankingCard = () => (
    <div className="p-4 bg-white rounded-lg border border-gray-200 space-y-4">
      <button
        onClick={() => setExpandedCard(expandedCard === 'banking' ? null : 'banking')}
        className="w-full flex items-center justify-between"
      >
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <input
              type="checkbox"
              checked={checklist.bank_checking || checklist.bank_savings}
              onChange={(e) => {
                updateChecklist('bank_checking', e.target.checked);
                updateChecklist('bank_savings', e.target.checked);
              }}
              className="h-5 w-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
            />
          </div>
          <div className="ml-3">
            <p className="font-medium text-gray-800">
              {language === 'en' ? '💳 Open Bank Account' : '💳 ဘဏ်အကောင့် ဖွင့်ပါ'}
            </p>
          </div>
        </div>
        {expandedCard === 'banking' ? (
          <ChevronUp className="h-5 w-5 text-gray-400" />
        ) : (
          <ChevronDown className="h-5 w-5 text-gray-400" />
        )}
      </button>

      {expandedCard === 'banking' && (
        <div className="mt-4 space-y-6">
          {bankingSteps.map((step) => (
            <div key={step.id} className="space-y-2">
              <h4 className="font-medium text-gray-800 flex items-center">
                {step.id === 'documents' && <FileText className="h-4 w-4 text-blue-600 mr-2" />}
                {step.id === 'accounts' && <CreditCard className="h-4 w-4 text-blue-600 mr-2" />}
                {step.id === 'tips' && <Lightbulb className="h-4 w-4 text-blue-600 mr-2" />}
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

          <div className="space-y-3 pt-4 border-t border-gray-200">
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={checklist.bank_checking}
                onChange={(e) => updateChecklist('bank_checking', e.target.checked)}
                className="h-5 w-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
              />
              <label className="ml-3 text-gray-700">
                {language === 'en' ? 'Open checking account' : 'Checking အကောင့် ဖွင့်ပါ'}
              </label>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={checklist.bank_savings}
                onChange={(e) => updateChecklist('bank_savings', e.target.checked)}
                className="h-5 w-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
              />
              <label className="ml-3 text-gray-700">
                {language === 'en' ? 'Open savings account' : 'Savings အကောင့် ဖွင့်ပါ'}
              </label>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-200">
            <h4 className="font-medium text-gray-800 mb-2">
              {language === 'en' ? 'Recommended Banks for Newcomers' : 'နိုင်ငံသစ်ရောက်သူများအတွက် အကြံပြုထားသော ဘဏ်များ'}
            </h4>
            <div className="space-y-2">
              <a
                href="https://www.bankofamerica.com/checking/advantage-banking/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center text-blue-600 hover:text-blue-700"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Bank of America
              </a>
              <a
                href="https://www.chase.com/personal/checking"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center text-blue-600 hover:text-blue-700"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Chase Bank
              </a>
              <a
                href="https://www.capitalone.com/bank/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center text-blue-600 hover:text-blue-700"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Capital One
              </a>
            </div>
          </div>

          <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
            <div className="flex items-start">
              <AlertCircle className="h-5 w-5 text-blue-500 mt-0.5 mr-2" />
              <p className="text-sm text-blue-700">
                {language === 'en'
                  ? 'A bank account is essential for managing your finances in the U.S. It provides a safe place for your money and makes it easier to pay bills, receive your salary, and build a financial history.'
                  : 'ဘဏ်အကောင့်သည် အမေရိကန်တွင် သင့်ငွေကြေးကို စီမံခန့်ခွဲရန် မရှိမဖြစ်လိုအပ်သည်။ ၎င်းသည် သင့်ငွေအတွက် လုံခြုံသောနေရာကို ပေးပြီး ငွေတောင်းခံလွှာများ ပေးချေရန်၊ သင့်လစာကို လက်ခံရန်နှင့် ငွေကြေးမှတ်တမ်းကို တည်ဆောက်ရန် ပိုမိုလွယ်ကူစေသည်။'}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderPhoneInternetCard = () => (
    <div className="p-4 bg-white rounded-lg border border-gray-200 space-y-4">
      <button
        onClick={() => setExpandedCard(expandedCard === 'phone_internet' ? null : 'phone_internet')}
        className="w-full flex items-center justify-between"
      >
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <input
              type="checkbox"
              checked={checklist.phone && checklist.internet}
              onChange={(e) => {
                updateChecklist('phone', e.target.checked);
                updateChecklist('internet', e.target.checked);
              }}
              className="h-5 w-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
            />
          </div>
          <div className="ml-3">
            <p className="font-medium text-gray-800">
              {language === 'en' ? '📱 Set Up Phone & Internet' : '📱 ဖုန်းနှင့် အင်တာနက် စီစဉ်ပါ'}
            </p>
          </div>
        </div>
        {expandedCard === 'phone_internet' ? (
          <ChevronUp className="h-5 w-5 text-gray-400" />
        ) : (
          <ChevronDown className="h-5 w-5 text-gray-400" />
        )}
      </button>

      {expandedCard === 'phone_internet' && (
        <div className="mt-4 space-y-6">
          {phoneInternetSteps.map((step) => (
            <div key={step.id} className="space-y-2">
              <h4 className="font-medium text-gray-800 flex items-center">
                {step.id === 'phone' && <Phone className="h-4 w-4 text-blue-600 mr-2" />}
                {step.id === 'internet' && <Globe className="h-4 w-4 text-blue-600 mr-2" />}
                {step.id === 'tips' && <Lightbulb className="h-4 w-4 text-blue-600 mr-2" />}
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

          <div className="space-y-3 pt-4 border-t border-gray-200">
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={checklist.phone}
                onChange={(e) => updateChecklist('phone', e.target.checked)}
                className="h-5 w-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
              />
              <label className="ml-3 text-gray-700">
                {language === 'en' ? 'Get U.S. phone number' : 'အမေရိကန် ဖုန်းနံပါတ် ရယူပါ'}
              </label>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={checklist.internet}
                onChange={(e) => updateChecklist('internet', e.target.checked)}
                className="h-5 w-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
              />
              <label className="ml-3 text-gray-700">
                {language === 'en' ? 'Set up home internet' : 'အိမ်အင်တာနက် တပ်ဆင်ပါ'}
              </label>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-200">
            <h4 className="font-medium text-gray-800 mb-2">
              {language === 'en' ? 'Helpful Resources' : 'အကူအညီဖြစ်စေမည့် အရင်းအမြစ်များ'}
            </h4>
            <div className="space-y-2">
              <a
                href="https://www.whistleout.com/CellPhones"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center text-blue-600 hover:text-blue-700"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                {language === 'en' ? 'Compare Cell Phone Plans' : 'ဆဲလ်ဖုန်းအစီအစဉ်များကို နှိုင်းယှဉ်ပါ'}
              </a>
              <a
                href="https://www.broadbandnow.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center text-blue-600 hover:text-blue-700"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                {language === 'en' ? 'Find Internet Providers' : 'အင်တာနက်ဝန်ဆောင်မှုပေးသူများကို ရှာဖွေပါ'}
              </a>
              <a
                href="https://www.fcc.gov/acp"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center text-blue-600 hover:text-blue-700"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                {language === 'en' ? 'Affordable Connectivity Program' : 'တတ်နိုင်သော ချိတ်ဆက်မှုအစီအစဉ်'}
              </a>
            </div>
          </div>

          <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
            <div className="flex items-start">
              <AlertCircle className="h-5 w-5 text-blue-500 mt-0.5 mr-2" />
              <p className="text-sm text-blue-700">
                {language === 'en'
                  ? 'Having a U.S. phone number is essential for job applications, banking, and everyday communication. Internet access at home will help you stay connected and access important resources.'
                  : 'အလုပ်လျှောက်ထားခြင်း၊ ဘဏ်လုပ်ငန်းနှင့် နေ့စဉ်ဆက်သွယ်ရေးအတွက် အမေရိကန်ဖုန်းနံပါတ်ရှိရန် မရှိမဖြစ်လိုအပ်သည်။ အိမ်တွင် အင်တာနက်ရရှိခြင်းသည် သင့်အား ဆက်သွယ်မှုရှိစေပြီး အရေးကြီးသော အရင်းအမြစ်များကို ရယူနိုင်စေမည်။'}
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
            {language === 'en' ? 'Initial Document Setup' : 'ကနဦး စာရွက်စာတမ်း စီစဉ်ခြင်း'}
          </h1>
        </div>

        <div className="prose max-w-none mb-8">
          <p className="text-gray-600">
            {language === 'en'
              ? 'Setting up your essential documents and accounts is a crucial first step in your U.S. journey. Follow this guide to get started with the most important items.'
              : 'သင့်မရှိမဖြစ် စာရွက်စာတမ်းများနှင့် အကောင့်များကို စီစဉ်ခြင်းသည် သင့်အမေရိကန်ခရီးစဉ်တွင် အရေးကြီးသော ပထမဆုံးအဆင့်ဖြစ်သည်။ အရေးအကြီးဆုံးအရာများဖြင့် စတင်ရန် ဤလမ်းညွှန်ကို လိုက်နာပါ။'}
          </p>
        </div>

        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-gray-800 flex items-center">
            <FileText className="h-6 w-6 text-blue-600 mr-2" />
            {language === 'en' ? 'Essential Documents Checklist' : 'မရှိမဖြစ် စာရွက်စာတမ်းများ စစ်ဆေးရန်စာရင်း'}
          </h2>
          <p className="text-gray-600">
            {language === 'en'
              ? 'Complete these steps to establish your identity and legal status in the U.S.'
              : 'အမေရိကန်တွင် သင့်အထောက်အထားနှင့် တရားဝင်အဆင့်အတန်းကို သတ်မှတ်ရန် ဤအဆင့်များကို ပြီးဆုံးအောင် လုပ်ဆောင်ပါ'}
          </p>

          <div className="space-y-6">
            {/* I-94 Record Card */}
            {renderI94Card()}

            {/* SSN/ITIN Card */}
            {renderSsnCard()}

            {/* DMV ID/Driver's License Card */}
            {renderDmvCard()}
          </div>
        </div>

        <div className="mt-10 space-y-6">
          <h2 className="text-xl font-semibold text-gray-800 flex items-center">
            <Wallet className="h-6 w-6 text-blue-600 mr-2" />
            {language === 'en' ? 'Basic Financial Setup' : 'အခြေခံ ငွေကြေးစီစဉ်မှု'}
          </h2>
          <p className="text-gray-600">
            {language === 'en'
              ? 'Set up these essential financial services to manage your money in the U.S.'
              : 'အမေရိကန်တွင် သင့်ငွေကြေးကို စီမံခန့်ခွဲရန် ဤမရှိမဖြစ် ငွေကြေးဝန်ဆောင်မှုများကို စီစဉ်ပါ'}
          </p>

          <div className="space-y-6">
            {/* Banking Card */}
            {renderBankingCard()}
          </div>
        </div>

        <div className="mt-10 space-y-6">
          <h2 className="text-xl font-semibold text-gray-800 flex items-center">
            <Phone className="h-6 w-6 text-blue-600 mr-2" />
            {language === 'en' ? 'Essential Communication Setup' : 'မရှိမဖြစ် ဆက်သွယ်ရေး စီစဉ်မှု'}
          </h2>
          <p className="text-gray-600">
            {language === 'en'
              ? 'Establish reliable communication channels for your daily life in the U.S.'
              : 'အမေရိကန်တွင် သင့်နေ့စဉ်ဘဝအတွက် ယုံကြည်စိတ်ချရသော ဆက်သွယ်ရေးလမ်းကြောင်းများကို တည်ဆောက်ပါ'}
          </p>

          <div className="space-y-6">
            {/* Phone & Internet Card */}
            {renderPhoneInternetCard()}
          </div>
        </div>

        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg mt-8">
          <div className="flex items-start">
            <AlertCircle className="h-5 w-5 text-blue-500 mt-0.5 mr-3" />
            <div>
              <h3 className="font-semibold text-blue-800 mb-1">
                {language === 'en' ? 'Important Documents to Keep' : 'သိမ်းဆည်းရန် အရေးကြီးစာရွက်စာတမ်းများ'}
              </h3>
              <ul className="text-blue-700 text-sm space-y-1">
                <li>• {language === 'en' ? 'Passport and visa documents' : 'ပတ်စ်ပို့နှင့် ဗီဇာစာရွက်စာတမ်းများ'}</li>
                <li>• {language === 'en' ? 'I-94 record (print a copy)' : 'I-94 မှတ်တမ်း (မိတ္တူတစ်စောင် ပရင့်ထုတ်ပါ)'}</li>
                <li>• {language === 'en' ? 'Social Security card' : 'Social Security ကတ်'}</li>
                <li>• {language === 'en' ? 'State ID or driver\'s license' : 'ပြည်နယ် ID သို့မဟုတ် ယာဉ်မောင်းလိုင်စင်'}</li>
                <li>• {language === 'en' ? 'Immigration documents' : 'လူဝင်မှုကြီးကြပ်ရေး စာရွက်စာတမ်းများ'}</li>
                <li>• {language === 'en' ? 'Birth certificate (with translation if needed)' : 'မွေးစာရင်း (လိုအပ်ပါက ဘာသာပြန်ဆိုချက်နှင့်အတူ)'}</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InitialDocumentSetup;