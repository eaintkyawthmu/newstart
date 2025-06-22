import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import {
  Shield,
  ArrowLeft,
  AlertCircle,
  ExternalLink,
  Phone,
  Heart,
  Flame,
  Siren,
  MapPin,
  FileText,
  ChevronDown,
  ChevronUp,
  Lightbulb,
  Home
} from 'lucide-react';

const SafetyEmergency = () => {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const [checklist, setChecklist] = useState<Record<string, boolean>>({});
  const [expandedCard, setExpandedCard] = useState<string | null>('emergency');

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
          emergency_contacts: false,
          emergency_kit: false,
          medical_info: false,
          local_resources: false,
          safety_plan: false
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

  const emergencySteps = [
    {
      id: 'when',
      title: language === 'en' ? 'When to Call 911' : '911 ကို ဘယ်အချိန်မှာ ခေါ်ရမလဲ',
      items: [
        language === 'en' ? 'Life-threatening medical emergencies' : 'အသက်အန္တရာယ်ရှိသော ဆေးဘက်ဆိုင်ရာ အရေးပေါ်အခြေအနေများ',
        language === 'en' ? 'Fire emergencies' : 'မီးဘေးအရေးပေါ်အခြေအနေများ',
        language === 'en' ? 'Crimes in progress' : 'ဖြစ်ပွားနေဆဲ ရာဇဝတ်မှုများ',
        language === 'en' ? 'Car accidents with injuries' : 'ဒဏ်ရာရရှိမှုများဖြင့် ကားမတော်တဆမှုများ',
        language === 'en' ? 'Suspicious activities that pose immediate danger' : 'ချက်ချင်းအန္တရာယ်ဖြစ်စေနိုင်သော သံသယဖြစ်ဖွယ် လှုပ်ရှားမှုများ'
      ]
    },
    {
      id: 'how',
      title: language === 'en' ? 'How to Call 911' : '911 ကို ဘယ်လိုခေါ်ရမလဲ',
      items: [
        language === 'en' ? 'Stay calm and speak clearly' : 'တည်ငြိမ်စွာနေပြီး ရှင်းလင်းစွာ ပြောဆိုပါ',
        language === 'en' ? 'State your emergency immediately' : 'သင့်အရေးပေါ်အခြေအနေကို ချက်ချင်းပြောပါ',
        language === 'en' ? 'Provide your exact location' : 'သင့်တည်နေရာအတိအကျကို ပေးပါ',
        language === 'en' ? 'Answer all questions from the dispatcher' : 'စေလွှတ်သူထံမှ မေးခွန်းအားလုံးကို ဖြေပါ',
        language === 'en' ? 'Don\'t hang up until told to do so' : 'ထိုသို့ပြုလုပ်ရန် မပြောမချင်း ဖုန်းမချပါနှင့်'
      ]
    },
    {
      id: 'non-emergency',
      title: language === 'en' ? 'Non-Emergency Numbers' : 'အရေးပေါ်မဟုတ်သော နံပါတ်များ',
      items: [
        language === 'en' ? 'Local police non-emergency line' : 'ဒေသခံရဲ အရေးပေါ်မဟုတ်သော လိုင်း',
        language === 'en' ? '311 for city services (where available)' : 'မြို့ဝန်ဆောင်မှုများအတွက် 311 (ရရှိနိုင်သောနေရာတွင်)',
        language === 'en' ? 'Poison Control: 1-800-222-1222' : 'အဆိပ်ထိန်းချုပ်ရေး- 1-800-222-1222',
        language === 'en' ? 'Mental health crisis line: 988' : 'စိတ်ကျန်းမာရေး အကျပ်အတည်းလိုင်း- 988'
      ]
    }
  ];

  const emergencyKitSteps = [
    {
      id: 'basics',
      title: language === 'en' ? 'Basic Emergency Kit' : 'အခြေခံ အရေးပေါ်အိတ်',
      items: [
        language === 'en' ? 'Water (one gallon per person per day for several days)' : 'ရေ (လူတစ်ဦးလျှင် တစ်ရက်တစ်ဂါလံနှုန်းဖြင့် ရက်အနည်းငယ်စာ)',
        language === 'en' ? 'Non-perishable food (at least a three-day supply)' : 'မပုပ်သိုးနိုင်သော အစားအစာ (အနည်းဆုံး သုံးရက်စာ)',
        language === 'en' ? 'Battery-powered or hand crank radio' : 'ဘက်ထရီသုံး သို့မဟုတ် လက်လှည့် ရေဒီယို',
        language === 'en' ? 'Flashlight and extra batteries' : 'ဓာတ်မီးနှင့် အပိုဘက်ထရီများ',
        language === 'en' ? 'First aid kit' : 'ရှေးဦးသူနာပြုအိတ်',
        language === 'en' ? 'Whistle (to signal for help)' : 'ဝီစီ (အကူအညီတောင်းရန်)',
        language === 'en' ? 'Dust mask, plastic sheeting, and duct tape' : 'ဖုန်မျက်နှာဖုံး၊ ပလတ်စတစ်အခင်းနှင့် တိပ်',
        language === 'en' ? 'Moist towelettes, garbage bags, and plastic ties' : 'စိုစွတ်သော လက်သုတ်ပဝါများ၊ အမှိုက်အိတ်များနှင့် ပလတ်စတစ်ကြိုးများ',
        language === 'en' ? 'Cell phone with chargers and a backup battery' : 'အားသွင်းကြိုးများနှင့် အရန်ဘက်ထရီပါသော ဆဲလ်ဖုန်း'
      ]
    },
    {
      id: 'documents',
      title: language === 'en' ? 'Important Documents' : 'အရေးကြီးစာရွက်စာတမ်းများ',
      items: [
        language === 'en' ? 'Copies of ID and passport' : 'ID နှင့် ပတ်စ်ပို့ မိတ္တူများ',
        language === 'en' ? 'Insurance policies' : 'အာမခံမူဝါဒများ',
        language === 'en' ? 'Bank account records' : 'ဘဏ်အကောင့်မှတ်တမ်းများ',
        language === 'en' ? 'Emergency contact information' : 'အရေးပေါ်ဆက်သွယ်ရန် အချက်အလက်',
        language === 'en' ? 'Medical information and prescriptions' : 'ဆေးဘက်ဆိုင်ရာ အချက်အလက်နှင့် ဆေးညွှန်းများ'
      ]
    }
  ];

  const safetyTipsSteps = [
    {
      id: 'home',
      title: language === 'en' ? 'Home Safety' : 'အိမ်လုံခြုံရေး',
      items: [
        language === 'en' ? 'Install smoke and carbon monoxide detectors' : 'မီးခိုးနှင့် ကာဗွန်မိုနောက်ဆိုဒ် ထုတ်လွှတ်မှု စစ်ဆေးစက်များ တပ်ဆင်ပါ',
        language === 'en' ? 'Keep doors and windows locked' : 'တံခါးများနှင့် ပြတင်းပေါက်များကို သော့ခတ်ထားပါ',
        language === 'en' ? 'Have a fire extinguisher and know how to use it' : 'မီးသတ်ဘူးထားရှိပြီး အသုံးပြုနည်းကို သိရှိပါ',
        language === 'en' ? 'Create a home evacuation plan' : 'အိမ်ဘေးရှောင်ရန် အစီအစဉ်တစ်ခု ဖန်တီးပါ'
      ]
    },
    {
      id: 'personal',
      title: language === 'en' ? 'Personal Safety' : 'ကိုယ်ရေးကိုယ်တာ လုံခြုံရေး',
      items: [
        language === 'en' ? 'Be aware of your surroundings' : 'သင့်ပတ်ဝန်းကျင်ကို သတိထားပါ',
        language === 'en' ? 'Keep valuables secure and out of sight' : 'တန်ဖိုးရှိပစ္စည်းများကို လုံခြုံစွာနှင့် မမြင်နိုင်သောနေရာတွင် ထားပါ',
        language === 'en' ? 'Use well-lit and populated areas at night' : 'ညအချိန်တွင် အလင်းရောင်ကောင်းပြီး လူစည်ကားသော နေရာများကို အသုံးပြုပါ',
        language === 'en' ? 'Share your location with trusted contacts when traveling alone' : 'တစ်ဦးတည်းခရီးသွားသည့်အခါ သင့်တည်နေရာကို ယုံကြည်ရသော အဆက်အသွယ်များနှင့် မျှဝေပါ'
      ]
    },
    {
      id: 'medical',
      title: language === 'en' ? 'Medical Emergencies' : 'ဆေးဘက်ဆိုင်ရာ အရေးပေါ်အခြေအနေများ',
      items: [
        language === 'en' ? 'Know the location of the nearest hospital' : 'အနီးဆုံးဆေးရုံ၏ တည်နေရာကို သိရှိပါ',
        language === 'en' ? 'Keep a list of medications and allergies' : 'ဆေးဝါးများနှင့် ဓာတ်မတည့်မှုများ စာရင်းကို ထိန်းသိမ်းထားပါ',
        language === 'en' ? 'Learn basic first aid' : 'အခြေခံရှေးဦးသူနာပြုစုခြင်းကို လေ့လာပါ',
        language === 'en' ? 'Have health insurance information accessible' : 'ကျန်းမာရေးအာမခံ အချက်အလက်ကို လွယ်ကူစွာ ရယူနိုင်အောင် ထားပါ'
      ]
    }
  ];

  const renderEmergencyCard = () => (
    <div className="p-4 bg-white rounded-lg border border-gray-200 space-y-4">
      <button
        onClick={() => setExpandedCard(expandedCard === 'emergency' ? null : 'emergency')}
        className="w-full flex items-center justify-between"
      >
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <input
              type="checkbox"
              checked={checklist.emergency_contacts}
              onChange={(e) => updateChecklist('emergency_contacts', e.target.checked)}
              className="h-5 w-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
            />
          </div>
          <div className="ml-3">
            <p className="font-medium text-gray-800">
              {language === 'en' ? '🚨 Know Emergency Services (911)' : '🚨 အရေးပေါ်ဝန်ဆောင်မှုများကို သိရှိပါ (911)'}
            </p>
          </div>
        </div>
        {expandedCard === 'emergency' ? (
          <ChevronUp className="h-5 w-5 text-gray-400" />
        ) : (
          <ChevronDown className="h-5 w-5 text-gray-400" />
        )}
      </button>

      {expandedCard === 'emergency' && (
        <div className="mt-4 space-y-6">
          {emergencySteps.map((step) => (
            <div key={step.id} className="space-y-2">
              <h4 className="font-medium text-gray-800 flex items-center">
                {step.id === 'when' && <Siren className="h-4 w-4 text-red-600 mr-2" />}
                {step.id === 'how' && <Phone className="h-4 w-4 text-blue-600 mr-2" />}
                {step.id === 'non-emergency' && <FileText className="h-4 w-4 text-green-600 mr-2" />}
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
                href="https://www.ready.gov/plan"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center text-blue-600 hover:text-blue-700"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                {language === 'en' ? 'Ready.gov Emergency Planning' : 'Ready.gov အရေးပေါ်အစီအစဉ်'}
              </a>
              <a
                href="https://www.redcross.org/get-help/how-to-prepare-for-emergencies.html"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center text-blue-600 hover:text-blue-700"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                {language === 'en' ? 'Red Cross Emergency Preparedness' : 'ကြက်ခြေနီ အရေးပေါ်ကြိုတင်ပြင်ဆင်မှု'}
              </a>
            </div>
          </div>

          <div className="p-3 bg-red-50 rounded-lg border border-red-100">
            <div className="flex items-start">
              <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 mr-2" />
              <p className="text-sm text-red-700">
                {language === 'en'
                  ? 'In the U.S., 911 is the universal emergency number for police, fire, and medical emergencies. It\'s free to call from any phone, even without a service plan or if your phone is locked.'
                  : 'အမေရိကန်တွင် 911 သည် ရဲ၊ မီးသတ်နှင့် ဆေးဘက်ဆိုင်ရာ အရေးပေါ်အခြေအနေများအတွက် အပြည်ပြည်ဆိုင်ရာ အရေးပေါ်နံပါတ်ဖြစ်သည်။ ဝန်ဆောင်မှုအစီအစဉ်မရှိသော်လည်း သို့မဟုတ် သင့်ဖုန်းကို သော့ခတ်ထားသော်လည်း မည်သည့်ဖုန်းမှမဆို အခမဲ့ခေါ်ဆိုနိုင်သည်။'}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderEmergencyKitCard = () => (
    <div className="p-4 bg-white rounded-lg border border-gray-200 space-y-4">
      <button
        onClick={() => setExpandedCard(expandedCard === 'emergency_kit' ? null : 'emergency_kit')}
        className="w-full flex items-center justify-between"
      >
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <input
              type="checkbox"
              checked={checklist.emergency_kit}
              onChange={(e) => updateChecklist('emergency_kit', e.target.checked)}
              className="h-5 w-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
            />
          </div>
          <div className="ml-3">
            <p className="font-medium text-gray-800">
              {language === 'en' ? '🎒 Prepare Emergency Kit' : '🎒 အရေးပေါ်အိတ် ပြင်ဆင်ပါ'}
            </p>
          </div>
        </div>
        {expandedCard === 'emergency_kit' ? (
          <ChevronUp className="h-5 w-5 text-gray-400" />
        ) : (
          <ChevronDown className="h-5 w-5 text-gray-400" />
        )}
      </button>

      {expandedCard === 'emergency_kit' && (
        <div className="mt-4 space-y-6">
          {emergencyKitSteps.map((step) => (
            <div key={step.id} className="space-y-2">
              <h4 className="font-medium text-gray-800 flex items-center">
                {step.id === 'basics' && <Flame className="h-4 w-4 text-orange-600 mr-2" />}
                {step.id === 'documents' && <FileText className="h-4 w-4 text-blue-600 mr-2" />}
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
                href="https://www.ready.gov/kit"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center text-blue-600 hover:text-blue-700"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                {language === 'en' ? 'Ready.gov Emergency Kit Guide' : 'Ready.gov အရေးပေါ်အိတ် လမ်းညွှန်'}
              </a>
              <a
                href="https://www.redcross.org/get-help/how-to-prepare-for-emergencies/survival-kit-supplies.html"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center text-blue-600 hover:text-blue-700"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                {language === 'en' ? 'Red Cross Survival Kit Supplies' : 'ကြက်ခြေနီ အသက်ရှင်ရပ်တည်ရေးအိတ် ပစ္စည်းများ'}
              </a>
            </div>
          </div>

          <div className="p-3 bg-orange-50 rounded-lg border border-orange-100">
            <div className="flex items-start">
              <AlertCircle className="h-5 w-5 text-orange-500 mt-0.5 mr-2" />
              <p className="text-sm text-orange-700">
                {language === 'en'
                  ? 'Natural disasters can happen anywhere. Having an emergency kit ready can make a significant difference in your safety and comfort during an emergency situation.'
                  : 'သဘာဝဘေးအန္တရာယ်များသည် မည်သည့်နေရာတွင်မဆို ဖြစ်ပွားနိုင်သည်။ အရေးပေါ်အိတ်တစ်လုံး အသင့်ရှိခြင်းသည် အရေးပေါ်အခြေအနေတစ်ခုအတွင်း သင့်လုံခြုံရေးနှင့် သက်တောင့်သက်တာရှိမှုတွင် သိသာထင်ရှားသော ကွာခြားချက်တစ်ခု ဖြစ်စေနိုင်သည်။'}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderSafetyTipsCard = () => (
    <div className="p-4 bg-white rounded-lg border border-gray-200 space-y-4">
      <button
        onClick={() => setExpandedCard(expandedCard === 'safety_tips' ? null : 'safety_tips')}
        className="w-full flex items-center justify-between"
      >
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <input
              type="checkbox"
              checked={checklist.safety_plan}
              onChange={(e) => updateChecklist('safety_plan', e.target.checked)}
              className="h-5 w-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
            />
          </div>
          <div className="ml-3">
            <p className="font-medium text-gray-800">
              {language === 'en' ? '🔒 Know Basic Safety Tips' : '🔒 အခြေခံလုံခြုံရေး အကြံပြုချက်များကို သိရှိပါ'}
            </p>
          </div>
        </div>
        {expandedCard === 'safety_tips' ? (
          <ChevronUp className="h-5 w-5 text-gray-400" />
        ) : (
          <ChevronDown className="h-5 w-5 text-gray-400" />
        )}
      </button>

      {expandedCard === 'safety_tips' && (
        <div className="mt-4 space-y-6">
          {safetyTipsSteps.map((step) => (
            <div key={step.id} className="space-y-2">
              <h4 className="font-medium text-gray-800 flex items-center">
                {step.id === 'home' && <Home className="h-4 w-4 text-blue-600 mr-2" />}
                {step.id === 'personal' && <Shield className="h-4 w-4 text-purple-600 mr-2" />}
                {step.id === 'medical' && <Heart className="h-4 w-4 text-red-600 mr-2" />}
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
                href="https://www.ready.gov/safety-skills"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center text-blue-600 hover:text-blue-700"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                {language === 'en' ? 'Ready.gov Safety Skills' : 'Ready.gov လုံခြုံရေးကျွမ်းကျင်မှုများ'}
              </a>
              <a
                href="https://www.redcross.org/get-help/how-to-prepare-for-emergencies/types-of-emergencies.html"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center text-blue-600 hover:text-blue-700"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                {language === 'en' ? 'Red Cross Emergency Types' : 'ကြက်ခြေနီ အရေးပေါ်အမျိုးအစားများ'}
              </a>
            </div>
          </div>

          <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
            <div className="flex items-start">
              <Lightbulb className="h-5 w-5 text-blue-500 mt-0.5 mr-2" />
              <p className="text-sm text-blue-700">
                {language === 'en'
                  ? 'Being prepared and knowing what to do in emergency situations can save lives. Take time to familiarize yourself with these safety tips and share them with your family members.'
                  : 'အရေးပေါ်အခြေအနေများတွင် ဘာလုပ်ရမည်ကို ကြိုတင်ပြင်ဆင်ထားခြင်းနှင့် သိရှိထားခြင်းသည် အသက်များကို ကယ်တင်နိုင်သည်။ ဤလုံခြုံရေးအကြံပြုချက်များကို ရင်းနှီးကျွမ်းဝင်ရန် အချိန်ယူပြီး သင့်မိသားစုဝင်များနှင့် မျှဝေပါ။'}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderLocalResourcesCard = () => (
    <div className="p-4 bg-white rounded-lg border border-gray-200 space-y-4">
      <button
        onClick={() => setExpandedCard(expandedCard === 'local_resources' ? null : 'local_resources')}
        className="w-full flex items-center justify-between"
      >
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <input
              type="checkbox"
              checked={checklist.local_resources}
              onChange={(e) => updateChecklist('local_resources', e.target.checked)}
              className="h-5 w-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
            />
          </div>
          <div className="ml-3">
            <p className="font-medium text-gray-800">
              {language === 'en' ? '🏥 Locate Local Resources' : '🏥 ဒေသတွင်း အရင်းအမြစ်များကို ရှာဖွေပါ'}
            </p>
          </div>
        </div>
        {expandedCard === 'local_resources' ? (
          <ChevronUp className="h-5 w-5 text-gray-400" />
        ) : (
          <ChevronDown className="h-5 w-5 text-gray-400" />
        )}
      </button>

      {expandedCard === 'local_resources' && (
        <div className="mt-4 space-y-6">
          <div className="space-y-2">
            <h4 className="font-medium text-gray-800 flex items-center">
              <MapPin className="h-4 w-4 text-red-600 mr-2" />
              {language === 'en' ? 'Essential Locations to Know' : 'သိရှိရန် မရှိမဖြစ်နေရာများ'}
            </h4>
            <ul className="space-y-2 ml-6">
              <li className="flex items-center text-gray-600 text-sm">
                <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mr-2"></div>
                {language === 'en' ? 'Nearest hospital emergency room' : 'အနီးဆုံးဆေးရုံ အရေးပေါ်အခန်း'}
              </li>
              <li className="flex items-center text-gray-600 text-sm">
                <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mr-2"></div>
                {language === 'en' ? 'Urgent care centers' : 'အရေးပေါ်စောင့်ရှောက်မှုစင်တာများ'}
              </li>
              <li className="flex items-center text-gray-600 text-sm">
                <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mr-2"></div>
                {language === 'en' ? 'Local police station' : 'ဒေသခံရဲစခန်း'}
              </li>
              <li className="flex items-center text-gray-600 text-sm">
                <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mr-2"></div>
                {language === 'en' ? 'Fire station' : 'မီးသတ်စခန်း'}
              </li>
              <li className="flex items-center text-gray-600 text-sm">
                <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mr-2"></div>
                {language === 'en' ? 'Pharmacy' : 'ဆေးဆိုင်'}
              </li>
            </ul>
          </div>

          <div className="space-y-2">
            <h4 className="font-medium text-gray-800 flex items-center">
              <Heart className="h-4 w-4 text-red-600 mr-2" />
              {language === 'en' ? 'Community Resources' : 'အသိုင်းအဝိုင်း အရင်းအမြစ်များ'}
            </h4>
            <ul className="space-y-2 ml-6">
              <li className="flex items-center text-gray-600 text-sm">
                <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mr-2"></div>
                {language === 'en' ? 'Food banks' : 'အစားအစာဘဏ်များ'}
              </li>
              <li className="flex items-center text-gray-600 text-sm">
                <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mr-2"></div>
                {language === 'en' ? 'Community health centers' : 'အသိုင်းအဝိုင်းကျန်းမာရေးစင်တာများ'}
              </li>
              <li className="flex items-center text-gray-600 text-sm">
                <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mr-2"></div>
                {language === 'en' ? 'Immigrant resource centers' : 'ရွှေ့ပြောင်းအခြေချသူ အရင်းအမြစ်စင်တာများ'}
              </li>
              <li className="flex items-center text-gray-600 text-sm">
                <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mr-2"></div>
                {language === 'en' ? 'Public libraries' : 'အများပြည်သူစာကြည့်တိုက်များ'}
              </li>
            </ul>
          </div>

          <div className="pt-4 border-t border-gray-200">
            <h4 className="font-medium text-gray-800 mb-2">
              {language === 'en' ? 'Helpful Resources' : 'အကူအညီဖြစ်စေမည့် အရင်းအမြစ်များ'}
            </h4>
            <div className="space-y-2">
              <a
                href="https://findahealthcenter.hrsa.gov/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center text-blue-600 hover:text-blue-700"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                {language === 'en' ? 'Find a Health Center' : 'ကျန်းမာရေးစင်တာတစ်ခု ရှာဖွေပါ'}
              </a>
              <a
                href="https://www.feedingamerica.org/find-your-local-foodbank"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center text-blue-600 hover:text-blue-700"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                {language === 'en' ? 'Find a Food Bank' : 'အစားအစာဘဏ်တစ်ခု ရှာဖွေပါ'}
              </a>
              <a
                href="https://www.immigrationadvocates.org/nonprofit/legaldirectory/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center text-blue-600 hover:text-blue-700"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                {language === 'en' ? 'Immigration Legal Resources' : 'လူဝင်မှုကြီးကြပ်ရေးဥပဒေဆိုင်ရာ အရင်းအမြစ်များ'}
              </a>
            </div>
          </div>

          <div className="p-3 bg-green-50 rounded-lg border border-green-100">
            <div className="flex items-start">
              <Lightbulb className="h-5 w-5 text-green-500 mt-0.5 mr-2" />
              <p className="text-sm text-green-700">
                {language === 'en'
                  ? 'Pro Tip: Save these important locations in your phone\'s map app for quick access in case of emergency. Consider taking a drive to locate them before you actually need them.'
                  : 'ကျွမ်းကျင်သူအကြံပြုချက်- အရေးပေါ်အခြေအနေတွင် လျင်မြန်စွာရယူနိုင်ရန် ဤအရေးကြီးသောနေရာများကို သင့်ဖုန်း၏မြေပုံအက်ပ်တွင် သိမ်းဆည်းပါ။ အမှန်တကယ်မလိုအပ်မီ ၎င်းတို့ကို ရှာဖွေရန် ကားမောင်းသွားရန် စဉ်းစားပါ။'}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderMedicalInfoCard = () => (
    <div className="p-4 bg-white rounded-lg border border-gray-200 space-y-4">
      <button
        onClick={() => setExpandedCard(expandedCard === 'medical_info' ? null : 'medical_info')}
        className="w-full flex items-center justify-between"
      >
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <input
              type="checkbox"
              checked={checklist.medical_info}
              onChange={(e) => updateChecklist('medical_info', e.target.checked)}
              className="h-5 w-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
            />
          </div>
          <div className="ml-3">
            <p className="font-medium text-gray-800">
              {language === 'en' ? '❤️ Organize Medical Information' : '❤️ ဆေးဘက်ဆိုင်ရာ အချက်အလက်များကို စီစဉ်ပါ'}
            </p>
          </div>
        </div>
        {expandedCard === 'medical_info' ? (
          <ChevronUp className="h-5 w-5 text-gray-400" />
        ) : (
          <ChevronDown className="h-5 w-5 text-gray-400" />
        )}
      </button>

      {expandedCard === 'medical_info' && (
        <div className="mt-4 space-y-6">
          <div className="space-y-2">
            <h4 className="font-medium text-gray-800 flex items-center">
              <Heart className="h-4 w-4 text-red-600 mr-2" />
              {language === 'en' ? 'Essential Medical Information to Compile' : 'စုစည်းရန် မရှိမဖြစ် ဆေးဘက်ဆိုင်ရာ အချက်အလက်များ'}
            </h4>
            <ul className="space-y-2 ml-6">
              <li className="flex items-center text-gray-600 text-sm">
                <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mr-2"></div>
                {language === 'en' ? 'List of current medications and dosages' : 'လက်ရှိဆေးဝါးများနှင့် ဆေးပမာဏစာရင်း'}
              </li>
              <li className="flex items-center text-gray-600 text-sm">
                <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mr-2"></div>
                {language === 'en' ? 'Allergies and reactions' : 'ဓာတ်မတည့်မှုများနှင့် တုံ့ပြန်မှုများ'}
              </li>
              <li className="flex items-center text-gray-600 text-sm">
                <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mr-2"></div>
                {language === 'en' ? 'Chronic conditions' : 'နာတာရှည်ရောဂါများ'}
              </li>
              <li className="flex items-center text-gray-600 text-sm">
                <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mr-2"></div>
                {language === 'en' ? 'Blood type' : 'သွေးအမျိုးအစား'}
              </li>
              <li className="flex items-center text-gray-600 text-sm">
                <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mr-2"></div>
                {language === 'en' ? 'Immunization records' : 'ကာကွယ်ဆေးထိုးမှတ်တမ်းများ'}
              </li>
              <li className="flex items-center text-gray-600 text-sm">
                <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mr-2"></div>
                {language === 'en' ? 'Emergency contacts' : 'အရေးပေါ်ဆက်သွယ်ရန်များ'}
              </li>
              <li className="flex items-center text-gray-600 text-sm">
                <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mr-2"></div>
                {language === 'en' ? 'Health insurance information' : 'ကျန်းမာရေးအာမခံ အချက်အလက်'}
              </li>
              <li className="flex items-center text-gray-600 text-sm">
                <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mr-2"></div>
                {language === 'en' ? 'Primary care doctor\'s contact information' : 'ပင်မစောင့်ရှောက်မှုဆရာဝန်၏ ဆက်သွယ်ရန်အချက်အလက်'}
              </li>
            </ul>
          </div>

          <div className="space-y-2">
            <h4 className="font-medium text-gray-800 flex items-center">
              <Lightbulb className="h-4 w-4 text-amber-600 mr-2" />
              {language === 'en' ? 'Tips for Medical Emergencies' : 'ဆေးဘက်ဆိုင်ရာ အရေးပေါ်အခြေအနေများအတွက် အကြံပြုချက်များ'}
            </h4>
            <ul className="space-y-2 ml-6">
              <li className="flex items-center text-gray-600 text-sm">
                <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mr-2"></div>
                {language === 'en' ? 'Keep a digital and physical copy of your medical information' : 'သင့်ဆေးဘက်ဆိုင်ရာအချက်အလက်၏ ဒစ်ဂျစ်တယ်နှင့် ရုပ်ပိုင်းဆိုင်ရာမိတ္တူကို ထိန်းသိမ်းပါ'}
              </li>
              <li className="flex items-center text-gray-600 text-sm">
                <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mr-2"></div>
                {language === 'en' ? 'Wear a medical alert bracelet if you have serious conditions' : 'ပြင်းထန်သောအခြေအနေများရှိပါက ဆေးဘက်ဆိုင်ရာသတိပေးလက်ကောက်ကို ဝတ်ဆင်ပါ'}
              </li>
              <li className="flex items-center text-gray-600 text-sm">
                <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mr-2"></div>
                {language === 'en' ? 'Set up emergency contact in your phone' : 'သင့်ဖုန်းတွင် အရေးပေါ်ဆက်သွယ်ရန် သတ်မှတ်ပါ'}
              </li>
              <li className="flex items-center text-gray-600 text-sm">
                <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mr-2"></div>
                {language === 'en' ? 'Learn basic first aid skills' : 'အခြေခံရှေးဦးသူနာပြုစုခြင်း ကျွမ်းကျင်မှုများကို လေ့လာပါ'}
              </li>
            </ul>
          </div>

          <div className="pt-4 border-t border-gray-200">
            <h4 className="font-medium text-gray-800 mb-2">
              {language === 'en' ? 'Helpful Resources' : 'အကူအညီဖြစ်စေမည့် အရင်းအမြစ်များ'}
            </h4>
            <div className="space-y-2">
              <a
                href="https://medlineplus.gov/emergencymedicalservices.html"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center text-blue-600 hover:text-blue-700"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                {language === 'en' ? 'MedlinePlus Emergency Services' : 'MedlinePlus အရေးပေါ်ဝန်ဆောင်မှုများ'}
              </a>
              <a
                href="https://www.redcross.org/take-a-class/first-aid"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center text-blue-600 hover:text-blue-700"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                {language === 'en' ? 'Red Cross First Aid Classes' : 'ကြက်ခြေနီ ရှေးဦးသူနာပြုအတန်းများ'}
              </a>
            </div>
          </div>

          <div className="p-3 bg-red-50 rounded-lg border border-red-100">
            <div className="flex items-start">
              <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 mr-2" />
              <p className="text-sm text-red-700">
                {language === 'en'
                  ? 'Medical emergencies can happen unexpectedly. Having your medical information organized and accessible can help healthcare providers give you the best care quickly.'
                  : 'ဆေးဘက်ဆိုင်ရာ အရေးပေါ်အခြေအနေများသည် မမျှော်လင့်ဘဲ ဖြစ်ပွားနိုင်သည်။ သင့်ဆေးဘက်ဆိုင်ရာအချက်အလက်များကို စနစ်တကျစီစဉ်ထားပြီး လွယ်ကူစွာရယူနိုင်ခြင်းသည် ကျန်းမာရေးစောင့်ရှောက်မှုပေးသူများအား သင့်ကို အကောင်းဆုံးစောင့်ရှောက်မှုကို လျင်မြန်စွာပေးနိုင်ရန် ကူညီနိုင်သည်။'}
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
          <Shield className="h-8 w-8 text-red-600 mr-3" />
          <h1 className="text-2xl font-bold text-gray-800">
            {language === 'en' ? 'Safety & Emergency Preparedness' : 'လုံခြုံရေးနှင့် အရေးပေါ်ကြိုတင်ပြင်ဆင်မှု'}
          </h1>
        </div>

        <div className="prose max-w-none mb-8">
          <p className="text-gray-600">
            {language === 'en'
              ? 'Knowing what to do in emergency situations is crucial for your safety in the U.S. This guide will help you prepare for and respond to various emergencies.'
              : 'အရေးပေါ်အခြေအနေများတွင် ဘာလုပ်ရမည်ကို သိရှိထားခြင်းသည် အမေရိကန်တွင် သင့်လုံခြုံရေးအတွက် အရေးကြီးသည်။ ဤလမ်းညွှန်သည် အမျိုးမျိုးသော အရေးပေါ်အခြေအနေများအတွက် သင့်အား ကြိုတင်ပြင်ဆင်ရန်နှင့် တုံ့ပြန်ရန် ကူညီပေးမည်။'}
          </p>
        </div>

        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-gray-800 flex items-center">
            <Siren className="h-6 w-6 text-red-600 mr-2" />
            {language === 'en' ? 'Emergency Services & Preparedness' : 'အရေးပေါ်ဝန်ဆောင်မှုများနှင့် ကြိုတင်ပြင်ဆင်မှု'}
          </h2>
          <p className="text-gray-600">
            {language === 'en'
              ? 'Learn how to access emergency services and prepare for unexpected situations'
              : 'အရေးပေါ်ဝန်ဆောင်မှုများကို ဘယ်လိုရယူရမလဲနှင့် မမျှော်လင့်ထားသော အခြေအနေများအတွက် ဘယ်လိုပြင်ဆင်ရမလဲကို လေ့လာပါ'}
          </p>

          <div className="space-y-6">
            {/* Emergency Services Card */}
            {renderEmergencyCard()}

            {/* Emergency Kit Card */}
            {renderEmergencyKitCard()}

            {/* Medical Information Card */}
            {renderMedicalInfoCard()}

            {/* Local Resources Card */}
            {renderLocalResourcesCard()}

            {/* Safety Tips Card */}
            {renderSafetyTipsCard()}
          </div>
        </div>

        <div className="p-4 bg-red-50 border border-red-200 rounded-lg mt-8">
          <div className="flex items-start">
            <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 mr-3" />
            <div>
              <h3 className="font-semibold text-red-800 mb-1">
                {language === 'en' ? 'Remember in an Emergency' : 'အရေးပေါ်အခြေအနေတွင် သတိရပါ'}
              </h3>
              <ul className="text-red-700 text-sm space-y-1">
                <li>• {language === 'en' ? 'Call 911 for immediate life-threatening emergencies' : 'ချက်ချင်းအသက်အန္တရာယ်ရှိသော အရေးပေါ်အခြေအနေများအတွက် 911 ကို ခေါ်ပါ'}</li>
                <li>• {language === 'en' ? 'Stay calm and speak clearly' : 'တည်ငြိမ်စွာနေပြီး ရှင်းလင်းစွာ ပြောဆိုပါ'}</li>
                <li>• {language === 'en' ? 'Know your location' : 'သင့်တည်နေရာကို သိရှိပါ'}</li>
                <li>• {language === 'en' ? 'Follow instructions from emergency personnel' : 'အရေးပေါ်ဝန်ထမ်းများ၏ ညွှန်ကြားချက်များကို လိုက်နာပါ'}</li>
                <li>• {language === 'en' ? 'Have a family emergency plan' : 'မိသားစုအရေးပေါ်အစီအစဉ်တစ်ခု ရှိပါစေ'}</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SafetyEmergency;