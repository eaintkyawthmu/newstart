import React from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useNavigate } from 'react-router-dom';
import {
  Shield,
  ArrowLeft,
  AlertCircle,
  ExternalLink,
  Heart,
  Users,
  Umbrella
} from 'lucide-react';

const InsuranceProtection = () => {
  const { language } = useLanguage();
  const navigate = useNavigate();

  const insuranceSteps = [
    {
      id: 'health',
      title: language === 'en' ? 'Health Insurance' : 'ကျန်းမာရေးအာမခံ',
      description: language === 'en'
        ? 'Protect yourself with medical coverage'
        : 'ဆေးကုသမှုအကာအကွယ်ဖြင့် သင့်ကိုယ်သင် ကာကွယ်ပါ',
      tasks: [
        {
          text: language === 'en' ? 'Compare health plans' : 'ကျန်းမာရေးအစီအစဉ်များကို နှိုင်းယှဉ်ပါ',
          link: 'https://www.healthcare.gov/see-plans/'
        },
        {
          text: language === 'en' ? 'Understand deductibles and copays' : 'နုတ်ယူငွေနှင့် ပူးတွဲပေးချေငွေများကို နားလည်ပါ',
          link: null
        },
        {
          text: language === 'en' ? 'Find in-network providers' : 'ကွန်ရက်အတွင်း ဝန်ဆောင်မှုပေးသူများကို ရှာဖွေပါ',
          link: null
        }
      ]
    },
    {
      id: 'life',
      title: language === 'en' ? 'Life Insurance' : 'အသက်အာမခံ',
      description: language === 'en'
        ? 'Protect your family\'s financial future'
        : 'သင့်မိသားစု၏ ငွေကြေးအနာဂတ်ကို ကာကွယ်ပါ',
      tasks: [
        {
          text: language === 'en' ? 'Determine coverage needs' : 'အကာအကွယ်လိုအပ်ချက်များကို ဆုံးဖြတ်ပါ',
          link: null
        },
        {
          text: language === 'en' ? 'Compare term vs whole life' : 'သက်တမ်းနှင့် တစ်သက်တာအာမခံကို နှိုင်းယှဉ်ပါ',
          link: null
        },
        {
          text: language === 'en' ? 'Get multiple quotes' : 'စျေးနှုန်းများစွာ ရယူပါ',
          link: null
        }
      ]
    },
    {
      id: 'disability',
      title: language === 'en' ? 'Disability Coverage' : 'မသန်စွမ်းမှုအကာအကွယ်',
      description: language === 'en'
        ? 'Protect your income if you can\'t work'
        : 'အလုပ်မလုပ်နိုင်ပါက သင့်ဝင်ငွေကို ကာကွယ်ပါ',
      tasks: [
        {
          text: language === 'en' ? 'Understand short vs long-term' : 'ရေတိုနှင့် ရေရှည်ကို နားလည်ပါ',
          link: null
        },
        {
          text: language === 'en' ? 'Review workplace coverage' : 'လုပ်ငန်းခွင်အကာအကွယ်ကို ပြန်လည်သုံးသပ်ပါ',
          link: null
        },
        {
          text: language === 'en' ? 'Consider supplemental policy' : 'ဖြည့်စွက်မူဝါဒကို စဉ်းစားပါ',
          link: null
        }
      ]
    }
  ];

  const tips = [
    {
      icon: Heart,
      title: language === 'en' ? 'Preventive Care' : 'ကြိုတင်ကာကွယ်စောင့်ရှောက်မှု',
      content: language === 'en'
        ? 'Many preventive services are free with insurance'
        : 'ကြိုတင်ကာကွယ်ဝန်ဆောင်မှုများစွာသည် အာမခံဖြင့် အခမဲ့ဖြစ်သည်'
    },
    {
      icon: Users,
      title: language === 'en' ? 'Family Coverage' : 'မိသားစုအကာအကွယ်',
      content: language === 'en'
        ? 'Consider coverage for all family members'
        : 'မိသားစုဝင်အားလုံးအတွက် အကာအကွယ်ကို စဉ်းစားပါ'
    },
    {
      icon: Umbrella,
      title: language === 'en' ? 'Emergency Fund' : 'အရေးပေါ်ရန်ပုံငွေ',
      content: language === 'en'
        ? 'Keep savings for insurance deductibles'
        : 'အာမခံနုတ်ယူငွေများအတွက် စုဆောင်းငွေထားရှိပါ'
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
          <Shield className="h-8 w-8 text-teal-600 mr-3" />
          <h1 className="text-2xl font-bold text-gray-800">
            {language === 'en' ? 'Insurance & Protection' : 'အာမခံနှင့် ကာကွယ်မှု'}
          </h1>
        </div>

        <div className="prose max-w-none mb-8">
          <p className="text-gray-600">
            {language === 'en'
              ? 'Insurance is crucial for protecting yourself and your family. Learn about different types of coverage and how to choose the right plans.'
              : 'အာမခံသည် သင်နှင့် သင့်မိသားစုကို ကာကွယ်ရန် အရေးကြီးပါသည်။ အကာအကွယ်အမျိုးအစားအမျိုးမျိုးနှင့် မှန်ကန်သော အစီအစဉ်များ ရွေးချယ်နည်းကို လေ့လာပါ။'}
          </p>
        </div>

        <div className="space-y-8">
          {insuranceSteps.map((step) => (
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
                          {language === 'en' ? 'Compare Plans' : 'အစီအစဉ်များကို နှိုင်းယှဉ်ပါ'}
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
                  ? 'Insurance needs vary by individual and family situation. Consider consulting with a licensed insurance agent to determine the best coverage for your specific needs.'
                  : 'အာမခံလိုအပ်ချက်များသည် တစ်ဦးချင်းနှင့် မိသားစုအခြေအနေပေါ် မူတည်၍ ကွဲပြားပါသည်။ သင့်တိကျသော လိုအပ်ချက်များအတွက် အကောင်းဆုံးအကာအကွယ်ကို ဆုံးဖြတ်ရန် လိုင်စင်ရ အာမခံကိုယ်စားလှယ်တစ်ဦးနှင့် တိုင်ပင်ဆွေးနွေးရန် စဉ်းစားပါ။'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InsuranceProtection;