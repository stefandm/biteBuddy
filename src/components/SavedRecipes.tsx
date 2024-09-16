// components/SavedRecipes.tsx

import React from 'react';
import { Recipe } from '../types';

interface SavedRecipesProps {
  userRecipes: Recipe[];
  selectedRecipeId: string | null;
  handleSelectRecipe: (recipe: Recipe) => void;
  handleDeleteRecipe: (recipeId: string) => void;
}

const SavedRecipes: React.FC<SavedRecipesProps> = ({
  userRecipes,
  selectedRecipeId,
  handleSelectRecipe,
  handleDeleteRecipe,
}) => {
  return (
    <>
      <h2 className="text-2xl text-orange-300 font-bold mt-14 mb-4 text-center">
        Saved Recipes
      </h2>
      <ul className="md:min-w-full">
        {userRecipes.map((recipe) => (
          <li
            key={recipe.id}
            className="sm:flex md:flex-col font-secondary flex rounded-lg lg:flex-row mb-3  shadow-[1px_1px_1px_1px_#f6ad55]"
          >
            <button
              onClick={() => handleSelectRecipe(recipe)}
              className={`w-full text-white text-left py-[3px] px-2 rounded-l-lg md:rounded-t-lg md:rounded-bl-none lg:rounded-l-lg lg:rounded-r-none hover:bg-orange-400 hover:text-black md:text-center lg:text-left   ${
                selectedRecipeId === recipe.id
                  ? 'bg-orange-100 text-black '
                  : 'bg-slate-700 text-white'
              }`}
            >
              {recipe.meal.strMeal}
            </button>
            <button
              onClick={() => handleDeleteRecipe(recipe.id)}
              className="rounded-r-lg md:rounded-bl-lg md:rounded-br-lg md:rounded-t-none lg:rounded-l-none lg:rounded-r-lg  py-1 px-2 border-l-[1px] md:border-t-[1px] lg:border-t-0 border-orange-400 text-red-600 hover:text-black hover:bg-red-700"
            >
              X
            </button>
          </li>
        ))}
      </ul>
    </>
  );
};

export default SavedRecipes;
