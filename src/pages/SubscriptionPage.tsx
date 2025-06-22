import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { ArrowLeft, Shield, CreditCard, CheckCircle } from 'lucide-react';
import SubscriptionManager from '../components/SubscriptionManager';

const SubscriptionPage: React.FC = () => {
  const { language } = useLanguage();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center text-gray-600 hover:text-gray-800 mb-8"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          {language === 'en' ? 'Back to Dashboard' : 'ဒက်ရှ်ဘုတ်သို့ ပြန်သွားရန်'}
        </button>

        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            {language === 'en' ? 'Choose Your Plan' : 'သင့်အစီအစဉ်ကို ရွေးချယ်ပါ'}
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            {language === 'en'
              ? 'Unlock premium features and accelerate your financial journey in America'
              : 'Premium အင်္ဂါရပ်များကို ဖွင့်လှစ်ပြီး အမေရိကန်တွင် သင့်ငွေကြေးခရီးကို အရှိန်မြှင့်ပါ'}
          </p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm mb-8">
          <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-6">
            <div className="flex-shrink-0 flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full">
              <Shield className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-800">
                {language === 'en' ? 'Our Promise to You' : 'သင့်အတွက် ကျွန်ုပ်တို့၏ ကတိ'}
              </h2>
              <p className="text-gray-600">
                {language === 'en'
                  ? 'We offer a 14-day money-back guarantee on all plans. If you\'re not completely satisfied, we\'ll refund your payment.'
                  : 'အစီအစဉ်အားလုံးအတွက် ၁၄ ရက် ငွေပြန်အမ်းအာမခံချက် ပေးပါသည်။ သင် လုံးဝကျေနပ်မှုမရှိပါက သင့်ငွေပေးချေမှုကို ပြန်အမ်းပေးပါမည်။'}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm mb-8">
          <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-6">
            <div className="flex-shrink-0 flex items-center justify-center w-12 h-12 bg-green-100 rounded-full">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-800">
                {language === 'en' ? 'Secure Payment' : 'လုံခြုံသော ငွေပေးချေမှု'}
              </h2>
              <p className="text-gray-600">
                {language === 'en'
                  ? 'All payments are processed securely through Stripe. Your payment information is never stored on our servers.'
                  : 'ငွေပေးချေမှုအားလုံးကို Stripe မှတဆင့် လုံခြုံစွာ ဆောင်ရွက်ပါသည်။ သင့်ငွေပေးချေမှုအချက်အလက်ကို ကျွန်ုပ်တို့၏ ဆာဗာများတွင် မည်သည့်အခါမျှ သိမ်းဆည်းခြင်းမရှိပါ။'}
              </p>
              <div className="flex items-center mt-2">
                <CreditCard className="h-5 w-5 text-gray-400 mr-2" />
                <span className="text-sm text-gray-500">Visa, Mastercard, American Express, Discover</span>
              </div>
            </div>
          </div>
        </div>

        <SubscriptionManager />
      </div>
    </div>
  );
};

export default SubscriptionPage;