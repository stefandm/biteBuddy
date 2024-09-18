// contexts/useSelectedMealContext.ts

import { useContext } from 'react';
import { SelectedMealContext } from './SelectedMealContext';

export const useSelectedMealContext = () => {
  const context = useContext(SelectedMealContext);
  if (context === undefined) {
    throw new Error('useSelectedMealContext must be used within a SelectedMealProvider');
  }
  return context;
};
