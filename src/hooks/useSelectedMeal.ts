import { useContext } from 'react';
import { SelectedMealContext } from '../contexts/SelectedMealProvider';
import { SelectedMealContextProps } from '../contexts/SelectedMealProvider'; 

export const useSelectedMeal = (): SelectedMealContextProps => {
  const context = useContext(SelectedMealContext);
  if (context === undefined) {
    throw new Error('useSelectedMeal must be used within a SelectedMealProvider');
  }
  return context;
};
