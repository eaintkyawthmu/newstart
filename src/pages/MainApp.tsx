import React from 'react';
import { Routes, Route } from 'react-router-dom';
import StepContent from '../components/StepContent';
import KnowledgeLibrary from '../components/KnowledgeLibrary';
import SetupProfile from './SetupProfile';

const MainApp = () => {
  return (
    <Routes>
      <Route path="/setup-profile" element={<SetupProfile />} />
      <Route path="/library" element={<KnowledgeLibrary />} />
      <Route path="/" element={<StepContent />} />
    </Routes>
  );
};

export default MainApp;