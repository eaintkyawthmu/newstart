import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

interface BackButtonProps {
  to?: string;
  label?: string;
  className?: string;
}

const BackButton: React.FC<BackButtonProps> = ({ 
  to, 
  label, 
  className = '' 
}) => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  
  const defaultLabel = language === 'en' ? 'Back' : 'နောက်သို့';
  
  const handleClick = () => {
    if (to) {
      navigate(to);
    } else {
      navigate(-1);
    }
  };
  
  return (
    <button
      onClick={handleClick}
      className={`back-button ${className}`}
      aria-label={label || defaultLabel}
    >
      <ArrowLeft className="h-5 w-5 mr-2" />
      <span>{label || defaultLabel}</span>
    </button>
  );
};

export default BackButton;