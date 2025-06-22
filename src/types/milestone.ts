export interface MilestoneRequirement {
  type: 'lesson' | 'path' | 'tasks' | 'quiz';
  count: number;
  reference?: {
    _ref: string;
  };
}

export interface MilestoneReward {
  type: 'badge' | 'certificate' | 'content';
  description?: string;
  image?: {
    asset: {
      url: string;
    };
  };
}

export interface Milestone {
  id: string;
  _id: string;
  title: string;
  description: string;
  requirements: MilestoneRequirement[];
  reward?: MilestoneReward;
}

export interface UserMilestone {
  id: string;
  user_id: string;
  milestone_id: string;
  earned_at: string;
  reward_claimed: boolean;
  reward_claimed_at: string | null;
}