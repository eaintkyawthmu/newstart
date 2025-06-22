export type StepData = {
  id: number;
  completed: boolean;
  title: string;
};

export type BudgetItem = {
  category: string;
  amount: number;
};

export type UserPreferences = {
  language: 'en' | 'my';
  darkMode: boolean;
  completedSteps: number[];
};