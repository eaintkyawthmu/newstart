import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useReflections } from '../hooks/useReflections';
import { useSEO } from '../hooks/useSEO';
import { PageHeader } from '../components/navigation';
import { 
  Heart, 
  Calendar, 
  Search, 
  Filter, 
  BookOpen,
  Clock,
  Edit3,
  Trash2,
  Eye,
  EyeOff
} from 'lucide-react';
import { useToast } from '../contexts/ToastContext';

const ReflectionsPage: React.FC = () => {
  const { language } = useLanguage();
  const { reflections, loading, deleteReflection } = useReflections();
  const { showToast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'longest'>('newest');
  const [expandedReflection, setExpandedReflection] = useState<string | null>(null);

  // SEO optimization
  useSEO({
    title: 'My Reflections - Personal Growth Journey',
    description: 'View and manage your personal reflections and thoughts from your learning journey.',
    keywords: ['reflections', 'personal growth', 'learning journal', 'self-improvement'],
    breadcrumbs: [
      { name: 'Home', url: '/' },
      { name: 'Dashboard', url: '/dashboard' },
      { name: 'Reflections', url: '/reflections' }
    ]
  });

  // Filter and sort reflections
  const filteredReflections = reflections
    .filter(reflection => 
      reflection.reflection_text.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reflection.lesson_id.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
        case 'oldest':
          return new Date(a.updated_at).getTime() - new Date(b.updated_at).getTime();
        case 'longest':
          return b.reflection_text.length - a.reflection_text.length;
        default:
          return 0;
      }
    });

  const handleDeleteReflection = async (lessonId: string) => {
    if (!confirm(language === 'en' 
      ? 'Are you sure you want to delete this reflection?' 
      : 'ဤရောင်ပြန်ဟပ်မှုကို ဖျက်ရန် သေချာပါသလား။')) {
      return;
    }

    try {
      await deleteReflection(lessonId);
      showToast('success', language === 'en' 
        ? 'Reflection deleted successfully' 
        : 'ရောင်ပြန်ဟပ်မှုကို အောင်မြင်စွာ ဖျက်ပါပြီ');
    } catch (error) {
      showToast('error', language === 'en' 
        ? 'Failed to delete reflection' 
        : 'ရောင်ပြန်ဟပ်မှုကို ဖျက်ရန် မအောင်မြင်ပါ');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(language === 'en' ? 'en-US' : 'my', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getReflectionStats = () => {
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const thisWeek = reflections.filter(r => new Date(r.created_at) >= oneWeekAgo).length;
    const thisMonth = reflections.filter(r => new Date(r.created_at) >= oneMonthAgo).length;
    const averageLength = reflections.length > 0 
      ? Math.round(reflections.reduce((sum, r) => sum + r.reflection_text.length, 0) / reflections.length)
      : 0;

    return { thisWeek, thisMonth, averageLength };
  };

  const stats = getReflectionStats();

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
        title={language === 'en' ? 'My Reflections' : 'ကျွန်ုပ်၏ ရောင်ပြန်ဟပ်မှုများ'}
        description={language === 'en' 
          ? 'Your personal thoughts and insights from your learning journey'
          : 'သင့်သင်ယူမှုခရီးစဉ်မှ ကိုယ်ပိုင်အတွေးများနှင့် ထိုးထွင်းသိမြင်မှုများ'}
        icon={<Heart className="h-6 w-6 text-pink-600" />}
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">
                {language === 'en' ? 'Total Reflections' : 'စုစုပေါင်း ရောင်ပြန်ဟပ်မှုများ'}
              </p>
              <p className="text-2xl font-bold text-gray-900 mt-2">{reflections.length}</p>
            </div>
            <Heart className="h-8 w-8 text-pink-600" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">
                {language === 'en' ? 'This Week' : 'ဤအပတ်'}
              </p>
              <p className="text-2xl font-bold text-gray-900 mt-2">{stats.thisWeek}</p>
            </div>
            <Calendar className="h-8 w-8 text-blue-600" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">
                {language === 'en' ? 'This Month' : 'ဤလ'}
              </p>
              <p className="text-2xl font-bold text-gray-900 mt-2">{stats.thisMonth}</p>
            </div>
            <BookOpen className="h-8 w-8 text-green-600" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">
                {language === 'en' ? 'Avg. Length' : 'ပျမ်းမျှ အရှည်'}
              </p>
              <p className="text-2xl font-bold text-gray-900 mt-2">{stats.averageLength}</p>
            </div>
            <Edit3 className="h-8 w-8 text-purple-600" />
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={language === 'en' ? 'Search your reflections...' : 'သင့်ရောင်ပြန်ဟပ်မှုများကို ရှာဖွေပါ...'}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="appearance-none pl-4 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="newest">
                {language === 'en' ? 'Newest First' : 'အသစ်ဆုံးများ ရှေးဦးစွာ'}
              </option>
              <option value="oldest">
                {language === 'en' ? 'Oldest First' : 'အဟောင်းဆုံးများ ရှေးဦးစွာ'}
              </option>
              <option value="longest">
                {language === 'en' ? 'Longest First' : 'အရှည်ဆုံးများ ရှေးဦးစွာ'}
              </option>
            </select>
            <Filter className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Reflections List */}
      {filteredReflections.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <Heart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-700 mb-2">
            {searchTerm ? (
              language === 'en' ? 'No reflections found' : 'ရောင်ပြန်ဟပ်မှုများ မတွေ့ရှိပါ'
            ) : (
              language === 'en' ? 'No reflections yet' : 'ရောင်ပြန်ဟပ်မှုများ မရှိသေးပါ'
            )}
          </h3>
          <p className="text-gray-600 max-w-md mx-auto">
            {searchTerm ? (
              language === 'en' 
                ? 'Try adjusting your search terms or filters'
                : 'သင့်ရှာဖွေမှုစကားလုံးများ သို့မဟုတ် စစ်ထုတ်မှုများကို ပြင်ဆင်ကြည့်ပါ'
            ) : (
              language === 'en' 
                ? 'Start reflecting on your lessons to see your thoughts here'
                : 'သင့်အတွေးများကို ဤနေရာတွင် မြင်ရန် သင့်သင်ခန်းစာများကို ပြန်လည်သုံးသပ်ခြင်း စတင်ပါ'
            )}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredReflections.map((reflection) => (
            <div key={reflection.id} className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <BookOpen className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium text-gray-700">
                      {language === 'en' ? 'Lesson:' : 'သင်ခန်းစာ:'} {reflection.lesson_id}
                    </span>
                  </div>
                  <div className="flex items-center space-x-4 text-xs text-gray-500">
                    <div className="flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      <span>{formatDate(reflection.updated_at)}</span>
                    </div>
                    <div>
                      {reflection.reflection_text.length} {language === 'en' ? 'characters' : 'စာလုံး'}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setExpandedReflection(
                      expandedReflection === reflection.id ? null : reflection.id
                    )}
                    className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
                    title={expandedReflection === reflection.id 
                      ? (language === 'en' ? 'Collapse' : 'ခေါက်သိမ်းရန်')
                      : (language === 'en' ? 'Expand' : 'ဖြန့်ရန်')}
                  >
                    {expandedReflection === reflection.id ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                  
                  <button
                    onClick={() => handleDeleteReflection(reflection.lesson_id)}
                    className="p-2 text-red-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                    title={language === 'en' ? 'Delete reflection' : 'ရောင်ပြန်ဟပ်မှု ဖျက်ရန်'}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Reflection Text */}
              <div className={`prose prose-sm max-w-none text-gray-700 ${
                expandedReflection === reflection.id ? '' : 'line-clamp-3'
              }`}>
                <p className="whitespace-pre-wrap">{reflection.reflection_text}</p>
              </div>

              {reflection.reflection_text.length > 200 && expandedReflection !== reflection.id && (
                <button
                  onClick={() => setExpandedReflection(reflection.id)}
                  className="mt-2 text-blue-600 hover:text-blue-700 text-sm"
                >
                  {language === 'en' ? 'Read more...' : 'ပိုမိုဖတ်ရှုရန်...'}
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ReflectionsPage;