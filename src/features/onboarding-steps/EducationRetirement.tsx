import React from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useNavigate } from 'react-router-dom';
import {
  GraduationCap,
  ArrowLeft,
  AlertCircle,
  ExternalLink,
  BookOpen,
  PiggyBank,
  TrendingUp
} from 'lucide-react';

const EducationRetirement = () => {
  const { language } = useLanguage();
  const navigate = useNavigate();

  const planningSteps = [
    {
      id: '529',
      title: language === 'en' ? 'Explore 529 Plans' : '529 အစီအစဉ်များကို လေ့လာပါ',
      description: language === 'en'
        ? 'Tax-advantaged education savings'
        : 'အခွန်သက်သာခွင့်ရှိသော ပညာရေးစုဆောင်းငွေ',
      tasks: [
        {
          text: language === 'en' ? 'Compare state plans' : 'ပြည်နယ်အစီအစဉ်များကို နှိုင်းယှဉ်ပါ',
          link: 'https://www.savingforcollege.com/529-plans/'
        },
        {
          text: language === 'en' ? 'Understand tax benefits' : 'အခွန်အကျိုးကျေးဇူးများကို နားလည်ပါ',
          link: null
        },
        {
          text: language === 'en' ? 'Set up automatic contributions' : 'အလိုအလျောက်ထည့်ဝင်ငွေများ စီစဉ်ပါ',
          link: null
        }
      ]
    },
    {
      id: 'retirement',
      title: language === 'en' ? 'Start Retirement Savings' : 'ပင်စင်စုဆောင်းခြင်း စတင်ပါ',
      description: language === 'en'
        ? 'Plan for your future financial security'
        : 'သင့်အနာဂတ်ငွေကြေးလုံခြုံရေးအတွက် စီစဉ်ပါ',
      tasks: [
        {
          text: language === 'en' ? 'Open a retirement account' : 'ပင်စင်အကောင့် ဖွင့်ပါ',
          link: null
        },
        {
          text: language === 'en' ? 'Learn about employer matching' : 'အလုပ်ရှင်၏ ထည့်ဝင်ငွေညှိနှိုင်းမှုအကြောင်း လေ့လာပါ',
          link: null
        },
        {
          text: language === 'en' ? 'Diversify investments' : 'ရင်းနှီးမြှုပ်နှံမှုများ မျိုးစုံပြုလုပ်ပါ',
          link: null
        }
      ]
    },
    {
      id: 'education',
      title: language === 'en' ? 'Research Education Options' : 'ပညာရေးရွေးချယ်စရာများကို လေ့လာပါ',
      description: language === 'en'
        ? 'Explore educational opportunities'
        : 'ပညာရေးအခွင့်အလမ်းများကို ရှာဖွေပါ',
      tasks: [
        {
          text: language === 'en' ? 'Compare schools and programs' : 'ကျောင်းများနှင့် အစီအစဉ်များကို နှိုင်းယှဉ်ပါ',
          link: null
        },
        {
          text: language === 'en' ? 'Research financial aid' : 'ငွေကြေးအထောက်အပံ့ကို လေ့လာပါ',
          link: 'https://studentaid.gov/'
        },
        {
          text: language === 'en' ? 'Consider online learning' : 'အွန်လိုင်းသင်ယူခြင်းကို စဉ်းစားပါ',
          link: null
        }
      ]
    }
  ];

  const tips = [
    {
      icon: BookOpen,
      title: language === 'en' ? 'Financial Aid' : 'ငွေကြေးအထောက်အပံ့',
      content: language === 'en'
        ? 'Apply for scholarships and grants early'
        : 'ပညာသင်ဆုနှင့် ထောက်ပံ့ကြေးများကို စောစီးစွာ လျှောက်ထားပါ'
    },
    {
      icon: PiggyBank,
      title: language === 'en' ? 'Start Early' : 'စောစီးစွာ စတင်ပါ',
      content: language === 'en'
        ? 'Time is your biggest advantage in saving'
        : 'အချိန်သည် သင့်စုဆောင်းမှုတွင် အကြီးမားဆုံး အားသာချက်ဖြစ်သည်'
    },
    {
      icon: TrendingUp,
      title: language === 'en' ? 'Compound Growth' : 'ထပ်ဆင့်တိုးတက်မှု',
      content: language === 'en'
        ? 'Let your money work for you over time'
        : 'အချိန်ကြာလာသည်နှင့်အမျှ သင့်ငွေကို အလုပ်လုပ်စေပါ'
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
          <GraduationCap className="h-8 w-8 text-teal-600 mr-3" />
          <h1 className="text-2xl font-bold text-gray-800">
            {language === 'en' ? 'Education & Retirement' : 'ပညာရေးနှင့် ပင်စင်'}
          </h1>
        </div>

        <div className="prose max-w-none mb-8">
          <p className="text-gray-600">
            {language === 'en'
              ? 'Planning for education and retirement are key investments in your future. Learn how to make informed decisions for long-term success.'
              : 'ပညာရေးနှင့် ပင်စင်အတွက် စီစဉ်ခြင်းသည် သင့်အနာဂတ်အတွက် အဓိကရင်းနှီးမြှုပ်နှံမှုများ ဖြစ်သည်။ ရေရှည်အောင်မြင်မှုအတွက် သတင်းအချက်အလက်ပြည့်စုံသော ဆုံးဖြတ်ချက်များ ချမှတ်နည်းကို လေ့လာပါ။'}
          </p>
        </div>

        <div className="space-y-8">
          {planningSteps.map((step) => (
            <div 
              key={step.id}
              className="border border-gray-200 rounded-lg p-6 bg-gray-50"
            >
              <h2 className="text-xl font-semibold text-gray-800 mb-3">{step.title}</h2>
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
                          {language === 'en' ? 'Learn More' : 'ပိုမိုလေ့လာရန်'}
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
                {language === 'en' ? 'Important Note' : 'အရေးကြီး မှတ်ချက်'}
              </h3>
              <p className="text-blue-700 text-sm">
                {language === 'en'
                  ? 'Both education and retirement planning benefit from starting early. Even small, regular contributions can grow significantly over time through compound interest.'
                  : 'ပညာရေးနှင့် ပင်စင်စီမံကိန်းနှစ်ခုလုံးသည် စောစီးစွာ စတင်ခြင်းမှ အကျိုးကျေးဇူးရရှိသည်။ ပုံမှန်ထည့်ဝင်ငွေ အနည်းငယ်ပင်ဖြစ်စေ အချိန်ကြာလာသည်နှင့်အမျှ ထပ်ဆင့်အတိုးဖြင့် သိသိသာသာ တိုးပွားလာနိုင်ပါသည်။'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EducationRetirement;