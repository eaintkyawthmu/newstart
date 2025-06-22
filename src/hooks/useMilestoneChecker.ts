import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabaseClient';
import { sanityClient } from '../lib/sanityClient';
import { useToast } from '../contexts/ToastContext';
import { useNavigate } from 'react-router-dom';

interface MilestoneRequirement {
  type: 'lessons_completed' | 'modules_completed' | 'course_completed' | 'profile_complete' | 'tasks_completed_in_step';
  count: number;
  reference?: {
    _ref: string;
  };
}

interface Reward {
  _id: string;
  name: string;
  description?: string;
  image?: {
    asset: {
      url: string;
    };
  };
  type: 'badge' | 'sticker' | 'points';
}

export interface Milestone {
  _id: string;
  title: string;
  description?: string;
  requirements: MilestoneRequirement[];
  reward?: Reward;
}

interface UserMilestone {
  id: string;
  user_id: string;
  milestone_id: string;
  earned_at: string;
  reward_claimed: boolean;
  reward_claimed_at: string | null;
}

export const useMilestoneChecker = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [earnedMilestones, setEarnedMilestones] = useState<UserMilestone[]>([]);
  const [newlyEarnedMilestone, setNewlyEarnedMilestone] = useState<Milestone | null>(null);

  // Fetch all milestones from Sanity
  const fetchMilestones = async () => {
    try {
      const query = `
        *[_type == "progressMilestone"] {
          _id,
          title,
          description,
          requirements[] {
            type,
            count,
            reference
          },
          "reward": reward->{
            _id,
            name,
            description,
            "image": image.asset->{
              url
            },
            type
          }
        }
      `;
      
      const data = await sanityClient.fetch(query);
      setMilestones(data);
    } catch (error) {
      console.error('Error fetching milestones:', error);
    }
  };

  // Fetch user's earned milestones from Supabase
  const fetchEarnedMilestones = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('user_milestones')
        .select('*')
        .eq('user_id', user.id);
        
      if (error) throw error;
      setEarnedMilestones(data || []);
    } catch (error) {
      console.error('Error fetching earned milestones:', error);
    }
  };

  // Check if user has earned any new milestones
  const checkMilestones = async () => {
    if (!user || milestones.length === 0) return;
    
    setLoading(true);
    
    try {
      // Get user's progress data
      const { data: courseProgress, error: courseError } = await supabase
        .from('course_progress')
        .select('course_id, lesson_id, completed, completed_lesson_tasks')
        .eq('user_id', user.id);
        
      if (courseError) throw courseError;
      
      const { data: journeyProgress, error: journeyError } = await supabase
        .from('journey_progress')
        .select('step_id, status, completed_tasks')
        .eq('user_id', user.id);
        
      if (journeyError) throw journeyError;
      
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
        
      if (profileError) throw profileError;
      
      // Get already earned milestone IDs
      const earnedMilestoneIds = earnedMilestones.map(m => m.milestone_id);
      
      // Check each milestone to see if requirements are met
      for (const milestone of milestones) {
        // Skip if already earned
        if (earnedMilestoneIds.includes(milestone._id)) continue;
        
        let allRequirementsMet = true;
        
        for (const requirement of milestone.requirements) {
          let requirementMet = false;
          
          switch (requirement.type) {
            case 'lessons_completed':
              const completedLessons = courseProgress?.filter(p => p.completed) || [];
              requirementMet = completedLessons.length >= requirement.count;
              
              // If there's a specific reference, check only lessons from that course/module
              if (requirement.reference && requirement.reference._ref) {
                // This would need more complex logic to filter by course/module
                // For now, we'll just check the total count
              }
              break;
              
            case 'modules_completed':
              // Group lessons by module and check if any modules are complete
              // This would require additional data about which lessons belong to which modules
              // For now, we'll just use a placeholder
              requirementMet = false;
              break;
              
            case 'course_completed':
              // Check if a specific course is completed
              // This would require additional logic to determine course completion
              // For now, we'll just use a placeholder
              requirementMet = false;
              break;
              
            case 'profile_complete':
              // Check if user profile is complete (has all required fields)
              const requiredFields = ['first_name', 'last_name', 'country_of_origin', 'zip_code'];
              requirementMet = requiredFields.every(field => !!profile[field]);
              break;
              
            case 'tasks_completed_in_step':
              // Check if user has completed tasks in a specific step
              if (requirement.reference && requirement.reference._ref) {
                const stepId = parseInt(requirement.reference._ref.split('-')[1]);
                const step = journeyProgress?.find(p => p.step_id === stepId);
                requirementMet = step?.completed_tasks?.length >= requirement.count;
              } else {
                // If no specific step, check total tasks completed across all steps
                const totalTasks = journeyProgress?.reduce((sum, step) => sum + (step.completed_tasks?.length || 0), 0) || 0;
                requirementMet = totalTasks >= requirement.count;
              }
              break;
          }
          
          if (!requirementMet) {
            allRequirementsMet = false;
            break;
          }
        }
        
        // If all requirements are met, award the milestone
        if (allRequirementsMet) {
          await awardMilestone(milestone);
          break; // Only award one milestone at a time to avoid overwhelming the user
        }
      }
    } catch (error) {
      console.error('Error checking milestones:', error);
    } finally {
      setLoading(false);
    }
  };

  // Award a milestone to the user
  const awardMilestone = async (milestone: Milestone) => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('user_milestones')
        .insert({
          user_id: user.id,
          milestone_id: milestone._id,
          earned_at: new Date().toISOString(),
          reward_claimed: false
        });
        
      if (error) throw error;
      
      // Show toast notification
      showToast('success', `You've earned the "${milestone.title}" milestone!`);
      
      // Set newly earned milestone for potential UI updates
      setNewlyEarnedMilestone(milestone);
      
      // Refresh earned milestones
      fetchEarnedMilestones();
    } catch (error) {
      console.error('Error awarding milestone:', error);
    }
  };

  // Claim a milestone reward
  const claimReward = async (milestoneId: string) => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('user_milestones')
        .update({
          reward_claimed: true,
          reward_claimed_at: new Date().toISOString()
        })
        .eq('user_id', user.id)
        .eq('milestone_id', milestoneId);
        
      if (error) throw error;
      
      // Refresh earned milestones
      fetchEarnedMilestones();
      
      // Show toast notification
      showToast('success', 'Reward claimed successfully!');
    } catch (error) {
      console.error('Error claiming reward:', error);
      showToast('error', 'Failed to claim reward. Please try again.');
    }
  };

  // Navigate to rewards page to view newly earned milestone
  const viewNewMilestone = () => {
    navigate('/rewards');
    setNewlyEarnedMilestone(null);
  };

  // Initialize by fetching milestones and earned milestones
  useEffect(() => {
    if (user) {
      fetchMilestones();
      fetchEarnedMilestones();
    }
  }, [user]);

  return {
    loading,
    milestones,
    earnedMilestones,
    newlyEarnedMilestone,
    checkMilestones,
    claimReward,
    viewNewMilestone,
    refreshMilestones: fetchEarnedMilestones
  };
};