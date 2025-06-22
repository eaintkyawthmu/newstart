import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import { CheckCircle, ArrowLeft, ExternalLink } from 'lucide-react';

type StepProgress = {
  status: 'pending' | 'in-progress' | 'completed';
  completed_tasks: string[];
};

const JourneyStepDetail = () => {
  const { stepId } = useParams();
  const { language } = useLanguage();
  const navigate = useNavigate();
  const [progress, setProgress] = useState<StepProgress>({
    status: 'pending',
    completed_tasks: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProgress();
  }, [stepId]);

  const fetchProgress = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('journey_progress')
        .select('*')
        .eq('user_id', user.id)
        .eq('step_id', stepId)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setProgress(data);
      }
    } catch (error) {
      console.error('Error fetching progress:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateTaskStatus = async (taskId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const newCompletedTasks = progress.completed_tasks.includes(taskId)
        ? progress.completed_tasks.filter(t => t !== taskId)
        : [...progress.completed_tasks, taskId];

      const newStatus = newCompletedTasks.length === 0 
        ? 'pending' 
        : newCompletedTasks.length === tasks.length 
          ? 'completed' 
          : 'in-progress';

      const { error } = await supabase
        .from('journey_progress')
        .upsert({
          user_id: user.id,
          step_id: parseInt(stepId!),
          status: newStatus,
          completed_tasks: newCompletedTasks,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id,step_id'
        });

      if (error) throw error;

      setProgress({
        ...progress,
        status: newStatus,
        completed_tasks: newCompletedTasks
      });
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  // This would normally come from a database or content management system
  const tasks = [
    {
      id: 'task1',
      title: language === 'en' ? 'Read the guide' : 'လမ်းညွှန်ကို ဖတ်ပါ',
      description: language === 'en' 
        ? 'Understand the key concepts and requirements'
        : 'အဓိက သဘောတရားများနှင့် လိုအပ်ချက်များကို နားလည်ပါ'
    },
    {
      id: 'task2',
      title: language === 'en' ? 'Complete checklist' : 'စစ်ဆေးရန်စာရင်း ပြီးစီးအောင်လုပ်ပါ',
      description: language === 'en'
        ? 'Go through all required steps'
        : 'လိုအပ်သော အဆင့်များအားလုံးကို လုပ်ဆောင်ပါ'
    },
    {
      id: 'task3',
      title: language === 'en' ? 'Review resources' : 'အရင်းအမြစ်များကို ပြန်လည်သုံးသပ်ပါ',
      description: language === 'en'
        ? 'Check additional materials and links'
        : 'ထပ်ဆောင်း အထောက်အကူပြုပစ္စည်းများနှင့် လင့်များကို စစ်ဆေးပါ'
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <button
        onClick={() => navigate('/journey')}
        className="flex items-center text-gray-600 hover:text-gray-800"
      >
        <ArrowLeft className="h-5 w-5 mr-2" />
        {language === 'en' ? 'Back to Journey Hub' : 'ခရီးစဉ်စင်တာသို့ ပြန်သွားရန်'}
      </button>

      <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">
          {language === 'en' ? `Step ${stepId}` : `အဆင့် ${stepId}`}
        </h1>

        <div className="space-y-6">
          {tasks.map((task) => (
            <div 
              key={task.id}
              className={`p-4 rounded-lg border ${
                progress.completed_tasks.includes(task.id)
                  ? 'bg-green-50 border-green-200'
                  : 'bg-gray-50 border-gray-200'
              }`}
            >
              <div className="flex items-start">
                <button
                  onClick={() => updateTaskStatus(task.id)}
                  className={`flex-shrink-0 w-6 h-6 mt-1 mr-3 rounded-full border-2 flex items-center justify-center ${
                    progress.completed_tasks.includes(task.id)
                      ? 'bg-green-500 border-green-500 text-white'
                      : 'border-gray-300 hover:border-blue-500'
                  }`}
                >
                  {progress.completed_tasks.includes(task.id) && (
                    <CheckCircle className="h-4 w-4" />
                  )}
                </button>
                <div>
                  <h3 className="text-lg font-medium text-gray-800">{task.title}</h3>
                  <p className="text-gray-600 mt-1">{task.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-800 mb-2">
            {language === 'en' ? 'Helpful Resources' : 'အကူအညီဖြစ်စေမည့် အရင်းအမြစ်များ'}
          </h3>
          <div className="space-y-2">
            <a
              href="#"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center text-blue-600 hover:text-blue-800"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              {language === 'en' ? 'Official Documentation' : 'တရားဝင် စာရွက်စာတမ်းများ'}
            </a>
            <a
              href="#"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center text-blue-600 hover:text-blue-800"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              {language === 'en' ? 'Video Tutorial' : 'ဗီဒီယိုသင်ခန်းစာ'}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JourneyStepDetail;