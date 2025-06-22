import React from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { DollarSign, Landmark, FileMinus, FileCheck, Users } from 'lucide-react';

const TaxBasics = () => {
  const { t } = useLanguage();

  const taxTopics = [
    {
      id: 'income',
      icon: <DollarSign className="h-10 w-10 text-teal-600" />,
      title: t('step.4.income.title'),
      description: t('step.4.income.desc')
    },
    {
      id: 'deductions',
      icon: <FileMinus className="h-10 w-10 text-teal-600" />,
      title: t('step.4.deductions.title'),
      description: t('step.4.deductions.desc')
    },
    {
      id: 'credits',
      icon: <FileCheck className="h-10 w-10 text-teal-600" />,
      title: t('step.4.credits.title'),
      description: t('step.4.credits.desc')
    },
    {
      id: 'filing',
      icon: <Users className="h-10 w-10 text-teal-600" />,
      title: t('step.4.filing.title'),
      description: t('step.4.filing.desc')
    },
    {
      id: 'planning',
      icon: <Landmark className="h-10 w-10 text-teal-600" />,
      title: t('step.4.planning.title'),
      description: t('step.4.planning.desc')
    }
  ];

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">{t('step.4.title')}</h2>
        <p className="text-gray-600">{t('step.4.intro')}</p>
      </div>
      
      <div className="grid grid-cols-1 gap-8 mt-8">
        {taxTopics.map((topic) => (
          <div 
            key={topic.id}
            className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden transition-all duration-300 hover:shadow-md"
          >
            <div className="flex flex-col md:flex-row">
              <div className="bg-gray-50 p-6 flex items-center justify-center md:w-1/5">
                {topic.icon}
              </div>
              <div className="p-6 md:w-4/5">
                <h3 className="text-xl font-semibold text-gray-800 mb-2">{topic.title}</h3>
                <p className="text-gray-600">{topic.description}</p>
                
                {topic.id === 'income' && (
                  <div className="mt-4 bg-gray-50 p-4 rounded-md">
                    <h4 className="font-medium text-gray-800 mb-2">Common Income Types:</h4>
                    <ul className="list-disc pl-5 text-gray-600 space-y-1">
                      <li>Wages and salaries</li>
                      <li>Self-employment income</li>
                      <li>Investment income (dividends, interest)</li>
                      <li>Rental income</li>
                      <li>Retirement distributions</li>
                    </ul>
                  </div>
                )}
                
                {topic.id === 'deductions' && (
                  <div className="mt-4 bg-gray-50 p-4 rounded-md">
                    <h4 className="font-medium text-gray-800 mb-2">Common Deductions:</h4>
                    <ul className="list-disc pl-5 text-gray-600 space-y-1">
                      <li>Mortgage interest</li>
                      <li>Charitable contributions</li>
                      <li>Medical expenses</li>
                      <li>State and local taxes</li>
                      <li>Educational expenses</li>
                    </ul>
                  </div>
                )}
                
                {topic.id === 'credits' && (
                  <div className="mt-4 bg-gray-50 p-4 rounded-md">
                    <h4 className="font-medium text-gray-800 mb-2">Common Tax Credits:</h4>
                    <ul className="list-disc pl-5 text-gray-600 space-y-1">
                      <li>Child tax credit</li>
                      <li>Earned income credit</li>
                      <li>Education credits</li>
                      <li>Retirement savings contributions credit</li>
                      <li>Energy efficient home improvement credits</li>
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-6">
        <h3 className="text-lg font-semibold text-blue-800 mb-2">Important Tax Dates</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mt-4">
          <div className="bg-white p-4 rounded-md border border-blue-100">
            <p className="font-medium text-blue-800">January 31</p>
            <p className="text-gray-600 text-sm">W-2 and 1099 forms due</p>
          </div>
          <div className="bg-white p-4 rounded-md border border-blue-100">
            <p className="font-medium text-blue-800">April 15</p>
            <p className="text-gray-600 text-sm">Tax filing deadline</p>
          </div>
          <div className="bg-white p-4 rounded-md border border-blue-100">
            <p className="font-medium text-blue-800">October 15</p>
            <p className="text-gray-600 text-sm">Extended filing deadline</p>
          </div>
          <div className="bg-white p-4 rounded-md border border-blue-100">
            <p className="font-medium text-blue-800">December 31</p>
            <p className="text-gray-600 text-sm">Last day for tax deductions</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaxBasics;