import React from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useNavigate } from 'react-router-dom';
import {
  Home,
  ArrowLeft,
  AlertCircle,
  ExternalLink,
  Key,
  Lightbulb,
  Wifi,
  FileText,
  DollarSign,
  Droplet,
  Zap,
  Trash2
} from 'lucide-react';

const HousingUtilities = () => {
  const { language } = useLanguage();
  const navigate = useNavigate();

  const housingSteps = [
    {
      id: 'compare',
      title: language === 'en' ? 'Finding Housing Options' : 'အိမ်ရာရွေးချယ်စရာများကို ရှာဖွေခြင်း',
      description: language === 'en'
        ? 'Locate suitable rental options in your area'
        : 'သင့်ဒေသတွင် သင့်လျော်သော ငှားရမ်းရန် ရွေးချယ်စရာများကို ရှာဖွေပါ',
      tasks: [
        {
          text: language === 'en' ? 'Use apartment search websites (Zillow, Apartments.com)' : 'တိုက်ခန်းရှာဖွေရေး ဝက်ဘ်ဆိုက်များကို အသုံးပြုပါ (Zillow, Apartments.com)',
          link: 'https://www.apartments.com/'
        },
        {
          text: language === 'en' ? 'Consider location, safety, and commute time' : 'တည်နေရာ၊ လုံခြုံရေးနှင့် ခရီးသွားချိန်ကို ထည့်သွင်းစဉ်းစားပါ',
          link: null
        },
        {
          text: language === 'en' ? 'Check for proximity to public transportation' : 'အများသုံးသယ်ယူပို့ဆောင်ရေးနှင့် အနီးအနားရှိမရှိ စစ်ဆေးပါ',
          link: null
        },
        {
          text: language === 'en' ? 'Visit neighborhoods at different times of day' : 'ရပ်ကွက်များကို နေ့အချိန်အမျိုးမျိုးတွင် သွားရောက်လည်ပတ်ပါ',
          link: null
        }
      ]
    },
    {
      id: 'lease',
      title: language === 'en' ? 'Understanding Rental Agreements' : 'ငှားရမ်းမှုသဘောတူညီချက်များကို နားလည်ခြင်း',
      description: language === 'en'
        ? 'Know your rights and responsibilities as a tenant'
        : 'အိမ်ငှားတစ်ဦးအနေဖြင့် သင့်အခွင့်အရေးများနှင့် တာဝန်များကို သိရှိပါ',
      tasks: [
        {
          text: language === 'en' ? 'Lease duration (typically 12 months)' : 'ငှားရမ်းကာလ (ပုံမှန်အားဖြင့် ၁၂ လ)',
          link: null
        },
        {
          text: language === 'en' ? 'Security deposit (usually 1-2 months\' rent)' : 'အာမခံစပေါ်ငွေ (ပုံမှန်အားဖြင့် ၁-၂ လစာ ငှားရမ်းခ)',
          link: null
        },
        {
          text: language === 'en' ? 'Rent payment methods and due dates' : 'ငှားရမ်းခပေးချေရန် နည်းလမ်းများနှင့် နောက်ဆုံးရက်များ',
          link: null
        },
        {
          text: language === 'en' ? 'Maintenance policies and responsibilities' : 'ပြုပြင်ထိန်းသိမ်းရေးမူဝါဒများနှင့် တာဝန်များ',
          link: null
        },
        {
          text: language === 'en' ? 'Rules about guests, pets, and modifications' : 'ဧည့်သည်များ၊ အိမ်မွေးတိရစ္ဆာန်များနှင့် ပြင်ဆင်မွမ်းမံမှုများအကြောင်း စည်းမျဉ်းများ',
          link: null
        }
      ]
    },
    {
      id: 'utilities',
      title: language === 'en' ? 'Setting Up Utilities' : 'ဝန်ဆောင်မှုများ စီစဉ်ခြင်း',
      description: language === 'en'
        ? 'Essential services for your home'
        : 'သင့်အိမ်အတွက် မရှိမဖြစ် ဝန်ဆောင်မှုများ',
      tasks: [
        {
          text: language === 'en' ? 'Electricity and gas service' : 'လျှပ်စစ်နှင့် ဓာတ်ငွေ့ဝန်ဆောင်မှု',
          link: null
        },
        {
          text: language === 'en' ? 'Water and sewer service' : 'ရေနှင့် မိလ္လာဝန်ဆောင်မှု',
          link: null
        },
        {
          text: language === 'en' ? 'Internet and cable' : 'အင်တာနက်နှင့် ကေဘယ်',
          link: null
        },
        {
          text: language === 'en' ? 'Trash and recycling collection' : 'အမှိုက်နှင့် ပြန်လည်အသုံးပြုနိုင်သော ပစ္စည်းများ စုဆောင်းခြင်း',
          link: null
        }
      ]
    }
  ];

  const utilitySetupSteps = [
    {
      id: 'electricity',
      title: language === 'en' ? 'Electricity & Gas' : 'လျှပ်စစ်နှင့် ဓာတ်ငွေ့',
      icon: Zap,
      steps: [
        language === 'en' ? 'Find your local utility provider' : 'သင့်ဒေသခံ ဝန်ဆောင်မှုပေးသူကို ရှာဖွေပါ',
        language === 'en' ? 'Call or visit their website to start service' : 'ဝန်ဆောင်မှုစတင်ရန် ၎င်းတို့ကို ဖုန်းခေါ်ပါ သို့မဟုတ် ၎င်းတို့၏ ဝက်ဘ်ဆိုက်သို့ သွားပါ',
        language === 'en' ? 'Provide your address and move-in date' : 'သင့်လိပ်စာနှင့် ပြောင်းရွှေ့ဝင်ရောက်မည့်ရက်ကို ပေးပါ',
        language === 'en' ? 'Set up automatic payments if possible' : 'ဖြစ်နိုင်ပါက အလိုအလျောက်ငွေပေးချေမှုများ စီစဉ်ပါ'
      ]
    },
    {
      id: 'water',
      title: language === 'en' ? 'Water & Sewer' : 'ရေနှင့် မိလ္လာ',
      icon: Droplet,
      steps: [
        language === 'en' ? 'Contact your city or county water department' : 'သင့်မြို့ သို့မဟုတ် ကောင်တီရေဌာနကို ဆက်သွယ်ပါ',
        language === 'en' ? 'Complete application form' : 'လျှောက်လွှာပုံစံကို ဖြည့်စွက်ပါ',
        language === 'en' ? 'Pay any required deposit' : 'လိုအပ်သော စပေါ်ငွေကို ပေးဆောင်ပါ',
        language === 'en' ? 'Note: Sometimes included in rent' : 'မှတ်ချက်- တစ်ခါတစ်ရံ ငှားရမ်းခတွင် ပါဝင်သည်'
      ]
    },
    {
      id: 'internet',
      title: language === 'en' ? 'Internet & Cable' : 'အင်တာနက်နှင့် ကေဘယ်',
      icon: Wifi,
      steps: [
        language === 'en' ? 'Research providers in your area' : 'သင့်ဒေသရှိ ဝန်ဆောင်မှုပေးသူများကို လေ့လာပါ',
        language === 'en' ? 'Compare plans and prices' : 'အစီအစဉ်များနှင့် စျေးနှုန်းများကို နှိုင်းယှဉ်ပါ',
        language === 'en' ? 'Schedule installation appointment' : 'တပ်ဆင်ရန် ချိန်းဆိုမှု စီစဉ်ပါ',
        language === 'en' ? 'Set up WiFi network and password' : 'WiFi ကွန်ရက်နှင့် စကားဝှက်ကို စီစဉ်ပါ'
      ]
    },
    {
      id: 'trash',
      title: language === 'en' ? 'Trash & Recycling' : 'အမှိုက်နှင့် ပြန်လည်အသုံးပြုခြင်း',
      icon: Trash2,
      steps: [
        language === 'en' ? 'Check if service is through city or private company' : 'ဝန်ဆောင်မှုသည် မြို့တော်မှတဆင့် သို့မဟုတ် ပုဂ္ဂလိကကုမ္ပဏီမှတဆင့် ဖြစ်မဖြစ် စစ်ဆေးပါ',
        language === 'en' ? 'Learn collection schedule' : 'စုဆောင်းသည့်အချိန်ဇယားကို လေ့လာပါ',
        language === 'en' ? 'Understand recycling rules' : 'ပြန်လည်အသုံးပြုခြင်းဆိုင်ရာ စည်းမျဉ်းများကို နားလည်ပါ',
        language === 'en' ? 'Note: Often included in rent for apartments' : 'မှတ်ချက်- တိုက်ခန်းများအတွက် ငှားရမ်းခတွင် မကြာခဏ ပါဝင်သည်'
      ]
    }
  ];

  const tips = [
    {
      icon: Key,
      title: language === 'en' ? 'Documentation' : 'စာရွက်စာတမ်းများ',
      content: language === 'en'
        ? 'Keep copies of all housing-related documents'
        : 'အိမ်ရာဆိုင်ရာ စာရွက်စာတမ်းအားလုံး၏ မိတ္တူများကို သိမ်းဆည်းပါ'
    },
    {
      icon: DollarSign,
      title: language === 'en' ? 'Rental Applications' : 'ငှားရမ်းမှုလျှောက်လွှာများ',
      content: language === 'en'
        ? 'Be prepared with ID, proof of income, and references'
        : 'ID၊ ဝင်ငွေအထောက်အထားနှင့် ရည်ညွှန်းချက်များဖြင့် ပြင်ဆင်ထားပါ'
    },
    {
      icon: Lightbulb,
      title: language === 'en' ? 'Energy Savings' : 'စွမ်းအင်ချွေတာခြင်း',
      content: language === 'en'
        ? 'Use energy-efficient appliances to reduce bills'
        : 'ငွေတောင်းခံလွှာများ လျှော့ချရန် စွမ်းအင်သုံးစွဲမှုထိရောက်သော ကိရိယာများကို အသုံးပြုပါ'
    }
  ];

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
          <Home className="h-8 w-8 text-teal-600 mr-3" />
          <h1 className="text-2xl font-bold text-gray-800">
            {language === 'en' ? 'Housing & Utilities' : 'အိမ်ရာနှင့် ဝန်ဆောင်မှုများ'}
          </h1>
        </div>

        <div className="prose max-w-none mb-8">
          <p className="text-gray-600">
            {language === 'en'
              ? 'Finding and setting up your home is a crucial step. Learn how to make informed decisions about housing and essential utilities.'
              : 'သင့်အိမ်ကို ရှာဖွေပြီး စီစဉ်ခြင်းသည် အရေးကြီးသော အဆင့်တစ်ခုဖြစ်သည်။ အိမ်ရာနှင့် မရှိမဖြစ် ဝန်ဆောင်မှုများအကြောင်း သတင်းအချက်အလက်ပြည့်စုံသော ဆုံးဖြတ်ချက်များ ချမှတ်နည်းကို လေ့လာပါ။'}
          </p>
        </div>

        <div className="space-y-8">
          <h2 className="text-xl font-semibold text-gray-800 flex items-center">
            <Home className="h-6 w-6 text-blue-600 mr-2" />
            {language === 'en' ? 'Finding and Securing Housing' : 'အိမ်ရာရှာဖွေခြင်းနှင့် လုံခြုံစေခြင်း'}
          </h2>

          <div className="space-y-6">
            {housingSteps.map((step) => (
              <div 
                key={step.id}
                className="border border-gray-200 rounded-lg p-6 bg-gray-50"
              >
                <h3 className="text-lg font-semibold text-gray-800 mb-3">{step.title}</h3>
                <p className="text-gray-600 mb-4">{step.description}</p>
                
                <div className="space-y-3">
                  {step.tasks.map((task, index) => (
                    <div key={index} className="flex items-start">
                      <div className="flex-shrink-0 w-6 h-6 mt-1 mr-3 rounded-full border-2 border-gray-300" />
                      <div>
                        <p className="text-gray-700">{task.text}</p>
                        {task.link && (
                          <a
                            href={task.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center text-teal-600 hover:text-teal-700 mt-1"
                          >
                            {language === 'en' ? 'Search Apartments' : 'တိုက်ခန်းများ ရှာဖွေပါ'}
                            <ExternalLink className="h-4 w-4 ml-1" />
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <h2 className="text-xl font-semibold text-gray-800 flex items-center mt-10">
            <Zap className="h-6 w-6 text-blue-600 mr-2" />
            {language === 'en' ? 'Setting Up Essential Utilities' : 'မရှိမဖြစ် ဝန်ဆောင်မှုများ စီစဉ်ခြင်း'}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {utilitySetupSteps.map((utility) => (
              <div 
                key={utility.id}
                className="border border-gray-200 rounded-lg p-5 bg-gray-50"
              >
                <div className="flex items-center mb-4">
                  <utility.icon className="h-6 w-6 text-blue-600 mr-2" />
                  <h3 className="text-lg font-semibold text-gray-800">{utility.title}</h3>
                </div>
                
                <ul className="space-y-2">
                  {utility.steps.map((step, index) => (
                    <li key={index} className="flex items-start">
                      <div className="w-5 h-5 rounded-full border-2 border-gray-300 flex-shrink-0 mt-0.5 mr-2"></div>
                      <span className="text-gray-700 text-sm">{step}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            {tips.map((tip, index) => (
              <div 
                key={index}
                className="p-4 bg-teal-50 rounded-lg border border-teal-100"
              >
                <div className="flex items-center mb-3">
                  <tip.icon className="h-6 w-6 text-teal-600 mr-2" />
                  <h3 className="font-semibold text-teal-900">{tip.title}</h3>
                </div>
                <p className="text-teal-800 text-sm">{tip.content}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start">
              <AlertCircle className="h-5 w-5 text-blue-500 mt-0.5 mr-3" />
              <div>
                <h3 className="font-semibold text-blue-800 mb-1">
                  {language === 'en' ? 'Tenant Rights' : 'အိမ်ငှားအခွင့်အရေးများ'}
                </h3>
                <p className="text-blue-700 text-sm">
                  {language === 'en'
                    ? 'Know your rights as a tenant. Many cities have tenant protection laws and resources available to help you understand your rights and responsibilities.'
                    : 'အိမ်ငှားတစ်ဦးအနေဖြင့် သင့်အခွင့်အရေးများကို သိရှိပါ။ မြို့တော်များစွာတွင် အိမ်ငှားကာကွယ်ရေးဥပဒေများနှင့် သင့်အခွင့်အရေးများနှင့် တာဝန်များကို နားလည်စေရန် ကူညီပေးသော အရင်းအမြစ်များ ရှိပါသည်။'}
                </p>
                <div className="mt-2">
                  <a
                    href="https://www.hud.gov/topics/rental_assistance/tenantrights"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 text-sm flex items-center"
                  >
                    <ExternalLink className="h-4 w-4 mr-1" />
                    {language === 'en' ? 'Learn about tenant rights' : 'အိမ်ငှားအခွင့်အရေးများအကြောင်း လေ့လာပါ'}
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HousingUtilities;