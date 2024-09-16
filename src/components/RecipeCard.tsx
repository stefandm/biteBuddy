import React from 'react';
import { Meal } from '../types';

interface RecipeCardProps {
  meal: Meal;
  onClick: (idMeal: string) => void;
}

const RecipeCard: React.FC<RecipeCardProps> = ({ meal, onClick }) => {
  return (
    <div
  className="group rounded-lg flex flex-col shadow-[1px_1px_2px_1px_#f6ad55] hover:cursor-pointer hover:shadow-[1px_1px_2px_1px_#9a3412] overflow-hidden"
  onClick={() => onClick(meal.idMeal)}
>
  <div className="flex flex-col h-full overflow-hidden">
    <img
      src={meal.strMealThumb}
      alt={meal.strMeal}
      className="w-full h-full object-cover rounded-t-lg transition-transform duration-300 transform group-hover:scale-105"
    />
  </div>
  <div
    className="py-1 w-full  flex items-center justify-center text-center px-2 rounded-b-lg text-orange-950 md:text-xl bg-orange-300 group-hover:bg-orange-800 group-hover:text-white hover:cursor-pointer"
  >
    {meal.strMeal}
  </div>
</div>

  );
};

export default RecipeCard;
