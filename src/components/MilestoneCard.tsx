import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { Milestone, UserMilestone } from '../types/milestone';
import { Award, CheckCircle, Clock, Lock } from 'lucide-react';

interface MilestoneCardProps {
  milestone: Milestone;
  userMilestone?: UserMilestone;
  onClaimReward?: (milestoneId: string) => void;
}

const MilestoneCard: React.FC<MilestoneCardProps> = ({ 
  milestone, 
  userMilestone,
  onClaimReward
}) => {
  const { language } = useLanguage();
  const isEarned = !!userMilestone;
  const isClaimed = userMilestone?.reward_claimed;

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString(language === 'en' ? 'en-US' : 'my', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Format requirements for display
  const formatRequirement = (req: any) => {
    switch (req.type) {
      case 'lesson':
        return language === 'en' 
          ? `Complete ${req.count} lesson${req.count > 1 ? 's' : ''}` 
          : `သင်ခန်းစာ ${req.count} ခု ပြီးဆုံးရန်`;
      case 'path':
        return language === 'en'
          ? 'Complete the course'
          : 'သင်တန်း ပြီးဆုံးရန်';
      case 'tasks':
        return language === 'en'
          ? `Complete ${req.count} task${req.count > 1 ? 's' : ''}`
          : `လုပ်ငန်းတာဝန် ${req.count} ခု ပြီးဆုံးရန်`;
      case 'quiz':
        return language === 'en'
          ? 'Pass the quiz'
          : 'ဆစ်ကို အောင်မြင်ရန်';
      default:
        return language === 'en'
          ? 'Complete requirement'
          : 'လိုအပ်ချက်ကို ပြီးဆုံးရန်';
    }
  };

  // Get badge image for this milestone
  const getBadgeImage = () => {
    // Map milestone IDs to badge images - in a real app, this would come from your Sanity data
    const badgeMap: Record<string, string> = {
      'milestone-first-lesson': '/badges/first-lesson.png',
      'milestone-credit-master': '/badges/credit-master.png',
      'milestone-beginner': '/badges/achievement-beginner.png',
      'milestone-intermediate': '/badges/achievement-intermediate.png',
      'milestone-advanced': '/badges/achievement-advanced.png',
    };
    
    // Return the mapped badge or a default
    return badgeMap[milestone.id] || '/badges/achievement-beginner.png';
  };

  return (
    <div className={`border rounded-lg overflow-hidden transition-all duration-300 ${
      isEarned 
        ? 'bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200 shadow-sm' 
        : 'bg-white border-gray-200'
    }`}>
      <div className="p-4">
        <div className="flex items-start">
          <div className="w-16 h-16 rounded-full flex-shrink-0 bg-white border border-gray-200 flex items-center justify-center mr-4 overflow-hidden">
            {isEarned ? (
              <img src={getBadgeImage()} alt={milestone.title} className="w-14 h-14 object-contain" />
            ) : (
              <Lock className="h-8 w-8 text-gray-400" />
            )}
          </div>
          
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">{milestone.title}</h3>
            <p className="text-sm text-gray-600 mb-2">{milestone.description}</p>
            
            {isEarned && (
              <div className="flex items-center text-xs text-blue-600">
                <Clock className="h-3 w-3 mr-1" />
                <span>
                  {language === 'en' ? 'Earned on ' : 'ရရှိသည့်ရက် '} 
                  {formatDate(userMilestone.earned_at)}
                </span>
              </div>
            )}
          </div>
        </div>
        
        {isEarned && !isClaimed && milestone.reward && (
          <div className="mt-4 pt-4 border-t border-blue-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-800">
                  {language === 'en' ? 'Reward Available!' : 'ဆုလက်ဆောင် ရရှိနိုင်ပါပြီ!'}
                </p>
                <p className="text-xs text-blue-600">{milestone.reward.description}</p>
              </div>
              
              <button
                onClick={() => onClaimReward?.(milestone.id)}
                className="px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
              >
                {language === 'en' ? 'Claim' : 'ရယူရန်'}
              </button>
            </div>
          </div>
        )}
        
        {isEarned && isClaimed && (
          <div className="mt-4 pt-4 border-t border-blue-100">
            <div className="flex items-center text-green-600">
              <CheckCircle className="h-4 w-4 mr-2" />
              <span className="text-sm">
                {language === 'en' ? 'Reward Claimed' : 'ဆုလက်ဆောင် ရယူပြီး'}
              </span>
            </div>
          </div>
        )}
        
        {!isEarned && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <h4 className="text-sm font-medium text-gray-700 mb-2">
              {language === 'en' ? 'Requirements:' : 'လိုအပ်ချက်များ:'}
            </h4>
            <ul className="text-xs text-gray-600 space-y-1">
              {milestone.requirements.map((req, index) => (
                <li key={index} className="flex items-center">
                  <div className="w-4 h-4 rounded-full border border-gray-300 mr-2"></div>
                  <span>{formatRequirement(req)}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default MilestoneCard;