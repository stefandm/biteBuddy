// ExpandedRecipeCard.tsx

import React from 'react';
import { Meal, INGREDIENT_KEYS, IngredientKey } from '../types';

interface ExpandedRecipeCardProps {
  meal: Meal;
  onAddRecipe: () => void;
  onClose: () => void;
}

const ExpandedRecipeCard: React.FC<ExpandedRecipeCardProps> = ({
  meal,
  onAddRecipe,
  onClose,
}) => {
  // Extract ingredients
  const ingredients = INGREDIENT_KEYS
    .map((key) => meal[key as IngredientKey])
    .filter((ingredient): ingredient is string => Boolean(ingredient));

  // Format instructions
  const instructions = meal.strInstructions
    ? meal.strInstructions.split('.').map((sentence: string, index: number) => (
        <React.Fragment key={index}>
          {sentence.trim() && <span>{sentence.trim()}.</span>}
          <br />
        </React.Fragment>
      ))
    : 'No instructions available.';

  return (
    <div className="rounded-lg flex flex-col text-white bg-slate-700 shadow-[1px_1px_2px_1px_#f6ad55]">
      <div className="flex flex-col items-center">
        <h2 className="text-3xl font-semibold text-center my-10 text-orange-300">
          {meal.strMeal}
        </h2>
        <div className="flex-col flex md:flex-row justify-evenly items-center w-full">
          <img
            src={meal.strMealThumb}
            alt={meal.strMeal}
            className="w-auto flex-1 object-cover h-[40vh] md:h-auto md:w-[40vw] lg:max-h-[60vh] lg:max-w-[60vw] rounded-lg border-slate-100"
          />
          <div className="flex flex-col justify-evenly items-center mt-6 px-14 font-secondary">
            <h3 className="text-lg font-semibold mb-2">Ingredients:</h3>
            <ul className="pl-5 mb-4">
              {ingredients.length > 0 ? (
                ingredients.map((ingredient, index) => (
                  <li key={index}>{ingredient}</li>
                ))
              ) : (
                <li>No ingredients available.</li>
              )}
            </ul>
          </div>
        </div>

        <div className="p-14 font-secondary">
          <h3 className="text-lg font-semibold mb-2 text-center pb-6">
            Instructions:
          </h3>
          <p>{instructions}</p>
        </div>
      </div>
      <div className="w-full h-full flex justify-center items-center">
        <button
          onClick={onAddRecipe}
          className="md:py-2 py-1 w-full px-2 text-orange-950 md:text-xl hover:bg-orange-300 rounded-bl-lg bg-orange-200"
        >
          Add to My Recipes
          
        </button>
        <button
          onClick={onClose}
          className="md:py-2 py-1  px-2 md:text-xl  hover:bg-red-800 text-xl bg-red-700 hover:text-white  rounded-br-lg "
        >
          Close
        </button>
      </div>
      {/* <div className="flex justify-center pt-4 absolute bottom-0 right-0"> */}
        
      {/* </div> */}
    </div>
  );
};

export default ExpandedRecipeCard;
