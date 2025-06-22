import React, { useState } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { Check, AlertCircle, Heart, Lightbulb, Target, Shield } from 'lucide-react';

const WelcomeChecklist = () => {
  const { t, language } = useLanguage();
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({
    task1: false,
    task2: false,
    task3: false,
    task4: false,
    task5: false
  });

  const handleCheck = (taskId: string) => {
    setCheckedItems(prev => ({
      ...prev,
      [taskId]: !prev[taskId]
    }));
  };

  const tasks = [
    { id: 'task1', title: t('step.1.task.1') },
    { id: 'task2', title: t('step.1.task.2') },
    { id: 'task3', title: t('step.1.task.3') },
    { id: 'task4', title: t('step.1.task.4') },
    { id: 'task5', title: t('step.1.task.5') }
  ];

  const completedCount = Object.values(checkedItems).filter(Boolean).length;
  const progressPercentage = (completedCount / tasks.length) * 100;

  return (
    <div className="space-y-8">
      <div className="text-center max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">
          {language === 'en' ? 'Immigrant Journey Made Easier' : 'ရွှေ့ပြောင်းအခြေချသူများအတွက် လမ်းညွှန်'}
        </h1>
        <p className="text-lg text-gray-600 mb-8">
          {language === 'en' 
            ? "Starting over in a new country is never easy — but it doesn't have to be confusing. Mini Angel is here to guide you step by step, helping you understand banking, credit, taxes, and family protection in a simple way — at your own pace, in your own language."
            : "နိုင်ငံသစ်တစ်ခုတွင် ဘဝသစ်စတင်ရန် မလွယ်ကူပါ — သို့သော် ရှုပ်ထွေးစရာမလိုပါ။ Mini Angel သည် သင့်အား ဘဏ်လုပ်ငန်း၊ ခရက်ဒစ်၊ အခွန်နှင့် မိသားစုကာကွယ်ရေးကို သင့်အခြေအနေနှင့် သင့်ဘာသာစကားဖြင့် နားလည်လွယ်အောင် အဆင့်ဆင့်ကူညီပေးသွားမည်ဖြစ်သည်။"}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 flex flex-col items-center text-center">
          <div className="bg-teal-100 p-3 rounded-full mb-4">
            <Heart className="h-6 w-6 text-teal-600" />
          </div>
          <h3 className="font-semibold text-gray-800 mb-2">
            {language === 'en' ? 'Personalized Guidance' : 'ကိုယ်ပိုင်လမ်းညွှန်မှု'}
          </h3>
          <p className="text-gray-600 text-sm">
            {language === 'en' 
              ? 'Step-by-step support tailored to your needs'
              : 'သင့်လိုအပ်ချက်နှင့်ကိုက်ညီသော အဆင့်ဆင့်ပံ့ပိုးမှု'}
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 flex flex-col items-center text-center">
          <div className="bg-teal-100 p-3 rounded-full mb-4">
            <Lightbulb className="h-6 w-6 text-teal-600" />
          </div>
          <h3 className="font-semibold text-gray-800 mb-2">
            {language === 'en' ? 'Simple Learning' : 'လွယ်ကူသောသင်ယူမှု'}
          </h3>
          <p className="text-gray-600 text-sm">
            {language === 'en'
              ? 'Complex topics explained in simple terms'
              : 'ရှုပ်ထွေးသောအကြောင်းအရာများကို ရိုးရှင်းစွာရှင်းပြထားသည်'}
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 flex flex-col items-center text-center">
          <div className="bg-teal-100 p-3 rounded-full mb-4">
            <Target className="h-6 w-6 text-teal-600" />
          </div>
          <h3 className="font-semibold text-gray-800 mb-2">
            {language === 'en' ? 'Track Progress' : 'တိုးတက်မှုကိုစောင့်ကြည့်ပါ'}
          </h3>
          <p className="text-gray-600 text-sm">
            {language === 'en'
              ? 'Monitor your financial learning journey'
              : 'သင့်ငွေကြေးဆိုင်ရာလေ့လာမှုခရီးကို စောင့်ကြည့်ပါ'}
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 flex flex-col items-center text-center">
          <div className="bg-teal-100 p-3 rounded-full mb-4">
            <Shield className="h-6 w-6 text-teal-600" />
          </div>
          <h3 className="font-semibold text-gray-800 mb-2">
            {language === 'en' ? 'Safe & Secure' : 'လုံခြုံစိတ်ချရသော'}
          </h3>
          <p className="text-gray-600 text-sm">
            {language === 'en'
              ? 'Trusted guidance for your financial security'
              : 'သင့်ငွေကြေးလုံခြုံရေးအတွက် ယုံကြည်စိတ်ချရသောလမ်းညွှန်မှု'}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">{t('step.1.title')}</h2>
        <p className="text-gray-600 mb-6">{t('step.1.intro')}</p>

        <div className="w-full bg-gray-200 rounded-full h-2.5 mb-6">
          <div 
            className="bg-teal-600 h-2.5 rounded-full transition-all duration-500 ease-out" 
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>

        <ul className="space-y-3">
          {tasks.map((task) => (
            <li 
              key={task.id}
              className={`flex items-center p-4 rounded-lg border transition-all duration-200 ${
                checkedItems[task.id] 
                  ? 'bg-green-50 border-green-200' 
                  : 'bg-white border-gray-200 hover:border-teal-200 hover:bg-teal-50'
              }`}
            >
              <div 
                className={`w-6 h-6 mr-4 rounded-full flex items-center justify-center cursor-pointer ${
                  checkedItems[task.id] 
                    ? 'bg-green-500 text-white' 
                    : 'border-2 border-gray-300 hover:border-teal-500'
                }`}
                onClick={() => handleCheck(task.id)}
              >
                {checkedItems[task.id] && <Check className="w-4 h-4" />}
              </div>
              <span 
                className={`flex-grow ${
                  checkedItems[task.id] ? 'text-gray-600 line-through' : 'text-gray-800'
                }`}
              >
                {task.title}
              </span>
            </li>
          ))}
        </ul>

        <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-start">
          <AlertCircle className="w-5 h-5 text-blue-500 mr-3 mt-0.5 flex-shrink-0" />
          <p className="text-blue-800">{t('step.1.cta')}</p>
        </div>
      </div>
    </div>
  );
};

export default WelcomeChecklist;