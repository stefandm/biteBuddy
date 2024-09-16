// RecipeCard.tsx

import React from 'react';
import { Meal } from '../types';

interface RecipeCardProps {
  meal: Meal;
  onClick: (idMeal: string) => void;
}

const RecipeCard: React.FC<RecipeCardProps> = ({ meal, onClick }) => {
  return (
    <div className="rounded-lg flex flex-col shadow-[1px_1px_2px_1px_#f6ad55]">
      <div className="flex flex-col h-full">
        <img
          src={meal.strMealThumb}
          alt={meal.strMeal}
          className="w-full h-fit object-cover rounded-t-lg"
        />
      </div>
      <button
        onClick={() => onClick(meal.idMeal)}
        className="py-1 w-full h-full px-2 rounded-b-lg text-orange-950 md:text-xl hover:bg-orange-400 hover:text-white bg-orange-50"
      >
        {meal.strMeal}
      </button>
    </div>
  );
};

export default RecipeCard;
