import React from 'react';
import KnowledgeLibrary from '../components/KnowledgeLibrary';
import { PageHeader } from '../components/navigation';
import { useLanguage } from '../contexts/LanguageContext';
import { BookOpen } from 'lucide-react';

const Library = () => {
  const { language } = useLanguage();
  
  return (
    <div>
      <PageHeader 
        title={language === 'en' ? 'Knowledge Library' : 'ဗဟုသုတ စာကြည့်တိုက်'}
        description={language === 'en' 
          ? 'Explore our comprehensive guides to build your financial knowledge'
          : 'သင့်ငွေကြေးဗဟုသုတ တည်ဆောက်ရန် ကျွန်ုပ်တို့၏ ပြည့်စုံသော လမ်းညွှန်များကို လေ့လာပါ'}
        icon={<BookOpen className="h-6 w-6 text-blue-600" />}
      />
      <KnowledgeLibrary />
    </div>
  );
};

export default Library;