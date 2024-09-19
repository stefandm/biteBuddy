// contexts/SelectedMealContext.tsx

import React, { createContext, useState, useRef } from 'react';
import { Meal } from '../types';
import { getMealDetails } from '../api/mealapi';

interface SelectedMealContextProps {
  selectedMeal: Meal | null;
  selectMeal: (meal: Meal) => Promise<void>;
  clearSelectedMeal: () => void;
  scrollToTopRef: React.RefObject<HTMLDivElement>;
}

export const SelectedMealContext = createContext<SelectedMealContextProps | undefined>(undefined);

export const SelectedMealProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedMeal, setSelectedMeal] = useState<Meal | null>(null);
  const scrollToTopRef = useRef<HTMLDivElement>(null);

  const selectMeal = async (meal: Meal) => {
    // Fetch meal details if instructions are not available
    if (!meal.strInstructions) {
      try {
        const details = await getMealDetails(meal.idMeal);
        if (details) {
          setSelectedMeal(details);
        }
      } catch (error) {
        console.error('Error fetching meal details:', error);
      }
    } else {
      setSelectedMeal(meal);
    }

    scrollToTopRef.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  };

  const clearSelectedMeal = () => {
    setSelectedMeal(null);
  };

  return (
    <SelectedMealContext.Provider
      value={{ selectedMeal, selectMeal, clearSelectedMeal, scrollToTopRef }}
    >
      {children}
    </SelectedMealContext.Provider>
  );
};


