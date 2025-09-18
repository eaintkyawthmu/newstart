import React, { useState } from 'react';
import { useAccessibility } from './AccessibilityProvider';
import { useLanguage } from '../../contexts/LanguageContext';
import { 
  Settings, 
  Eye, 
  Volume2, 
  Type, 
  Contrast, 
  Zap,
  X,
  Check
} from 'lucide-react';

interface AccessibilityMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

const AccessibilityMenu: React.FC<AccessibilityMenuProps> = ({ isOpen, onClose }) => {
  const { language } = useLanguage();
  const { fontSize, announceMessage } = useAccessibility();
  const [localFontSize, setLocalFontSize] = useState(fontSize);
  const [localReducedMotion, setLocalReducedMotion] = useState(false);
  const [localHighContrast, setLocalHighContrast] = useState(false);

  const handleFontSizeChange = (size: 'normal' | 'large' | 'extra-large') => {
    setLocalFontSize(size);
    
    const root = document.documentElement;
    root.classList.remove('font-large', 'font-extra-large');
    
    if (size === 'large') {
      root.classList.add('font-large');
    } else if (size === 'extra-large') {
      root.classList.add('font-extra-large');
    }
    
    localStorage.setItem('accessibility-font-size', size);
    announceMessage(`Font size changed to ${size}`);
  };

  const handleReducedMotionToggle = () => {
    const newValue = !localReducedMotion;
    setLocalReducedMotion(newValue);
    
    const root = document.documentElement;
    if (newValue) {
      root.classList.add('reduce-motion');
    } else {
      root.classList.remove('reduce-motion');
    }
    
    localStorage.setItem('accessibility-reduced-motion', newValue.toString());
    announceMessage(`Animations ${newValue ? 'reduced' : 'enabled'}`);
  };

  const handleHighContrastToggle = () => {
    const newValue = !localHighContrast;
    setLocalHighContrast(newValue);
    
    const root = document.documentElement;
    if (newValue) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }
    
    localStorage.setItem('accessibility-high-contrast', newValue.toString());
    announceMessage(`High contrast ${newValue ? 'enabled' : 'disabled'}`);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div 
        className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[80vh] overflow-y-auto"
        role="dialog"
        aria-modal="true"
        aria-labelledby="accessibility-title"
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 id="accessibility-title" className="text-xl font-semibold text-gray-900 flex items-center">
              <Settings className="h-6 w-6 mr-2 text-blue-600" />
              {language === 'en' ? 'Accessibility Settings' : 'အသုံးပြုနိုင်မှု ဆက်တင်များ'}
            </h2>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label={language === 'en' ? 'Close accessibility menu' : 'အသုံးပြုနိုင်မှုမီနူး ပိတ်ရန်'}
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>

          <div className="space-y-6">
            {/* Font Size */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
                <Type className="h-5 w-5 mr-2 text-gray-600" />
                {language === 'en' ? 'Text Size' : 'စာလုံးအရွယ်အစား'}
              </h3>
              <div className="space-y-2">
                {[
                  { value: 'normal', label: language === 'en' ? 'Normal' : 'ပုံမှန်' },
                  { value: 'large', label: language === 'en' ? 'Large' : 'ကြီး' },
                  { value: 'extra-large', label: language === 'en' ? 'Extra Large' : 'အလွန်ကြီး' }
                ].map((option) => (
                  <label key={option.value} className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      name="fontSize"
                      value={option.value}
                      checked={localFontSize === option.value}
                      onChange={() => handleFontSizeChange(option.value as any)}
                      className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                    />
                    <span className="ml-3 text-gray-700">{option.label}</span>
                    {localFontSize === option.value && (
                      <Check className="h-4 w-4 ml-auto text-green-600" />
                    )}
                  </label>
                ))}
              </div>
            </div>

            {/* Reduced Motion */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
                <Zap className="h-5 w-5 mr-2 text-gray-600" />
                {language === 'en' ? 'Motion' : 'လှုပ်ရှားမှု'}
              </h3>
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-gray-700">
                  {language === 'en' ? 'Reduce animations' : 'လှုပ်ရှားမှုများ လျှော့ချရန်'}
                </span>
                <input
                  type="checkbox"
                  checked={localReducedMotion}
                  onChange={handleReducedMotionToggle}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
              </label>
              <p className="text-sm text-gray-500 mt-1">
                {language === 'en' 
                  ? 'Reduces motion for users sensitive to animations'
                  : 'လှုပ်ရှားမှုများကို ခံစားရလွယ်သော အသုံးပြုသူများအတွက် လှုပ်ရှားမှုကို လျှော့ချပေးသည်'}
              </p>
            </div>

            {/* High Contrast */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
                <Contrast className="h-5 w-5 mr-2 text-gray-600" />
                {language === 'en' ? 'Contrast' : 'အရောင်ခြားနားမှု'}
              </h3>
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-gray-700">
                  {language === 'en' ? 'High contrast mode' : 'အရောင်ခြားနားမှု မြင့်မားသောမုဒ်'}
                </span>
                <input
                  type="checkbox"
                  checked={localHighContrast}
                  onChange={handleHighContrastToggle}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
              </label>
              <p className="text-sm text-gray-500 mt-1">
                {language === 'en' 
                  ? 'Increases contrast for better readability'
                  : 'ပိုမိုကောင်းမွန်စွာ ဖတ်ရှုနိုင်ရန် အရောင်ခြားနားမှုကို တိုးမြှင့်ပေးသည်'}
              </p>
            </div>

            {/* Screen Reader Support */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
                <Volume2 className="h-5 w-5 mr-2 text-gray-600" />
                {language === 'en' ? 'Screen Reader' : 'မျက်နှာပြင်ဖတ်စက်'}
              </h3>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  {language === 'en'
                    ? 'This app is optimized for screen readers with proper ARIA labels and semantic HTML.'
                    : 'ဤအက်ပ်သည် သင့်လျော်သော ARIA တံဆိပ်များနှင့် semantic HTML ဖြင့် မျက်နှာပြင်ဖတ်စက်များအတွက် အကောင်းဆုံးဖြစ်အောင် ပြုလုပ်ထားသည်။'}
                </p>
              </div>
            </div>

            {/* Keyboard Navigation */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
                <Eye className="h-5 w-5 mr-2 text-gray-600" />
                {language === 'en' ? 'Keyboard Navigation' : 'ကီးဘုတ်လမ်းညွှန်မှု'}
              </h3>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="space-y-2 text-sm text-green-800">
                  <p><kbd className="bg-white px-2 py-1 rounded border">Tab</kbd> - {language === 'en' ? 'Navigate forward' : 'ရှေ့သို့ လမ်းညွှန်'}</p>
                  <p><kbd className="bg-white px-2 py-1 rounded border">Shift + Tab</kbd> - {language === 'en' ? 'Navigate backward' : 'နောက်သို့ လမ်းညွှန်'}</p>
                  <p><kbd className="bg-white px-2 py-1 rounded border">Enter</kbd> - {language === 'en' ? 'Activate button/link' : "ခလုတ်/လင့်ခ် အသက်ဝင်စေရန်"}</p>
                  <p><kbd className="bg-white px-2 py-1 rounded border">Escape</kbd> - {language === 'en' ? 'Close modal/menu' : \'မုဒယ်/မီနူး ပိတ်ရန်'}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-200">
            <button
              onClick={onClose}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              {language === 'en' ? 'Done' : 'ပြီးပါပြီ'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccessibilityMenu