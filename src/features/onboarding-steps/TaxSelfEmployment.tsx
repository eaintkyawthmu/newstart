import React from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  ArrowLeft,
  AlertCircle,
  ExternalLink,
  Calendar,
  Calculator,
  Receipt
} from 'lucide-react';

const TaxSelfEmployment = () => {
  const { language } = useLanguage();
  const navigate = useNavigate();

  const taxSteps = [
    {
      id: 'basics',
      title: language === 'en' ? 'Tax Basics' : 'အခွန်အခြေခံများ',
      description: language === 'en'
        ? 'Understanding fundamental tax concepts'
        : 'အခြေခံအခွန်သဘောတရားများကို နားလည်ခြင်း',
      tasks: [
        {
          text: language === 'en' ? 'Learn about tax brackets' : 'အခွန်အဆင့်များအကြောင်း လေ့လာပါ',
          link: 'https://www.irs.gov/newsroom/irs-provides-tax-inflation-adjustments'
        },
        {
          text: language === 'en' ? 'Understand deductions vs credits' : 'နုတ်ယူခွင့်နှင့် ခရက်ဒစ်များကို နားလည်ပါ',
          link: 'https://www.irs.gov/credits-deductions-for-individuals'
        },
        {
          text: language === 'en' ? 'Know filing deadlines' : 'တင်သွင်းရမည့် နောက်ဆုံးရက်များကို သိရှိပါ',
          link: 'https://www.irs.gov/filing'
        }
      ]
    },
    {
      id: 'forms',
      title: language === 'en' ? 'W-2 vs 1099' : 'W-2 နှင့် 1099',
      description: language === 'en'
        ? 'Different types of income forms'
        : 'ဝင်ငွေဖောင်ပုံစံ အမျိုးမျိုး',
      tasks: [
        {
          text: language === 'en' ? 'W-2 for employees' : 'ဝန်ထမ်းများအတွက် W-2',
          link: 'https://www.irs.gov/forms-pubs/about-form-w-2'
        },
        {
          text: language === 'en' ? '1099 for contractors' : 'ကန်ထရိုက်တာများအတွက် 1099',
          link: 'https://www.irs.gov/forms-pubs/about-form-1099-misc'
        },
        {
          text: language === 'en' ? 'Keep records of all income' : 'ဝင်ငွေအားလုံး၏ မှတ်တမ်းများကို ထိန်းသိမ်းပါ',
          link: null
        }
      ]
    },
    {
      id: 'expenses',
      title: language === 'en' ? 'Track Business Expenses' : 'စီးပွားရေးအသုံးစရိတ်များကို ခြေရာခံပါ',
      description: language === 'en'
        ? 'Managing deductible business costs'
        : 'နုတ်ယူနိုင်သော စီးပွားရေးကုန်ကျစရိတ်များကို စီမံခန့်ခွဲခြင်း',
      tasks: [
        {
          text: language === 'en' ? 'Keep all receipts' : 'ပြေစာအားလုံးကို သိမ်းဆည်းပါ',
          link: null
        },
        {
          text: language === 'en' ? 'Use expense tracking apps' : 'အသုံးစရိတ်ခြေရာခံ အက်ပ်များကို အသုံးပြုပါ',
          link: null
        },
        {
          text: language === 'en' ? 'Separate business/personal expenses' : 'စီးပွားရေး/ကိုယ်ရေးကိုယ်တာ အသုံးစရိတ်များကို ခွဲခြားပါ',
          link: null
        }
      ]
    }
  ];

  const tips = [
    {
      icon: Calendar,
      title: language === 'en' ? 'Quarterly Payments' : 'သုံးလတစ်ကြိမ် ပေးချေမှုများ',
      content: language === 'en'
        ? 'Self-employed individuals may need to pay quarterly estimated taxes'
        : 'ကိုယ်ပိုင်လုပ်ငန်းရှင်များသည် သုံးလတစ်ကြိမ် ခန့်မှန်းအခွန်များ ပေးဆောင်ရန် လိုအပ်နိုင်သည်'
    },
    {
      icon: Calculator,
      title: language === 'en' ? 'Save for Taxes' : 'အခွန်အတွက် စုဆောင်းပါ',
      content: language === 'en'
        ? 'Set aside 25-30% of income for taxes'
        : 'အခွန်အတွက် ဝင်ငွေ၏ ၂၅-၃၀% ကို သီးသန့်ထားရှိပါ'
    },
    {
      icon: Receipt,
      title: language === 'en' ? 'Document Everything' : 'အရာအားလုံးကို မှတ်တမ်းတင်ပါ',
      content: language === 'en'
        ? 'Keep detailed records of all income and expenses'
        : 'ဝင်ငွေနှင့် အသုံးစရိတ်အားလုံး၏ အသေးစိတ်မှတ်တမ်းများကို ထိန်းသိမ်းပါ'
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
          <FileText className="h-8 w-8 text-teal-600 mr-3" />
          <h1 className="text-2xl font-bold text-gray-800">
            {language === 'en' ? 'Taxes & Self-Employment' : 'အခွန်နှင့် ကိုယ်ပိုင်လုပ်ငန်း'}
          </h1>
        </div>

        <div className="prose max-w-none mb-8">
          <p className="text-gray-600">
            {language === 'en'
              ? 'Understanding taxes and self-employment requirements is essential for financial compliance and success. Learn the basics here.'
              : 'အခွန်နှင့် ကိုယ်ပိုင်လုပ်ငန်းဆိုင်ရာ လိုအပ်ချက်များကို နားလည်ခြင်းသည် ငွေကြေးဆိုင်ရာ လိုက်နာမှုနှင့် အောင်မြင်မှုအတွက် မရှိမဖြစ်လိုအပ်ပါသည်။ အခြေခံအချက်များကို ဤနေရာတွင် လေ့လာပါ။'}
          </p>
        </div>

        <div className="space-y-8">
          {taxSteps.map((step) => (
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
                  ? 'Tax laws can be complex. Consider consulting with a tax professional for personalized advice, especially if you\'re self-employed or have multiple income sources.'
                  : 'အခွန်ဥပဒေများသည် ရှုပ်ထွေးနိုင်ပါသည်။ အထူးသဖြင့် ကိုယ်ပိုင်လုပ်ငန်းလုပ်ကိုင်နေပါက သို့မဟုတ် ဝင်ငွေအရင်းအမြစ်များစွာ ရှိပါက ကိုယ်ပိုင်အကြံဉာဏ်အတွက် အခွန်ကျွမ်းကျင်သူတစ်ဦးနှင့် တိုင်ပင်ဆွေးနွေးရန် စဉ်းစားပါ။'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaxSelfEmployment;