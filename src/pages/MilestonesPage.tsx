import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useMilestones } from '../hooks/useMilestones';
import MilestoneCard from '../components/MilestoneCard';
import { Award, ChevronRight } from 'lucide-react';
import { PageHeader } from '../components/navigation';

const MilestonesPage: React.FC = () => {
  const { language } = useLanguage();
  const { milestones, userMilestones, loading, claimReward } = useMilestones();

  // Count earned and claimed milestones
  const earnedCount = userMilestones.length;
  const claimedCount = userMilestones.filter(um => um.reward_claimed).length;
  
  // Group milestones by earned status
  const earnedMilestones = milestones.filter(m => 
    userMilestones.some(um => um.milestone_id === m.id)
  );
  
  const unclaimedMilestones = earnedMilestones.filter(m => 
    userMilestones.some(um => um.milestone_id === m.id && !um.reward_claimed)
  );
  
  const lockedMilestones = milestones.filter(m => 
    !userMilestones.some(um => um.milestone_id === m.id)
  );

  // Helper function to get badge image for a milestone
  const getBadgeImage = (milestoneId: string) => {
    // Map milestone IDs to badge images - in a real app, this would come from your Sanity data
    const badgeMap: Record<string, string> = {
      'milestone-first-lesson': '/badges/first-lesson.png',
      'milestone-credit-master': '/badges/credit-master.png',
      'milestone-beginner': '/badges/achievement-beginner.png',
      'milestone-intermediate': '/badges/achievement-intermediate.png',
      'milestone-advanced': '/badges/achievement-advanced.png',
    };
    
    // Return the mapped badge or a default based on milestone ID
    return badgeMap[milestoneId] || '/badges/achievement-beginner.png';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <PageHeader
        title={language === 'en' ? 'Your Milestones' : 'သင့်မှတ်တိုင်များ'}
        description={language === 'en' 
          ? 'Track your progress and earn rewards' 
          : 'သင့်တိုးတက်မှုကို ခြေရာခံပြီး ဆုလက်ဆောင်များ ရယူပါ'}
        icon={<Award className="h-6 w-6 text-blue-600" />}
      />

      {/* Progress Summary */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
          <div>
            <div className="text-3xl font-bold text-blue-600">{earnedCount}</div>
            <div className="text-sm text-gray-600">
              {language === 'en' ? 'Milestones Earned' : 'ရရှိပြီးသော မှတ်တိုင်များ'}
            </div>
          </div>
          
          <div>
            <div className="text-3xl font-bold text-green-600">{claimedCount}</div>
            <div className="text-sm text-gray-600">
              {language === 'en' ? 'Rewards Claimed' : 'ရယူပြီးသော ဆုလက်ဆောင်များ'}
            </div>
          </div>
          
          <div>
            <div className="text-3xl font-bold text-purple-600">{milestones.length - earnedCount}</div>
            <div className="text-sm text-gray-600">
              {language === 'en' ? 'Milestones Remaining' : 'ကျန်ရှိသော မှတ်တိုင်များ'}
            </div>
          </div>
        </div>
      </div>

      {/* Unclaimed Rewards Section */}
      {unclaimedMilestones.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
            <Award className="h-5 w-5 text-yellow-500 mr-2" />
            {language === 'en' ? 'Rewards to Claim' : 'ရယူရန် ဆုလက်ဆောင်များ'}
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {unclaimedMilestones.map(milestone => (
              <MilestoneCard
                key={milestone.id}
                milestone={milestone}
                userMilestone={userMilestones.find(um => um.milestone_id === milestone.id)}
                onClaimReward={claimReward}
              />
            ))}
          </div>
        </div>
      )}

      {/* Earned Milestones Section */}
      {earnedMilestones.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
            <Award className="h-5 w-5 text-blue-600 mr-2" />
            {language === 'en' ? 'Your Achievements' : 'သင့်အောင်မြင်မှုများ'}
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {earnedMilestones
              .filter(m => !unclaimedMilestones.includes(m))
              .map(milestone => (
                <MilestoneCard
                  key={milestone.id}
                  milestone={milestone}
                  userMilestone={userMilestones.find(um => um.milestone_id === milestone.id)}
                />
              ))}
          </div>
        </div>
      )}

      {/* Locked Milestones Section */}
      <div>
        <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
          <ChevronRight className="h-5 w-5 text-gray-500 mr-2" />
          {language === 'en' ? 'Upcoming Milestones' : 'လာမည့် မှတ်တိုင်များ'}
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {lockedMilestones.map(milestone => (
            <MilestoneCard
              key={milestone.id}
              milestone={milestone}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default MilestonesPage;