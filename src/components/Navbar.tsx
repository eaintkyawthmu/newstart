import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { CreditCard } from 'lucide-react';
import { Link } from 'react-router-dom';

const Navbar = () => {
  const { t, language, toggleLanguage } = useLanguage();

  return (
    <header className="bg-blue-600 text-white shadow-md">
      <div className="container mx-auto px-4">
        <div className="h-16 flex items-center justify-between">
          <Link 
            to="/" 
            className="flex items-center hover:text-white/90 transition-colors"
          >
            <CreditCard className="h-8 w-8 mr-2" />
            <h1 className="text-xl font-bold">My New Start</h1>
          </Link>
          
          <div className="flex items-center space-x-4">
            <button
              onClick={toggleLanguage}
              className="px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-white/50"
            >
              {language === 'en' ? t('language.burmese') : t('language.english')}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;