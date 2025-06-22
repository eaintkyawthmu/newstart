import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { DollarSign, AlertTriangle, PieChart } from 'lucide-react';

const BudgetPlanner = () => {
  const { t } = useLanguage();
  
  const [income, setIncome] = useState<number>(0);
  const [expenses, setExpenses] = useState<{
    housing: number;
    food: number;
    transportation: number;
    utilities: number;
    entertainment: number;
    other: number;
  }>({
    housing: 0,
    food: 0,
    transportation: 0,
    utilities: 0,
    entertainment: 0,
    other: 0
  });
  const [savings, setSavings] = useState<number>(0);
  const [remaining, setRemaining] = useState<number>(0);

  useEffect(() => {
    const totalExpenses = Object.values(expenses).reduce((acc, curr) => acc + (curr || 0), 0);
    const savingsAmount = (savings || 0);
    const remainingAmount = income - totalExpenses - savingsAmount;
    setRemaining(remainingAmount);
  }, [income, expenses, savings]);

  const handleExpenseChange = (category: keyof typeof expenses, value: string) => {
    const numValue = parseFloat(value) || 0;
    setExpenses(prev => ({
      ...prev,
      [category]: numValue
    }));
  };

  const totalExpenses = Object.values(expenses).reduce((acc, curr) => acc + (curr || 0), 0);
  const savingsPercentage = income > 0 ? (savings / income) * 100 : 0;

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">{t('step.2.title')}</h2>
        <p className="text-gray-600">{t('step.2.intro')}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <DollarSign className="h-5 w-5 text-teal-600 mr-2" />
            {t('step.2.income')}
          </h3>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('step.2.income')}
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">$</span>
              <input
                type="number"
                min="0"
                value={income || ''}
                onChange={(e) => setIncome(parseFloat(e.target.value) || 0)}
                className="block w-full pl-8 pr-3 py-2 rounded-md border border-gray-300 focus:ring-teal-500 focus:border-teal-500"
              />
            </div>
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('step.2.savings')}
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">$</span>
              <input
                type="number"
                min="0"
                value={savings || ''}
                onChange={(e) => setSavings(parseFloat(e.target.value) || 0)}
                className="block w-full pl-8 pr-3 py-2 rounded-md border border-gray-300 focus:ring-teal-500 focus:border-teal-500"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {savingsPercentage.toFixed(1)}% {t('step.2.tip')}
            </p>
          </div>

          <div className="p-3 bg-blue-50 rounded-md flex items-start mt-4">
            <PieChart className="h-5 w-5 text-blue-500 mr-2 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-blue-800">
              {t('step.2.tip')}
            </p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm">
          <h3 className="text-lg font-semibold mb-4">{t('step.2.expenses')}</h3>
          
          {Object.keys(expenses).map((category) => (
            <div key={category} className="mb-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t(`step.2.${category}`)}
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">$</span>
                <input
                  type="number"
                  min="0"
                  value={expenses[category as keyof typeof expenses] || ''}
                  onChange={(e) => handleExpenseChange(category as keyof typeof expenses, e.target.value)}
                  className="block w-full pl-8 pr-3 py-2 rounded-md border border-gray-300 focus:ring-teal-500 focus:border-teal-500"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-gray-100 p-5 rounded-lg border border-gray-200 mt-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-white rounded-lg shadow-sm border border-gray-200">
            <p className="text-sm text-gray-500">{t('step.2.income')}</p>
            <p className="text-2xl font-bold text-gray-800">${income.toFixed(2)}</p>
          </div>
          <div className="p-4 bg-white rounded-lg shadow-sm border border-gray-200">
            <p className="text-sm text-gray-500">{t('step.2.expenses')}</p>
            <p className="text-2xl font-bold text-gray-800">${totalExpenses.toFixed(2)}</p>
          </div>
          <div className={`p-4 rounded-lg shadow-sm border ${
            remaining >= 0 
              ? 'bg-green-50 border-green-200' 
              : 'bg-red-50 border-red-200'
          }`}>
            <p className="text-sm text-gray-500">{t('step.2.remaining')}</p>
            <p className={`text-2xl font-bold ${
              remaining >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              ${remaining.toFixed(2)}
            </p>
            {remaining < 0 && (
              <div className="flex items-center mt-2">
                <AlertTriangle className="h-4 w-4 text-red-500 mr-1" />
                <span className="text-xs text-red-600">Overspending!</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BudgetPlanner;