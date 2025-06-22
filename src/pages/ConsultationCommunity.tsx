import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import {
  Calendar,
  Users,
  MapPin,
  ExternalLink,
  MessageSquare,
  Phone
} from 'lucide-react';

const ConsultationCommunity = () => {
  const { language } = useLanguage();

  const communityLinks = [
    {
      id: 'facebook',
      title: language === 'en' ? 'Facebook Community' : 'Facebook အသိုင်းအဝိုင်း',
      description: language === 'en' 
        ? 'Join our Facebook group to connect with other immigrants'
        : 'အခြားရွှေ့ပြောင်းအခြေချသူများနှင့် ချိတ်ဆက်ရန် ကျွန်ုပ်တို့၏ Facebook အုပ်စုသို့ ဝင်ရောက်ပါ',
      link: 'https://facebook.com/groups/immigrantjourney'
    },
    {
      id: 'whatsapp',
      title: language === 'en' ? 'WhatsApp Group' : 'WhatsApp အုပ်စု',
      description: language === 'en'
        ? 'Get instant support and advice from our community'
        : 'ကျွန်ုပ်တို့၏အသိုင်းအဝိုင်းမှ ချက်ချင်းအကူအညီနှင့် အကြံဉာဏ်များ ရယူပါ',
      link: 'https://chat.whatsapp.com/immigrantjourney'
    }
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            {language === 'en' 
              ? 'Get Support & Connect' 
              : 'ပံ့ပိုးမှုရယူပြီး ချိတ်ဆက်ပါ'}
          </h1>
          <p className="text-gray-600">
            {language === 'en'
              ? 'Schedule a consultation or join our community for support'
              : 'တိုင်ပင်ဆွေးနွေးမှုတစ်ခု စီစဉ်ပါ သို့မဟုတ် ပံ့ပိုးမှုအတွက် ကျွန်ုပ်တို့၏အသိုင်းအဝိုင်းသို့ ဝင်ရောက်ပါ'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Booking Calendar Section */}
          <div className="space-y-4">
            <div className="flex items-center mb-4">
              <Calendar className="h-6 w-6 text-blue-600 mr-2" />
              <h2 className="text-xl font-semibold text-gray-800">
                {language === 'en' ? 'Book a Consultation' : 'တိုင်ပင်ဆွေးနွေးမှု စီစဉ်ပါ'}
              </h2>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <iframe
                src="https://calendar.zoho.com/embed"
                width="100%"
                height="500"
                frameBorder="0"
                scrolling="yes"
                className="rounded-lg"
              ></iframe>
            </div>
          </div>

          {/* Community & Resources Section */}
          <div className="space-y-6">
            {/* Community Links */}
            <div>
              <div className="flex items-center mb-4">
                <Users className="h-6 w-6 text-blue-600 mr-2" />
                <h2 className="text-xl font-semibold text-gray-800">
                  {language === 'en' ? 'Join Our Community' : 'ကျွန်ုပ်တို့၏အသိုင်းအဝိုင်းသို့ ဝင်ရောက်ပါ'}
                </h2>
              </div>

              <div className="space-y-4">
                {communityLinks.map(link => (
                  <a
                    key={link.id}
                    href={link.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-blue-200 transition-colors"
                  >
                    <h3 className="font-semibold text-gray-800 flex items-center">
                      {link.title}
                      <ExternalLink className="h-4 w-4 ml-2" />
                    </h3>
                    <p className="text-gray-600 text-sm mt-1">{link.description}</p>
                  </a>
                ))}
              </div>
            </div>

            {/* Local Resources Map */}
            <div>
              <div className="flex items-center mb-4">
                <MapPin className="h-6 w-6 text-blue-600 mr-2" />
                <h2 className="text-xl font-semibold text-gray-800">
                  {language === 'en' ? 'Local Resources' : 'ဒေသတွင်း အရင်းအမြစ်များ'}
                </h2>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <iframe
                  src="https://www.google.com/maps/embed/v1/search?key=YOUR_API_KEY&q=immigrant+resources+near+me"
                  width="100%"
                  height="300"
                  frameBorder="0"
                  className="rounded-lg"
                  allowFullScreen
                ></iframe>
              </div>
            </div>

            {/* Contact Information */}
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <h3 className="font-semibold text-blue-800 mb-2 flex items-center">
                <Phone className="h-5 w-5 mr-2" />
                {language === 'en' ? 'Need Immediate Help?' : 'အရေးပေါ်အကူအညီ လိုပါသလား။'}
              </h3>
              <p className="text-blue-700 text-sm">
                {language === 'en'
                  ? 'Call our support line: (800) 123-4567'
                  : 'ကျွန်ုပ်တို့၏ အကူအညီဖုန်းလိုင်း- (800) 123-4567'}
              </p>
              <div className="flex items-center mt-2">
                <MessageSquare className="h-5 w-5 text-blue-600 mr-2" />
                <span className="text-blue-700 text-sm">
                  {language === 'en' ? 'Or chat with Mini Angel' : 'သို့မဟုတ် Mini Angel နှင့် စကားပြောပါ'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConsultationCommunity;