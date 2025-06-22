import React from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { 
  Calendar, 
  CreditCard, 
  History, 
  Search, 
  BarChart4 
} from 'lucide-react';

const CreditBuilderTips = () => {
  const { t } = useLanguage();

  const tips = [
    {
      id: 1,
      icon: <Calendar className="h-8 w-8 text-teal-600" />,
      title: t('step.3.tip.1.title'),
      description: t('step.3.tip.1.desc')
    },
    {
      id: 2,
      icon: <CreditCard className="h-8 w-8 text-teal-600" />,
      title: t('step.3.tip.2.title'),
      description: t('step.3.tip.2.desc')
    },
    {
      id: 3,
      icon: <History className="h-8 w-8 text-teal-600" />,
      title: t('step.3.tip.3.title'),
      description: t('step.3.tip.3.desc')
    },
    {
      id: 4,
      icon: <Search className="h-8 w-8 text-teal-600" />,
      title: t('step.3.tip.4.title'),
      description: t('step.3.tip.4.desc')
    },
    {
      id: 5,
      icon: <BarChart4 className="h-8 w-8 text-teal-600" />,
      title: t('step.3.tip.5.title'),
      description: t('step.3.tip.5.desc')
    }
  ];

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">{t('step.3.title')}</h2>
        <p className="text-gray-600">{t('step.3.intro')}</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        {tips.map((tip) => (
          <div 
            key={tip.id}
            className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200 flex"
          >
            <div className="mr-4 flex-shrink-0">
              {tip.icon}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">{tip.title}</h3>
              <p className="text-gray-600">{tip.description}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-teal-50 border border-teal-200 rounded-lg p-6 mt-8">
        <h3 className="text-lg font-semibold text-teal-800 mb-4">Credit Score Factors</h3>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-sm font-medium text-teal-700">Payment History</span>
              <span className="text-sm font-medium text-teal-700">35%</span>
            </div>
            <div className="w-full bg-teal-200 rounded-full h-2.5">
              <div className="bg-teal-600 h-2.5 rounded-full" style={{ width: '35%' }}></div>
            </div>
          </div>
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-sm font-medium text-teal-700">Credit Utilization</span>
              <span className="text-sm font-medium text-teal-700">30%</span>
            </div>
            <div className="w-full bg-teal-200 rounded-full h-2.5">
              <div className="bg-teal-600 h-2.5 rounded-full" style={{ width: '30%' }}></div>
            </div>
          </div>
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-sm font-medium text-teal-700">Length of Credit History</span>
              <span className="text-sm font-medium text-teal-700">15%</span>
            </div>
            <div className="w-full bg-teal-200 rounded-full h-2.5">
              <div className="bg-teal-600 h-2.5 rounded-full" style={{ width: '15%' }}></div>
            </div>
          </div>
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-sm font-medium text-teal-700">New Credit</span>
              <span className="text-sm font-medium text-teal-700">10%</span>
            </div>
            <div className="w-full bg-teal-200 rounded-full h-2.5">
              <div className="bg-teal-600 h-2.5 rounded-full" style={{ width: '10%' }}></div>
            </div>
          </div>
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-sm font-medium text-teal-700">Credit Mix</span>
              <span className="text-sm font-medium text-teal-700">10%</span>
            </div>
            <div className="w-full bg-teal-200 rounded-full h-2.5">
              <div className="bg-teal-600 h-2.5 rounded-full" style={{ width: '10%' }}></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreditBuilderTips;