// components/RecipeList.tsx

import React from 'react';
import RecipeCard from './RecipeCard';
import { Meal } from '../types';

interface RecipeListProps {
  meals: Meal[];
  onSelectMeal: (idMeal: string) => void;
}

const RecipeList: React.FC<RecipeListProps> = ({ meals, onSelectMeal }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3  lg:grid-cols-4 gap-6">
      {meals.map((meal) => (
        <RecipeCard key={meal.idMeal} meal={meal} onClick={onSelectMeal} />
      ))}
    </div>
  );
};

export default RecipeList;
