import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { LifeBuoy, Mail, MessageSquare } from 'lucide-react';

const Help = () => {
  const { language } = useLanguage();

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
        <div className="flex items-center mb-6">
          <LifeBuoy className="h-8 w-8 text-blue-600 mr-3" />
          <h1 className="text-2xl font-bold text-gray-800">
            {language === 'en' ? 'Help & Support' : 'အကူအညီနှင့် ပံ့ပိုးမှု'}
          </h1>
        </div>

        <div className="space-y-6">
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex items-center mb-3">
              <MessageSquare className="h-6 w-6 text-blue-600 mr-2" />
              <h2 className="text-lg font-semibold text-gray-800">
                {language === 'en' ? 'Chat Support' : 'ချက်တင် အကူအညီ'}
              </h2>
            </div>
            <p className="text-gray-600 mb-4">
              {language === 'en'
                ? 'Use Mini Angel chat for instant help with your financial questions.'
                : 'သင့်ငွေကြေးဆိုင်ရာ မေးခွန်းများအတွက် Mini Angel ချက်တင်ကို အသုံးပြုပါ။'}
            </p>
          </div>

          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex items-center mb-3">
              <Mail className="h-6 w-6 text-blue-600 mr-2" />
              <h2 className="text-lg font-semibold text-gray-800">
                {language === 'en' ? 'Email Support' : 'အီးမေးလ် အကူအညီ'}
              </h2>
            </div>
            <p className="text-gray-600 mb-4">
              {language === 'en'
                ? 'For detailed inquiries, email us at support@miniangel.com'
                : 'အသေးစိတ်မေးမြန်းလိုပါက support@miniangel.com သို့ အီးမေးလ်ပို့ပါ'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Help;