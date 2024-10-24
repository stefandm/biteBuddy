import React from 'react';
import { Meal } from '../types';
import { useSelectedMeal } from '../hooks/useSelectedMeal';

interface RecipeCardProps {
  meal: Meal;
}

const RecipeCard: React.FC<RecipeCardProps> = ({ meal }) => {
  const { selectMeal } = useSelectedMeal();

  const handleClick = () => {
    selectMeal(meal);
  };

  return (
    <div
      className="group flex flex-col rounded-xl hover:cursor-pointer overflow-hidden  shadow-[4.0px_8.0px_8.0px_rgba(0,0,0,0.38)]"
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
        className="py-2 w-full flex items-center justify-center text-center px-2 rounded-b-sm md:text-2xl bg-orange-300 group-hover:bg-orange-800 group-hover:text-white"
      >
        {meal.strMeal}
      </div>
    </div>
  );
};

export default RecipeCard;
