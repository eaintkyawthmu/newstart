import React from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useNavigate } from 'react-router-dom';
import {
  PiggyBank,
  ArrowLeft,
  DollarSign,
  AlertCircle,
  ExternalLink,
  TrendingUp,
  Wallet,
  Calculator
} from 'lucide-react';

const BudgetingSaving = () => {
  const { language } = useLanguage();
  const navigate = useNavigate();

  const budgetSteps = [
    {
      id: 'track',
      title: language === 'en' ? 'Track Your Expenses' : 'သင့်အသုံးစရိတ်များကို ခြေရာခံပါ',
      description: language === 'en'
        ? 'Start monitoring where your money goes'
        : 'သင့်ငွေများ မည်သည့်နေရာသို့ ရောက်ရှိသွားသည်ကို စောင့်ကြည့်စတင်ပါ',
      tasks: [
        {
          text: language === 'en' ? 'Record daily expenses' : 'နေ့စဉ်အသုံးစရိတ်များကို မှတ်တမ်းတင်ပါ',
          link: null
        },
        {
          text: language === 'en' ? 'Categorize spending' : 'အသုံးစရိတ်များကို အမျိုးအစားခွဲပါ',
          link: null
        },
        {
          text: language === 'en' ? 'Identify areas to cut back' : 'လျှော့ချနိုင်သည့် နယ်ပယ်များကို ဖော်ထုတ်ပါ',
          link: null
        }
      ]
    },
    {
      id: 'goals',
      title: language === 'en' ? 'Set Savings Goals' : 'စုဆောင်းငွေပန်းတိုင်များ သတ်မှတ်ပါ',
      description: language === 'en'
        ? 'Define clear financial targets'
        : 'ရှင်းလင်းသော ငွေကြေးပန်းတိုင်များ သတ်မှတ်ပါ',
      tasks: [
        {
          text: language === 'en' ? 'Create short-term goals (3-6 months)' : 'ရေတိုပန်းတိုင်များ (၃-၆ လ)',
          link: null
        },
        {
          text: language === 'en' ? 'Set long-term objectives' : 'ရေရှည်ရည်မှန်းချက်များ သတ်မှတ်ပါ',
          link: null
        },
        {
          text: language === 'en' ? 'Use automatic savings' : 'အလိုအလျောက်စုဆောင်းခြင်းကို အသုံးပြုပါ',
          link: null
        }
      ]
    },
    {
      id: 'emergency',
      title: language === 'en' ? 'Build Emergency Fund' : 'အရေးပေါ်ရန်ပုံငွေ တည်ဆောက်ပါ',
      description: language === 'en'
        ? 'Create a financial safety net'
        : 'ငွေကြေးလုံခြုံရေးကွန်ရက် ဖန်တီးပါ',
      tasks: [
        {
          text: language === 'en' ? 'Save 3-6 months of expenses' : '၃-၆ လစာ အသုံးစရိတ်များကို စုဆောင်းပါ',
          link: null
        },
        {
          text: language === 'en' ? 'Keep in easily accessible account' : 'လွယ်ကူစွာထုတ်ယူနိုင်သော အကောင့်တွင် ထားရှိပါ',
          link: null
        },
        {
          text: language === 'en' ? 'Only use for true emergencies' : 'စစ်မှန်သော အရေးပေါ်အခြေအနေများအတွက်သာ အသုံးပြုပါ',
          link: null
        }
      ]
    }
  ];

  const tips = [
    {
      icon: Calculator,
      title: language === 'en' ? 'Simple Budgeting' : 'ရိုးရှင်းသော ဘတ်ဂျက်ရေးဆွဲခြင်း',
      content: language === 'en'
        ? 'Income - Savings - Expenses = 0'
        : 'ဝင်ငွေ - စုဆောင်းငွေ - အသုံးစရိတ်များ = 0'
    },
    {
      icon: Wallet,
      title: language === 'en' ? 'Track Every Dollar' : 'ဒေါ်လာတိုင်းကို ခြေရာခံပါ',
      content: language === 'en'
        ? 'Use apps or spreadsheets to monitor spending'
        : 'အသုံးစရိတ်များကို စောင့်ကြည့်ရန် အက်ပ်များ သို့မဟုတ် spreadsheet များကို အသုံးပြုပါ'
    },
    {
      icon: TrendingUp,
      title: language === 'en' ? 'Start Small' : 'သေးငယ်စွာ စတင်ပါ',
      content: language === 'en'
        ? 'Even small amounts add up over time'
        : 'ပမာဏနည်းသော်လည်း အချိန်ကြာလာသည်နှင့်အမျှ တိုးပွားလာပါသည်'
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
          <PiggyBank className="h-8 w-8 text-teal-600 mr-3" />
          <h1 className="text-2xl font-bold text-gray-800">
            {language === 'en' ? 'Basic Money Management' : 'အခြေခံငွေကြေးစီမံခန့်ခွဲမှု'}
          </h1>
        </div>

        <div className="prose max-w-none mb-8">
          <p className="text-gray-600">
            {language === 'en'
              ? 'Managing your money effectively is essential for your financial success. Here are some simple steps to help you track your spending and start saving.'
              : 'သင့်ငွေကြေးကို ထိရောက်စွာစီမံခန့်ခွဲခြင်းသည် သင့်ငွေကြေးအောင်မြင်မှုအတွက် မရှိမဖြစ်လိုအပ်ပါသည်။ သင့်အသုံးစရိတ်များကို ခြေရာခံရန်နှင့် စုဆောင်းခြင်းစတင်ရန် ကူညီပေးမည့် ရိုးရှင်းသော အဆင့်များကို ဖော်ပြထားပါသည်။'}
          </p>
        </div>

        <div className="space-y-8">
          {budgetSteps.map((step) => (
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
                {language === 'en' ? 'Pro Tip' : 'ကျွမ်းကျင်သူအကြံပြုချက်'}
              </h3>
              <p className="text-blue-700 text-sm">
                {language === 'en'
                  ? 'Start with a simple system that works for you. Even tracking expenses with pen and paper is better than not tracking at all. As you get comfortable, you can try more sophisticated budgeting apps.'
                  : 'သင့်အတွက် အလုပ်ဖြစ်သော ရိုးရှင်းသည့်စနစ်ဖြင့် စတင်ပါ။ ဘာမှမလုပ်ဘဲနေသည်ထက် ခဲတံနှင့် စာရွက်ဖြင့် အသုံးစရိတ်များကို ခြေရာခံခြင်းသည်ပင် ပိုကောင်းပါသည်။ သင်အဆင်ပြေလာသည်နှင့်အမျှ ပိုမိုရှုပ်ထွေးသော ဘတ်ဂျက်ရေးဆွဲခြင်းအက်ပ်များကို စမ်းသပ်နိုင်ပါသည်။'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BudgetingSaving;