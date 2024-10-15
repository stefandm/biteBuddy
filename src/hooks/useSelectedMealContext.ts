import { useContext } from 'react';
import { SelectedMealContext } from '../contexts/SelectedMealContext';

export const useSelectedMealContext = () => {
  const context = useContext(SelectedMealContext);
  if (context === undefined) {
    throw new Error('useSelectedMealContext must be used within a SelectedMealProvider');
  }
  return context;
};
