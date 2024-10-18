import React from 'react';
import { Meal } from '../types';
import { useSelectedMealContext } from '../hooks/useSelectedMealContext';

interface RecipeCardProps {
  meal: Meal;
}

const RecipeCard: React.FC<RecipeCardProps> = ({ meal }) => {
  const { selectMeal } = useSelectedMealContext();

  const handleClick = () => {
    selectMeal(meal);
  };

  return (
    <div
    className="group rounded-lg flex flex-col hover:cursor-pointer overflow-hidden"
    onClick={handleClick}
  >
    <div className="flex flex-col h-full overflow-hidden">
      <img
      loading="lazy"
        src={meal.strMealThumb}
        alt={meal.strMeal}
        className="w-full h-full object-cover rounded-t-lg transition-transform duration-300 transform group-hover:scale-105 will-change-transform"
      />
    </div>
    <div
      className="py-2 w-full flex items-center justify-center text-center px-2 rounded-b-lg text-orange-950 md:text-xl bg-orange-300 group-hover:bg-orange-800 group-hover:text-white hover:cursor-pointer"
    >
      {meal.strMeal}
    </div>
  </div>
  
  );
};

export default RecipeCard;
