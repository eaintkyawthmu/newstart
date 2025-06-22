import React, { useEffect, useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useMilestoneChecker, Milestone } from '../hooks/useMilestoneChecker';
import { PageHeader } from '../components/navigation';
import { 
  Award, 
  Star, 
  Lock, 
  CheckCircle, 
  Gift, 
  Calendar, 
  Clock,
  Trophy,
  Medal,
  Crown,
  Target,
  Sparkles
} from 'lucide-react';

const RewardsPage: React.FC = () => {
  const { language } = useLanguage();
  const { 
    milestones, 
    earnedMilestones, 
    loading, 
    claimReward, 
    refreshMilestones 
  } = useMilestoneChecker();
  const [selectedMilestone, setSelectedMilestone] = useState<Milestone | null>(null);

  useEffect(() => {
    // Refresh milestones when the page loads
    refreshMilestones();
  }, []);

  // Get earned milestone IDs for easy checking
  const earnedMilestoneIds = earnedMilestones.map(m => m.milestone_id);

  // Group milestones by category (using reward type as a proxy for category)
  const groupedMilestones = milestones.reduce((groups, milestone) => {
    const category = milestone.reward?.type || 'badge';
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(milestone);
    return groups;
  }, {} as Record<string, Milestone[]>);

  // Get a random icon for each milestone
  const getMilestoneIcon = (index: number) => {
    const icons = [Award, Trophy, Medal, Star, Crown, Target, Sparkles];
    return icons[index % icons.length];
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Handle claiming a reward
  const handleClaimReward = (milestoneId: string) => {
    claimReward(milestoneId);
  };

  // Find if a milestone is earned
  const findEarnedMilestone = (milestoneId: string) => {
    return earnedMilestones.find(m => m.milestone_id === milestoneId);
  };

  if (loading && milestones.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <PageHeader
        title={language === 'en' ? 'Your Achievements' : 'သင့်အောင်မြင်မှုများ'}
        description={language === 'en' 
          ? 'Track your progress and collect rewards as you learn'
          : 'သင်လေ့လာသည့်အခါ သင့်တိုးတက်မှုကို ခြေရာခံပြီး ဆုလာဘ်များ စုဆောင်းပါ'}
        icon={<Award className="h-6 w-6 text-blue-600" />}
      />

      {/* Milestone Detail Modal */}
      {selectedMilestone && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="text-center mb-6">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                {selectedMilestone.reward?.image?.asset?.url ? (
                  <img 
                    src={selectedMilestone.reward.image.asset.url} 
                    alt={selectedMilestone.reward.name} 
                    className="w-16 h-16 object-contain"
                  />
                ) : (
                  <Award className="h-10 w-10 text-blue-600" />
                )}
              </div>
              <h2 className="text-xl font-bold text-gray-800">{selectedMilestone.title}</h2>
              {selectedMilestone.description && (
                <p className="text-gray-600 mt-2">{selectedMilestone.description}</p>
              )}
            </div>

            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-medium text-gray-800 mb-2">Requirements</h3>
                <ul className="space-y-2">
                  {selectedMilestone.requirements.map((req, index) => (
                    <li key={index} className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">
                        {req.type === 'lessons_completed' && `Complete ${req.count} lessons`}
                        {req.type === 'modules_completed' && `Complete ${req.count} modules`}
                        {req.type === 'course_completed' && `Complete the course`}
                        {req.type === 'profile_complete' && `Complete your profile`}
                        {req.type === 'tasks_completed_in_step' && `Complete ${req.count} tasks in a step`}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              {selectedMilestone.reward && (
                <div className="bg-purple-50 rounded-lg p-4">
                  <h3 className="font-medium text-purple-800 mb-2">Reward</h3>
                  <div className="flex items-center">
                    <Gift className="h-5 w-5 text-purple-600 mr-2" />
                    <span className="text-purple-700">{selectedMilestone.reward.name}</span>
                  </div>
                  {selectedMilestone.reward.description && (
                    <p className="text-purple-600 text-sm mt-2">{selectedMilestone.reward.description}</p>
                  )}
                </div>
              )}

              {earnedMilestoneIds.includes(selectedMilestone._id) && (
                <div className="bg-green-50 rounded-lg p-4">
                  <h3 className="font-medium text-green-800 mb-2">Status</h3>
                  <div className="flex items-center">
                    <Calendar className="h-5 w-5 text-green-600 mr-2" />
                    <span className="text-green-700">
                      Earned on {formatDate(findEarnedMilestone(selectedMilestone._id)?.earned_at || '')}
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-between">
              <button
                onClick={() => setSelectedMilestone(null)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Close
              </button>
              
              {earnedMilestoneIds.includes(selectedMilestone._id) && (
                <button
                  onClick={() => handleClaimReward(selectedMilestone._id)}
                  disabled={findEarnedMilestone(selectedMilestone._id)?.reward_claimed}
                  className={`px-4 py-2 rounded-lg ${
                    findEarnedMilestone(selectedMilestone._id)?.reward_claimed
                      ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                      : 'bg-purple-600 text-white hover:bg-purple-700'
                  }`}
                >
                  {findEarnedMilestone(selectedMilestone._id)?.reward_claimed
                    ? 'Reward Claimed'
                    : 'Claim Reward'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="space-y-8">
        {/* Earned Milestones Section */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
            <Trophy className="h-6 w-6 text-yellow-500 mr-2" />
            {language === 'en' ? 'Your Achievements' : 'သင့်အောင်မြင်မှုများ'}
          </h2>

          {earnedMilestones.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-800 mb-2">
                {language === 'en' ? 'No achievements yet' : 'အောင်မြင်မှုများ မရှိသေးပါ'}
              </h3>
              <p className="text-gray-600 max-w-md mx-auto">
                {language === 'en'
                  ? 'Complete lessons and tasks to earn your first achievement!'
                  : 'သင့်ပထမဆုံး အောင်မြင်မှုကို ရရှိရန် သင်ခန်းစာများနှင့် လုပ်ငန်းတာဝန်များကို ပြီးဆုံးအောင် လုပ်ဆောင်ပါ!'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {earnedMilestones.map((earned) => {
                const milestone = milestones.find(m => m._id === earned.milestone_id);
                if (!milestone) return null;
                
                const MilestoneIcon = getMilestoneIcon(milestones.indexOf(milestone));
                
                return (
                  <div 
                    key={earned.id}
                    onClick={() => setSelectedMilestone(milestone)}
                    className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                  >
                    <div className="flex flex-col items-center text-center">
                      <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-3">
                        {milestone.reward?.image?.asset?.url ? (
                          <img 
                            src={milestone.reward.image.asset.url} 
                            alt={milestone.reward.name} 
                            className="w-12 h-12 object-contain"
                          />
                        ) : (
                          <MilestoneIcon className="h-8 w-8 text-blue-600" />
                        )}
                      </div>
                      <h3 className="font-medium text-gray-800 mb-1">{milestone.title}</h3>
                      <div className="flex items-center text-xs text-gray-500">
                        <Calendar className="h-3 w-3 mr-1" />
                        <span>{formatDate(earned.earned_at)}</span>
                      </div>
                      {earned.reward_claimed ? (
                        <span className="mt-2 px-2 py-0.5 bg-green-100 text-green-800 text-xs rounded-full">
                          Claimed
                        </span>
                      ) : (
                        <span className="mt-2 px-2 py-0.5 bg-blue-100 text-blue-800 text-xs rounded-full">
                          Reward Available
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Available Milestones Section */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
            <Target className="h-6 w-6 text-blue-600 mr-2" />
            {language === 'en' ? 'Available Achievements' : 'ရရှိနိုင်သော အောင်မြင်မှုများ'}
          </h2>

          {Object.entries(groupedMilestones).map(([category, categoryMilestones]) => (
            <div key={category} className="mb-8">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 capitalize">
                {category === 'badge' ? (language === 'en' ? 'Badges' : 'တံဆိပ်များ') : 
                 category === 'sticker' ? (language === 'en' ? 'Stickers' : 'စတစ်ကာများ') : 
                 category}
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {categoryMilestones.map((milestone, index) => {
                  const isEarned = earnedMilestoneIds.includes(milestone._id);
                  const MilestoneIcon = getMilestoneIcon(index);
                  
                  return (
                    <div 
                      key={milestone._id}
                      onClick={() => setSelectedMilestone(milestone)}
                      className={`bg-white border rounded-lg p-4 transition-all cursor-pointer ${
                        isEarned 
                          ? 'border-green-200 hover:shadow-md' 
                          : 'border-gray-200 hover:border-blue-200 hover:shadow-sm'
                      }`}
                    >
                      <div className="flex flex-col items-center text-center">
                        <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-3 ${
                          isEarned ? 'bg-green-100' : 'bg-gray-100'
                        }`}>
                          {isEarned ? (
                            milestone.reward?.image?.asset?.url ? (
                              <img 
                                src={milestone.reward.image.asset.url} 
                                alt={milestone.reward.name} 
                                className="w-12 h-12 object-contain"
                              />
                            ) : (
                              <MilestoneIcon className="h-8 w-8 text-green-600" />
                            )
                          ) : (
                            <Lock className="h-6 w-6 text-gray-400" />
                          )}
                        </div>
                        <h3 className={`font-medium mb-1 ${isEarned ? 'text-gray-800' : 'text-gray-600'}`}>
                          {milestone.title}
                        </h3>
                        {isEarned ? (
                          <span className="text-xs text-green-600 flex items-center">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Earned
                          </span>
                        ) : (
                          <button className="mt-2 text-xs text-blue-600 hover:text-blue-700">
                            View Requirements
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RewardsPage;