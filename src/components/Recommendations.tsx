// components/Recommendations.tsx

import React from 'react';
import RecipeList from './RecipeList';
import RecipeSkeleton from './RecipeSkeleton';
import { Meal } from '../types';

interface RecommendationsProps {
  recommendations: Meal[];
  isLoading: boolean;
  handleSelectMeal: (idMeal: string) => void;
}

const Recommendations: React.FC<RecommendationsProps> = ({
  recommendations,
  isLoading,
  handleSelectMeal,
}) => {
  if (isLoading) {
    return (
      <div className="mb-8">
        <h2 className="text-3xl text-orange-300 font-extrabold mt-[7vh] mb-[3vh] text-center">
          Based on your taste
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          <RecipeSkeleton cards={8} />
        </div>
      </div>
    );
  }

  if (recommendations.length > 0) {
    return (
      <>
        <h2 className="text-3xl text-orange-300 font-extrabold mt-[7vh]  mb-[3vh] text-center">
          Based on your taste
        </h2>
        <RecipeList meals={recommendations} onSelectMeal={handleSelectMeal} />
      </>
    );
  }

  return null;
};

export default Recommendations;
