// src/components/RecipeList.tsx
import React, { useState } from 'react';
import { Meal } from '../types';
import RecipeCard from './RecipeCard';

interface RecipeListProps {
  meals: Meal[];
  itemsPerPage: number;
}

const RecipeList: React.FC<RecipeListProps> = ({ meals, itemsPerPage }) => {
  const [visibleCount, setVisibleCount] = useState<number>(itemsPerPage);

  const handleLoadMore = () => {
    setVisibleCount((prevCount) => prevCount + itemsPerPage);
  };

  const displayedMeals = meals.slice(0, visibleCount);
  const hasMore = visibleCount < meals.length;

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {displayedMeals.map((meal) => (
          <RecipeCard key={meal.idMeal} meal={meal} />
        ))}
      </div>
      {hasMore && (
        <div className="flex justify-center mt-4">
          <button
            onClick={handleLoadMore}
            className="px-4 py-2 bg-orange-700 text-white rounded hover:bg-orange-900 transition-colors duration-300"
          >
            Load More
          </button>
        </div>
      )}
    </div>
  );
};

export default RecipeList;
