import React from 'react';
import { Meal } from '../types';
import RecipeCard from './RecipeCard';

interface RecipeListProps {
  meals: Meal[];
  itemsPerPage: number;
  listType?: 'searchResults' | 'recommendations' | 'randomMeals'; // Optional prop to determine list type
}

const RecipeList: React.FC<RecipeListProps> = ({ meals, itemsPerPage, listType = 'searchResults' }) => {
  const [visibleCount, setVisibleCount] = React.useState<number>(itemsPerPage);

  const handleLoadMore = () => {
    setVisibleCount((prevCount) => prevCount + itemsPerPage);
  };

  const displayedMeals = meals.slice(0, visibleCount);
  const hasMore = visibleCount < meals.length;

  return (
    <div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-16">
        {displayedMeals.map((meal) => (
          <RecipeCard key={meal.idMeal} meal={meal} />
        ))}
      </div>
      {listType === 'searchResults' && hasMore && ( // Conditionally render "Load More" only for searchResults
        <div className="flex justify-center mt-10 pb-4">
          <button
            onClick={handleLoadMore}
            className="px-20 py-2 bg-orange-700 text-white text-xl rounded hover:bg-orange-900 transition-colors duration-300 shadow-[4.0px_8.0px_8.0px_rgba(0,0,0,0.38)]"
          >
            Load More
          </button>
        </div>
      )}
    </div>
  );
};

export default RecipeList;
