
import React from 'react';
import RecipeCard from './RecipeCard';
import { Meal } from '../types';

interface RecipeListProps {
  meals: Meal[];
}

const RecipeList = React.memo(({ meals }: RecipeListProps) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 mb-4 lg:grid-cols-4 gap-8 sm:gap-6 md:gap-16">
      {meals.map((meal) => (
        <RecipeCard key={meal.idMeal} meal={meal} />
      ))}
    </div>
  );
});

export default RecipeList;
