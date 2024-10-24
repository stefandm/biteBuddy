import React, { createContext, useState, useRef, ReactNode } from 'react';
import { Meal } from '../types';

export interface SelectedMealContextProps {
  selectedMeal: Meal | null;
  selectMeal: (meal: Meal) => void;
  clearSelectedMeal: () => void;
  scrollToTopRef: React.RefObject<HTMLDivElement>;
}

export const SelectedMealContext = createContext<SelectedMealContextProps | undefined>(undefined);

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
