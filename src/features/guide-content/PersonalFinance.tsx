import React from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { 
  TrendingUp, 
  HeartPulse, 
  Home, 
  Users, 
  BadgeDollarSign 
} from 'lucide-react';

const PersonalFinance = () => {
  const { t } = useLanguage();

  const topics = [
    {
      id: 'retirement',
      icon: <BadgeDollarSign className="h-10 w-10 text-indigo-600" />,
      title: t('step.5.retirement.title'),
      description: t('step.5.retirement.desc'),
      bgColor: 'bg-indigo-50',
      borderColor: 'border-indigo-200'
    },
    {
      id: 'investment',
      icon: <TrendingUp className="h-10 w-10 text-green-600" />,
      title: t('step.5.investment.title'),
      description: t('step.5.investment.desc'),
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200'
    },
    {
      id: 'health',
      icon: <HeartPulse className="h-10 w-10 text-red-600" />,
      title: t('step.5.health.title'),
      description: t('step.5.health.desc'),
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200'
    },
    {
      id: 'life',
      icon: <Users className="h-10 w-10 text-blue-600" />,
      title: t('step.5.life.title'),
      description: t('step.5.life.desc'),
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200'
    },
    {
      id: 'property',
      icon: <Home className="h-10 w-10 text-amber-600" />,
      title: t('step.5.property.title'),
      description: t('step.5.property.desc'),
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-200'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">{t('step.5.title')}</h2>
        <p className="text-gray-600">{t('step.5.intro')}</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        {topics.map((topic) => (
          <div 
            key={topic.id}
            className={`${topic.bgColor} ${topic.borderColor} border rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow duration-200`}
          >
            <div className="flex items-center mb-4">
              {topic.icon}
              <h3 className="text-xl font-semibold ml-3">{topic.title}</h3>
            </div>
            <p className="text-gray-700">{topic.description}</p>
            
            {topic.id === 'retirement' && (
              <div className="mt-4 space-y-3">
                <h4 className="font-medium text-gray-800">Common Retirement Accounts:</h4>
                <div className="bg-white rounded-md p-3 border border-indigo-100">
                  <p className="font-medium text-indigo-700">401(k)/403(b)</p>
                  <p className="text-sm text-gray-600">Employer-sponsored retirement plans with tax advantages</p>
                </div>
                <div className="bg-white rounded-md p-3 border border-indigo-100">
                  <p className="font-medium text-indigo-700">IRA (Traditional/Roth)</p>
                  <p className="text-sm text-gray-600">Individual retirement accounts with different tax treatments</p>
                </div>
              </div>
            )}
            
            {topic.id === 'investment' && (
              <div className="mt-4 space-y-3">
                <h4 className="font-medium text-gray-800">Investment Options:</h4>
                <div className="bg-white rounded-md p-3 border border-green-100">
                  <p className="font-medium text-green-700">Index Funds</p>
                  <p className="text-sm text-gray-600">Low-cost way to diversify across markets</p>
                </div>
                <div className="bg-white rounded-md p-3 border border-green-100">
                  <p className="font-medium text-green-700">Bonds</p>
                  <p className="text-sm text-gray-600">Generally lower risk, fixed income investments</p>
                </div>
              </div>
            )}
            
            {topic.id === 'health' && (
              <div className="mt-4 space-y-3">
                <h4 className="font-medium text-gray-800">Health Insurance Types:</h4>
                <div className="bg-white rounded-md p-3 border border-red-100">
                  <p className="font-medium text-red-700">HMO</p>
                  <p className="text-sm text-gray-600">Health Maintenance Organization - network providers only</p>
                </div>
                <div className="bg-white rounded-md p-3 border border-red-100">
                  <p className="font-medium text-red-700">PPO</p>
                  <p className="text-sm text-gray-600">Preferred Provider Organization - more flexibility</p>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
      
      <div className="bg-teal-50 border border-teal-200 rounded-lg p-6 mt-8">
        <h3 className="text-xl font-semibold text-teal-800 mb-4">Financial Priorities Checklist</h3>
        <ol className="space-y-4 list-decimal list-inside text-gray-700">
          <li className="p-3 bg-white rounded-md border border-teal-100">
            <span className="font-medium">Build emergency fund</span>
            <p className="text-sm text-gray-600 mt-1 ml-5">3-6 months of expenses in easily accessible accounts</p>
          </li>
          <li className="p-3 bg-white rounded-md border border-teal-100">
            <span className="font-medium">Pay off high-interest debt</span>
            <p className="text-sm text-gray-600 mt-1 ml-5">Focus on credit cards and loans with rates above 8%</p>
          </li>
          <li className="p-3 bg-white rounded-md border border-teal-100">
            <span className="font-medium">Contribute to retirement</span>
            <p className="text-sm text-gray-600 mt-1 ml-5">At least enough to get full employer match if available</p>
          </li>
          <li className="p-3 bg-white rounded-md border border-teal-100">
            <span className="font-medium">Adequate insurance coverage</span>
            <p className="text-sm text-gray-600 mt-1 ml-5">Health, auto, home/renters, and life if you have dependents</p>
          </li>
          <li className="p-3 bg-white rounded-md border border-teal-100">
            <span className="font-medium">Additional investments</span>
            <p className="text-sm text-gray-600 mt-1 ml-5">After basics are covered, expand your investment portfolio</p>
          </li>
        </ol>
      </div>
    </div>
  );
};

export default PersonalFinance;