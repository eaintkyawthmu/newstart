import React, { ReactNode } from 'react';
import Navbar from './Navbar';
import StepProgress from './StepProgress';
import { useStep } from '../contexts/StepContext';

type LayoutProps = {
  children: ReactNode;
};

const Layout = ({ children }: LayoutProps) => {
  const { currentStep } = useStep();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-8 max-w-6xl">
        <StepProgress />
        <div 
          className="mt-6 bg-white rounded-xl shadow-sm p-6 md:p-8 transition-all duration-300 ease-in-out"
        >
          {children}
        </div>
      </main>
      <footer className="bg-white py-6 border-t border-gray-200">
        <div className="container mx-auto px-4 text-center text-gray-500 text-sm">
          &copy; {new Date().getFullYear()} Financial Literacy Guide. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default Layout;