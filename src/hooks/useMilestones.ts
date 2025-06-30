import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabaseClient';
import { Milestone, UserMilestone, MilestoneRequirement } from '../types/milestone';
import { useToast } from '../contexts/ToastContext';
import { sanityClient } from '../lib/sanityClient';

export const useMilestones = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [userMilestones, setUserMilestones] = useState<UserMilestone[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchMilestones();
      fetchUserMilestones();
    } else {
      setMilestones([]);
      setUserMilestones([]);
      setLoading(false);
    }
  }, [user]);

  const fetchMilestones = async () => {
    try {
      setLoading(true);
      
      // For demo purposes, we'll create some example milestones
      // In a real app, you would fetch these from Sanity
      const exampleMilestones: Milestone[] = [
        // Getting Started Milestones
        {
          id: 'milestone-first-login',
          _id: 'milestone-first-login',
          title: 'Welcome to America',
          description: 'You\'ve taken your first step on your journey in the US!',
          requirements: [
            { type: 'profile_complete', count: 1 }
          ],
          reward: {
            type: 'badge',
            description: 'Welcome Badge'
          }
        },
        {
          id: 'milestone-profile-complete',
          _id: 'milestone-profile-complete',
          title: 'Identity Established',
          description: 'You\'ve completed your profile and are ready to start your journey.',
          requirements: [
            { type: 'profile_complete', count: 1 }
          ],
          reward: {
            type: 'badge',
            description: 'Profile Completion Badge'
          }
        },
        {
          id: 'milestone-first-lesson',
          _id: 'milestone-first-lesson',
          title: 'First Steps',
          description: 'You completed your first lesson! Keep going to learn more.',
          requirements: [
            { type: 'lesson', count: 1 }
          ],
          reward: {
            type: 'badge',
            description: 'First Lesson Badge'
          }
        },
        
        // Documentation Milestones
        {
          id: 'milestone-documentation-master',
          _id: 'milestone-documentation-master',
          title: 'Documentation Master',
          description: 'You\'ve learned how to navigate the essential US documentation system.',
          requirements: [
            { type: 'tasks', count: 3 }
          ],
          reward: {
            type: 'badge',
            description: 'Documentation Master Badge'
          }
        },
        {
          id: 'milestone-ssn-expert',
          _id: 'milestone-ssn-expert',
          title: 'SSN Navigator',
          description: 'You\'ve mastered the process of obtaining a Social Security Number.',
          requirements: [
            { type: 'tasks_completed_in_step', count: 2 }
          ],
          reward: {
            type: 'badge',
            description: 'SSN Expert Badge'
          }
        },
        
        // Banking & Credit Milestones
        {
          id: 'milestone-banking-basics',
          _id: 'milestone-banking-basics',
          title: 'Banking Basics',
          description: 'You\'ve learned the fundamentals of the US banking system.',
          requirements: [
            { type: 'lesson', count: 3 }
          ],
          reward: {
            type: 'badge',
            description: 'Banking Basics Badge'
          }
        },
        {
          id: 'milestone-credit-master',
          _id: 'milestone-credit-master',
          title: 'Credit Builder',
          description: 'You\'ve mastered the basics of credit building in America.',
          requirements: [
            { type: 'lesson', count: 5 }
          ],
          reward: {
            type: 'badge',
            description: 'Credit Master Badge'
          }
        },
        
        // Housing Milestones
        {
          id: 'milestone-housing-expert',
          _id: 'milestone-housing-expert',
          title: 'Housing Navigator',
          description: 'You\'ve learned how to find and secure housing in the US.',
          requirements: [
            { type: 'lesson', count: 3 }
          ],
          reward: {
            type: 'badge',
            description: 'Housing Expert Badge'
          }
        },
        {
          id: 'milestone-utilities-master',
          _id: 'milestone-utilities-master',
          title: 'Utilities Master',
          description: 'You understand how to set up and manage essential utilities.',
          requirements: [
            { type: 'tasks', count: 3 }
          ],
          reward: {
            type: 'badge',
            description: 'Utilities Master Badge'
          }
        },
        
        // Tax & Employment Milestones
        {
          id: 'milestone-tax-basics',
          _id: 'milestone-tax-basics',
          title: 'Tax Navigator',
          description: 'You\'ve learned the basics of the US tax system.',
          requirements: [
            { type: 'lesson', count: 3 }
          ],
          reward: {
            type: 'badge',
            description: 'Tax Basics Badge'
          }
        },
        {
          id: 'milestone-employment-ready',
          _id: 'milestone-employment-ready',
          title: 'Employment Ready',
          description: 'You\'re prepared to enter the US job market with confidence.',
          requirements: [
            { type: 'lesson', count: 5 }
          ],
          reward: {
            type: 'badge',
            description: 'Employment Ready Badge'
          }
        },
        
        // Insurance & Healthcare Milestones
        {
          id: 'milestone-health-insurance',
          _id: 'milestone-health-insurance',
          title: 'Healthcare Navigator',
          description: 'You understand the US healthcare system and insurance options.',
          requirements: [
            { type: 'lesson', count: 3 }
          ],
          reward: {
            type: 'badge',
            description: 'Healthcare Navigator Badge'
          }
        },
        {
          id: 'milestone-insurance-expert',
          _id: 'milestone-insurance-expert',
          title: 'Insurance Expert',
          description: 'You\'ve mastered the different types of insurance needed in the US.',
          requirements: [
            { type: 'lesson', count: 5 }
          ],
          reward: {
            type: 'badge',
            description: 'Insurance Expert Badge'
          }
        },
        
        // Education & Family Milestones
        {
          id: 'milestone-education-navigator',
          _id: 'milestone-education-navigator',
          title: 'Education Pathfinder',
          description: 'You understand the US education system and opportunities.',
          requirements: [
            { type: 'lesson', count: 3 }
          ],
          reward: {
            type: 'badge',
            description: 'Education Navigator Badge'
          }
        },
        {
          id: 'milestone-family-planner',
          _id: 'milestone-family-planner',
          title: 'Family Planner',
          description: 'You\'ve learned how to plan for your family\'s future in the US.',
          requirements: [
            { type: 'lesson', count: 3 }
          ],
          reward: {
            type: 'badge',
            description: 'Family Planner Badge'
          }
        },
        
        // Progress Milestones
        {
          id: 'milestone-beginner',
          _id: 'milestone-beginner',
          title: 'Financial Beginner',
          description: 'You\'ve taken your first steps toward financial literacy.',
          requirements: [
            { type: 'lesson', count: 5 }
          ],
          reward: {
            type: 'badge',
            description: 'Beginner Badge'
          }
        },
        {
          id: 'milestone-intermediate',
          _id: 'milestone-intermediate',
          title: 'Financial Intermediate',
          description: 'You\'re making great progress in your financial journey!',
          requirements: [
            { type: 'lesson', count: 10 }
          ],
          reward: {
            type: 'badge',
            description: 'Intermediate Badge'
          }
        },
        {
          id: 'milestone-advanced',
          _id: 'milestone-advanced',
          title: 'Financial Expert',
          description: 'You\'ve become an expert in personal finance!',
          requirements: [
            { type: 'lesson', count: 20 }
          ],
          reward: {
            type: 'badge',
            description: 'Expert Badge'
          }
        },
        
        // Community Milestones
        {
          id: 'milestone-community-member',
          _id: 'milestone-community-member',
          title: 'Community Member',
          description: 'You\'ve connected with the immigrant community in the US.',
          requirements: [
            { type: 'tasks', count: 2 }
          ],
          reward: {
            type: 'badge',
            description: 'Community Member Badge'
          }
        },
        {
          id: 'milestone-cultural-navigator',
          _id: 'milestone-cultural-navigator',
          title: 'Cultural Navigator',
          description: 'You\'ve learned to navigate cultural differences in the US.',
          requirements: [
            { type: 'lesson', count: 3 }
          ],
          reward: {
            type: 'badge',
            description: 'Cultural Navigator Badge'
          }
        }
      ];
      
      setMilestones(exampleMilestones);
      
      // In a real implementation, you would fetch from Sanity like this:
      /*
      // Fetch milestones from Sanity
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
          reward {
            type,
            description,
            "image": image.asset->{
              url
            }
          }
        }
      `;
      
      const sanityMilestones = await sanityClient.fetch(query);
      
      // Transform Sanity milestones to our Milestone interface
      const transformedMilestones: Milestone[] = sanityMilestones.map((m: any) => ({
        id: m._id,
        _id: m._id,
        title: m.title,
        description: Array.isArray(m.description) && m.description.length > 0 
          ? m.description[0].children[0].text 
          : 'Complete this milestone to earn a reward',
        requirements: m.requirements || [],
        reward: m.reward
      }));
      
      setMilestones(transformedMilestones);
      */
    } catch (error) {
      console.error('Error fetching milestones:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserMilestones = async () => {
    try {
      const { data, error } = await supabase
        .from('user_milestones')
        .select('*')
        .eq('user_id', user?.id);

      if (error) throw error;
      setUserMilestones(data || []);
    } catch (error) {
      console.error('Error fetching user milestones:', error);
    }
  };

  const checkAndAwardMilestones = async (
    type: 'lesson' | 'course' | 'task' | 'streak',
    id?: string
  ) => {
    if (!user) return;

    try {
      // Refresh user milestones first to ensure we have the latest data
      await fetchUserMilestones();
      
      // Get current progress data
      const { data: progressData, error: progressError } = await supabase
        .from('course_progress')
        .select('lesson_id')
        .eq('user_id', user.id)
        .eq('completed', true);

      if (progressError) throw progressError;

      const completedLessonsCount = progressData?.length || 0;
      const completedLessonIds = progressData?.map(p => p.lesson_id) || [];

      // Check each milestone to see if it should be awarded
      for (const milestone of milestones) {
        // Skip if already earned (check against the refreshed userMilestones)
        const alreadyEarned = userMilestones.some(um => um.milestone_id === milestone.id);
        if (alreadyEarned) continue;

        // Check if requirements are met
        let requirementsMet = true;
        
        for (const req of milestone.requirements) {
          if (req.type === 'lesson' && req.count > completedLessonsCount) {
            requirementsMet = false;
            break;
          }
          
          // Check for specific lesson completion
          if (req.type === 'lesson' && req.reference && req.reference._ref) {
            const specificLessonId = req.reference._ref;
            if (!completedLessonIds.includes(specificLessonId)) {
              requirementsMet = false;
              break;
            }
          }
          
          if (req.type === 'path' && req.reference && req.reference._ref) {
            // This would require more complex logic to check if all lessons in a path are completed
            // For now, we'll just check if the specific path is the one being completed
            if (type === 'course' && id !== req.reference._ref) {
              requirementsMet = false;
              break;
            }
          }
          
          if (req.type === 'tasks') {
            // This would require checking task completion across lessons
            // For simplicity, we'll just use the count as a threshold for completed lessons
            if (completedLessonsCount < req.count) {
              requirementsMet = false;
              break;
            }
          }
          
          if (req.type === 'quiz') {
            // This would require checking quiz completion and scores
            // For now, we'll just check if the specific quiz lesson is completed
            if (req.reference && req.reference._ref && type === 'lesson' && id !== req.reference._ref) {
              requirementsMet = false;
              break;
            }
          }
        }

        // Award the milestone if requirements are met
        if (requirementsMet) {
          await awardMilestone(milestone);
          break; // Only award one milestone at a time
        }
      }
    } catch (error) {
      console.error('Error checking milestones:', error);
    }
  };

  const awardMilestone = async (milestone: Milestone) => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('user_milestones')
        .insert({
          user_id: user.id,
          milestone_id: milestone.id,
          earned_at: new Date().toISOString(),
          reward_claimed: false
        });
        
      if (error) {
        // Check if this is a duplicate key error (milestone already awarded)
        if (error.code === '23505') {
          console.log(`Milestone "${milestone.title}" was already awarded to user ${user.id}`);
          return; // Don't show error toast for already-awarded milestones
        }
        throw error;
      }
      
      // Show toast notification
      showToast('success', `You've earned the "${milestone.title}" milestone!`);
      
      // Refresh earned milestones
      fetchUserMilestones();
    } catch (error) {
      console.error('Error awarding milestone:', error);
    }
  };

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
      
      // Refresh milestones
      fetchUserMilestones();
      
      // Show toast notification
      showToast('success', 'Reward claimed successfully!');
    } catch (error) {
      console.error('Error claiming reward:', error);
      showToast('error', 'Failed to claim reward. Please try again.');
    }
  };

  // Get badge image for this milestone
  const getBadgeImage = (milestoneId: string) => {
    // Map milestone IDs to badge images with the new naming convention
    const badgeMap: Record<string, string> = {
      'milestone-first-login': '/badges/1-milestone.png',
      'milestone-profile-complete': '/badges/2-milestone.png',
      'milestone-first-lesson': '/badges/3-milestone.png',
      'milestone-documentation-master': '/badges/4-milestone.png',
      'milestone-ssn-expert': '/badges/5-milestone.png',
      'milestone-banking-basics': '/badges/6-milestone.png',
      'milestone-credit-master': '/badges/7-milestone.png',
      'milestone-housing-expert': '/badges/8-milestone.png',
      'milestone-utilities-master': '/badges/9-milestone.png',
      'milestone-tax-basics': '/badges/10-milestone.png',
      'milestone-employment-ready': '/badges/11-milestone.png',
      'milestone-health-insurance': '/badges/12-milestone.png',
      'milestone-insurance-expert': '/badges/13-milestone.png',
      'milestone-education-navigator': '/badges/14-milestone.png',
      'milestone-family-planner': '/badges/15-milestone.png',
      'milestone-beginner': '/badges/16-milestone.png',
      'milestone-intermediate': '/badges/17-milestone.png',
      'milestone-advanced': '/badges/18-milestone.png',
      'milestone-community-member': '/badges/19-milestone.png',
      'milestone-cultural-navigator': '/badges/20-milestone.png'
    };
    
    // Return the mapped badge or a default
    return badgeMap[milestoneId] || '/badges/1-milestone.png';
  };

  return {
    milestones,
    userMilestones,
    loading,
    checkAndAwardMilestones,
    claimReward,
    refreshMilestones: fetchUserMilestones,
    getBadgeImage
  };
};