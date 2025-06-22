import React, { useEffect, useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { 
  Book, 
  CheckCircle, 
  GraduationCap,
  PiggyBank,
  FileText,
  Shield,
  Home,
  Users,
  ArrowRight
} from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

type Post = {
  id: string;
  title: string;
  content: string;
  category: string;
  created_at: string;
  examples?: string[];
  tips?: string[];
};

type Progress = {
  post_id: string;
  completed: boolean;
};

const KnowledgeLibrary = () => {
  const { language } = useLanguage();
  const [posts, setPosts] = useState<Post[]>([]);
  const [progress, setProgress] = useState<Record<string, boolean>>({});
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPosts();
    fetchProgress();
  }, []);

  const fetchPosts = async () => {
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching posts:', error);
      return;
    }

    setPosts(data || []);
    setLoading(false);
  };

  const fetchProgress = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from('user_progress')
      .select('post_id, completed')
      .eq('user_id', user.id);

    if (error) {
      console.error('Error fetching progress:', error);
      return;
    }

    const progressMap = (data || []).reduce((acc: Record<string, boolean>, curr: Progress) => {
      acc[curr.post_id] = curr.completed;
      return acc;
    }, {});

    setProgress(progressMap);
  };

  const markAsCompleted = async (postId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from('user_progress')
      .upsert({
        user_id: user.id,
        post_id: postId,
        completed: !progress[postId]
      }, {
        onConflict: 'user_id,post_id'
      });

    if (error) {
      console.error('Error updating progress:', error);
      return;
    }

    setProgress(prev => ({
      ...prev,
      [postId]: !prev[postId]
    }));
  };

  const categories = [
    {
      id: 'all',
      icon: Book,
      label: language === 'en' ? 'All Topics' : 'ခေါင်းစဉ်အားလုံး'
    },
    {
      id: 'basics',
      icon: GraduationCap,
      label: language === 'en' ? 'Financial Basics' : 'ငွေကြေးအခြေခံ'
    },
    {
      id: 'budgeting',
      icon: PiggyBank,
      label: language === 'en' ? 'Budgeting' : 'ဘတ်ဂျက်'
    },
    {
      id: 'credit',
      icon: FileText,
      label: language === 'en' ? 'Credit Building' : 'ခရက်ဒစ်တည်ဆောက်ခြင်း'
    },
    {
      id: 'housing',
      icon: Home,
      label: language === 'en' ? 'Housing' : 'အိမ်ရာ'
    },
    {
      id: 'protection',
      icon: Shield,
      label: language === 'en' ? 'Protection' : 'ကာကွယ်မှု'
    },
    {
      id: 'family',
      icon: Users,
      label: language === 'en' ? 'Family Planning' : 'မိသားစုစီမံကိန်း'
    }
  ];

  const filteredPosts = selectedCategory === 'all' 
    ? posts 
    : posts.filter(post => post.category === selectedCategory);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">
          {language === 'en' ? 'Financial Knowledge Library' : 'ငွေကြေးဗဟုသုတ စာကြည့်တိုက်'}
        </h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          {language === 'en'
            ? 'Explore our comprehensive guides to build your financial knowledge. Each topic includes practical examples and helpful tips.'
            : 'သင့်ငွေကြေးဗဟုသုတ တည်ဆောက်ရန် ကျွန်ုပ်တို့၏ ပြည့်စုံသော လမ်းညွှန်များကို လေ့လာပါ။ ခေါင်းစဉ်တိုင်းတွင် လက်တွေ့ဥပမာများနှင့် အသုံးဝင်သော အကြံပြုချက်များ ပါဝင်သည်။'}
        </p>
      </div>

      <div className="flex flex-wrap gap-3 justify-center">
        {categories.map(category => (
          <button
            key={category.id}
            onClick={() => setSelectedCategory(category.id)}
            className={`flex items-center px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200 ${
              selectedCategory === category.id
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <category.icon className="h-4 w-4 mr-2" />
            {category.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredPosts.map(post => (
          <div
            key={post.id}
            className={`bg-white rounded-lg border p-6 transition-all duration-200 ${
              progress[post.id] ? 'border-green-200 bg-green-50' : 'border-gray-200 hover:border-blue-200'
            }`}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start space-x-3">
                <Book className="w-6 h-6 text-blue-600 mt-1" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">{post.title}</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    {categories.find(c => c.id === post.category)?.label}
                  </p>
                </div>
              </div>
              <button
                onClick={() => markAsCompleted(post.id)}
                className={`flex items-center space-x-1 px-3 py-1 rounded-full text-sm transition-colors duration-200 ${
                  progress[post.id]
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <CheckCircle className="w-4 h-4" />
                <span>
                  {progress[post.id]
                    ? (language === 'en' ? 'Completed' : 'ပြီးဆုံး')
                    : (language === 'en' ? 'Mark as Read' : 'ဖတ်ပြီးအဖြစ် မှတ်သားရန်')}
                </span>
              </button>
            </div>

            <p className="text-gray-600 leading-relaxed mb-4">{post.content}</p>

            {post.examples && post.examples.length > 0 && (
              <div className="space-y-3 mt-4">
                <h4 className="font-medium text-gray-800">
                  {language === 'en' ? 'Examples:' : 'ဥပမာများ-'}
                </h4>
                {post.examples.map((example, index) => (
                  <div key={index} className="bg-white p-3 rounded-md border border-gray-200">
                    <p className="text-gray-600 text-sm">{example}</p>
                  </div>
                ))}
              </div>
            )}

            {post.tips && post.tips.length > 0 && (
              <div className="space-y-2 mt-4">
                <h4 className="font-medium text-gray-800">
                  {language === 'en' ? 'Quick Tips:' : 'အမြန်အကြံပြုချက်များ-'}
                </h4>
                {post.tips.map((tip, index) => (
                  <div key={index} className="flex items-start">
                    <ArrowRight className="h-4 w-4 text-blue-600 mt-1 mr-2" />
                    <p className="text-gray-600 text-sm">{tip}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default KnowledgeLibrary;