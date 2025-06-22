import React, { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

interface PageHeaderProps {
  title: string;
  description?: string;
  backLink?: string;
  backLabel?: string;
  icon?: ReactNode;
  actions?: ReactNode;
}

const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  description,
  backLink,
  backLabel,
  icon,
  actions
}) => {
  const navigate = useNavigate();
  const { language } = useLanguage();

  const handleBack = () => {
    if (backLink) {
      navigate(backLink);
    } else {
      navigate(-1);
    }
  };

  return (
    <div className="mb-6">
      {backLink && (
        <button
          onClick={handleBack}
          className="hidden md:flex items-center text-gray-600 hover:text-gray-800 mb-4"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          {backLabel || (language === 'en' ? 'Back' : 'နောက်သို့')}
        </button>
      )}
      
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div className="flex items-center mb-4 md:mb-0">
          {icon && <div className="mr-3 flex-shrink-0">{icon}</div>}
          <div>
            <h1 className="text-2xl font-bold text-gray-800">{title}</h1>
            {description && <p className="text-gray-600 mt-1">{description}</p>}
          </div>
        </div>
        
        {actions && (
          <div className="flex items-center space-x-3">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
};

export default PageHeader;