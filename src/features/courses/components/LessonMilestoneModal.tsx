import React from 'react';
import { Award } from 'lucide-react';

interface LessonMilestoneModalProps {
  show: boolean;
  onClose: () => void;
  milestoneName: string | null;
  language: string;
}

const LessonMilestoneModal: React.FC<LessonMilestoneModalProps> = ({
  show,
  onClose,
  milestoneName,
  language
}) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-xl">
        <div className="text-center">
          <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Award className="h-10 w-10 text-blue-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            {language === 'en' ? 'Milestone Earned!' : 'မှတ်တိုင်ရရှိပြီ!'}
          </h3>
          <p className="text-gray-600 mb-6">
            {language === 'en' 
              ? `You've earned the "${milestoneName}" milestone!` 
              : `သင်သည် "${milestoneName}" မှတ်တိုင်ကို ရရှိပြီးပါပြီ!`}
          </p>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            {language === 'en' ? 'Awesome!' : 'အံ့ဩဖွယ်ကောင်းပါသည်!'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LessonMilestoneModal;