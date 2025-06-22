import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabaseClient';
import {
  CreditCard,
  DollarSign,
  FileText,
  Shield,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  CheckCircle
} from 'lucide-react';

type Task = {
  id: string;
  completed: boolean;
};

const Checklist = () => {
  const { language } = useLanguage();
  const { user } = useAuth();
  const [expandedSection, setExpandedSection] = useState<string | null>('first-month');
  const [tasks, setTasks] = useState<Record<string, Task>>({
    ssn: { id: 'ssn', completed: false },
    dmv: { id: 'dmv', completed: false },
    bank: { id: 'bank', completed: false },
    credit: { id: 'credit', completed: false },
    budget: { id: 'budget', completed: false },
    health: { id: 'health', completed: false },
    life: { id: 'life', completed: false }
  });

  const toggleTask = async (taskId: string) => {
    if (!user) return;

    const newTasks = {
      ...tasks,
      [taskId]: { ...tasks[taskId], completed: !tasks[taskId].completed }
    };
    setTasks(newTasks);

    try {
      const completedTasks = Object.entries(newTasks)
        .filter(([_, task]) => task.completed)
        .map(([id]) => id);

      await supabase
        .from('profiles')
        .update({ onboarding_tasks: completedTasks })
        .eq('id', user.id);
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const sections = [
    {
      id: 'first-month',
      title: language === 'en' ? 'First Month Tasks' : 'ပထမလ လုပ်ငန်းစဉ်များ',
      icon: FileText,
      tasks: [
        {
          id: 'ssn',
          title: language === 'en' ? 'Apply for SSN or ITIN' : 'SSN သို့မဟုတ် ITIN လျှောက်ထားရန်',
          description: language === 'en' 
            ? 'Essential for employment, banking, and credit building'
            : 'အလုပ်အကိုင်၊ ဘဏ်လုပ်ငန်းနှင့် ခရက်ဒစ်တည်ဆောက်ခြင်းအတွက် အရေးကြီးသည်',
          link: 'https://www.ssa.gov/ssnumber/',
          linkText: language === 'en' ? 'Visit SSA Website' : 'SSA ဝက်ဘ်ဆိုက်သို့သွားရန်'
        },
        {
          id: 'dmv',
          title: language === 'en' ? 'Get California ID/Driver\'s License' : 'ကယ်လီဖိုးနီးယား ID/ယာဉ်မောင်းလိုင်စင် ရယူရန်',
          description: language === 'en'
            ? 'Required for identification and driving privileges'
            : 'သက်သေခံနှင့် ယာဉ်မောင်းခွင့်အတွက် လိုအပ်သည်',
          link: 'https://www.dmv.ca.gov/portal/driver-licenses-identification-cards/',
          linkText: language === 'en' ? 'Visit DMV Website' : 'DMV ဝက်ဘ်ဆိုက်သို့သွားရန်'
        },
        {
          id: 'bank',
          title: language === 'en' ? 'Open Bank Account' : 'ဘဏ်အကောင့် ဖွင့်ရန်',
          description: language === 'en'
            ? 'Secure place for your money and essential for daily transactions'
            : 'သင့်ငွေကို လုံခြုံစွာထားရှိရန်နှင့် နေ့စဉ်ငွေကြေးလုပ်ငန်းများအတွက် အရေးကြီးသည်',
          link: 'https://www.bankofamerica.com/checking/advantage-banking/',
          linkText: language === 'en' ? 'Compare Bank Accounts' : 'ဘဏ်အကောင့်များကို နှိုင်းယှဉ်ကြည့်ရန်'
        }
      ]
    },
    {
      id: 'financial-setup',
      title: language === 'en' ? 'Financial Setup' : 'ငွေကြေးစီမံခန့်ခွဲမှု',
      icon: DollarSign,
      tasks: [
        {
          id: 'credit',
          title: language === 'en' ? 'Build Credit Score' : 'ခရက်ဒစ်အဆင့် တည်ဆောက်ရန်',
          description: language === 'en'
            ? 'Start with a secured credit card to build your credit history'
            : 'သင့်ခရက်ဒစ်မှတ်တမ်းကို တည်ဆောက်ရန် secured ခရက်ဒစ်ကတ်ဖြင့် စတင်ပါ',
          link: 'https://www.discover.com/credit-cards/secured/',
          linkText: language === 'en' ? 'Learn About Secured Cards' : 'Secured ကတ်များအကြောင်း လေ့လာရန်'
        },
        {
          id: 'budget',
          title: language === 'en' ? 'Set Budget & Savings Goals' : 'ဘတ်ဂျက်နှင့် စုဆောင်းငွေပန်းတိုင်များ သတ်မှတ်ရန်',
          description: language === 'en'
            ? 'Track expenses and set aside emergency funds'
            : 'အသုံးစရိတ်များကို ခြေရာခံပြီး အရေးပေါ်ရန်ပုံငွေ သီးသန့်ထားရှိပါ',
          link: '/budget',
          linkText: language === 'en' ? 'Use Budget Calculator' : 'ဘတ်ဂျက်ဂဏန်းတွက်စက်ကို အသုံးပြုရန်'
        }
      ]
    },
    {
      id: 'insurance',
      title: language === 'en' ? 'Insurance Essentials' : 'မရှိမဖြစ် အာမခံများ',
      icon: Shield,
      tasks: [
        {
          id: 'health',
          title: language === 'en' ? 'Get Health Insurance' : 'ကျန်းမာရေးအာမခံ ရယူရန်',
          description: language === 'en'
            ? 'Protect yourself from high medical costs'
            : 'ဆေးကုသစရိတ်များမှ ကာကွယ်ရန်',
          link: 'https://www.coveredca.com/',
          linkText: language === 'en' ? 'Visit Covered California' : 'Covered California သို့သွားရန်'
        },
        {
          id: 'life',
          title: language === 'en' ? 'Consider Life Insurance' : 'အသက်အာမခံ စဉ်းစားရန်',
          description: language === 'en'
            ? 'Term life insurance provides affordable protection for your family'
            : 'သက်တမ်းအာမခံသည် သင့်မိသားစုအတွက် တတ်နိုင်သော ကာကွယ်မှုပေးသည်',
          link: 'https://www.statefarm.com/insurance/life',
          linkText: language === 'en' ? 'Compare Life Insurance' : 'အသက်အာမခံများကို နှိုင်းယှဉ်ကြည့်ရန်'
        }
      ]
    }
  ];

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
          <CreditCard className="h-7 w-7 text-teal-600 mr-3" />
          {language === 'en' ? 'Your Immigrant Checklist' : 'ရွှေ့ပြောင်းအခြေချသူ စစ်ဆေးရန်စာရင်း'}
        </h1>

        <div className="space-y-4">
          {sections.map((section) => (
            <div key={section.id} className="border rounded-lg overflow-hidden">
              <button
                onClick={() => toggleSection(section.id)}
                className="w-full px-6 py-4 bg-gray-50 flex items-center justify-between hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center">
                  <section.icon className="h-5 w-5 text-teal-600 mr-3" />
                  <span className="font-semibold text-gray-800">{section.title}</span>
                </div>
                {expandedSection === section.id ? (
                  <ChevronUp className="h-5 w-5 text-gray-500" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-gray-500" />
                )}
              </button>

              {expandedSection === section.id && (
                <div className="p-6 space-y-6">
                  {section.tasks.map((task) => (
                    <div key={task.id} className="space-y-3">
                      <div className="flex items-start">
                        <button
                          onClick={() => toggleTask(task.id)}
                          className={`flex-shrink-0 w-6 h-6 mt-1 mr-3 rounded-full border-2 flex items-center justify-center ${
                            tasks[task.id]?.completed
                              ? 'bg-green-500 border-green-500 text-white'
                              : 'border-gray-300 hover:border-teal-500'
                          }`}
                        >
                          {tasks[task.id]?.completed && <CheckCircle className="h-4 w-4" />}
                        </button>
                        <div>
                          <h3 className="text-lg font-medium text-gray-800">{task.title}</h3>
                          <p className="text-gray-600 mt-1">{task.description}</p>
                          <a
                            href={task.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center text-teal-600 hover:text-teal-700 mt-2"
                          >
                            {task.linkText}
                            <ExternalLink className="h-4 w-4 ml-1" />
                          </a>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Checklist;