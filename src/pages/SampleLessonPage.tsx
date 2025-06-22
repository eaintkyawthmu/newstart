import React from 'react';
import LessonViewer from '../components/LessonViewer';
import { PageHeader } from '../components/navigation';
import { BookOpen } from 'lucide-react';

const SampleLessonPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <PageHeader
          title="Action-Oriented Learning Experience"
          description="This page demonstrates our new lesson format that transforms traditional content into practical, task-based experiences"
          icon={<BookOpen className="h-6 w-6 text-blue-600" />}
        />
        
        <LessonViewer />
      </div>
    </div>
  );
};

export default SampleLessonPage;