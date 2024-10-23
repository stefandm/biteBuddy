import React, { createContext, useState, useRef, useContext, ReactNode } from 'react';
import { Meal } from '../types';

interface SelectedMealContextProps {
  selectedMeal: Meal | null;
  selectMeal: (meal: Meal) => void;
  clearSelectedMeal: () => void;
  scrollToTopRef: React.RefObject<HTMLDivElement>;
}

const SelectedMealContext = createContext<SelectedMealContextProps | undefined>(undefined);

export const SelectedMealProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [selectedMeal, setSelectedMeal] = useState<Meal | null>(null);
  const scrollToTopRef = useRef<HTMLDivElement>(null);

  const selectMeal = (meal: Meal) => {
    setSelectedMeal(meal);
  };

  const clearSelectedMeal = () => {
    setSelectedMeal(null);
  };

  return (
    <SelectedMealContext.Provider
      value={{
        selectedMeal,
        selectMeal,
        clearSelectedMeal,
        scrollToTopRef,
      }}
    >
      {children}
    </SelectedMealContext.Provider>
  );
};

export const useSelectedMeal = (): SelectedMealContextProps => {
  const context = useContext(SelectedMealContext);
  if (context === undefined) {
    throw new Error('useSelectedMeal must be used within a SelectedMealProvider');
  }
  return context;
};
