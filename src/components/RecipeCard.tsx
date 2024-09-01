import React from 'react';
import { Meal, INGREDIENT_KEYS, IngredientKey } from '../types'; // Adjust the path as necessary

interface CardProps {
  meal: Meal;
  onClick: () => void;
  buttonText: string;
  isExpanded?: boolean;
}

const RecipeCard: React.FC<CardProps> = ({ meal, onClick, buttonText, isExpanded }) => {
  // Extract ingredients based on the known keys
  const ingredients = INGREDIENT_KEYS
    .map((key) => meal[key as IngredientKey]) // Use the IngredientKey type to ensure safe access
    .filter((ingredient): ingredient is string => Boolean(ingredient)); // Filter out null values

  const instructions = meal.strInstructions
    ? meal.strInstructions.split('.').map((sentence: string, index: number) => (
        <React.Fragment key={index}>
          {sentence.trim() && <span>{sentence.trim()}.</span>}
          <br />
        </React.Fragment>
      ))
    : 'No instructions available.';

  return (
    <div className="border border-gray-300 rounded flex flex-col">
      <div className="flex flex-col justify-evenly gap-2 items-center">
        {isExpanded && (
          <div className="flex flex-col items-center">
            <h2 className="text-xl font-semibold text-center my-4">{meal.strMeal}</h2>
            <div className="flex justify-evenly w-full">
              <img
                src={meal.strMealThumb}
                alt={meal.strMeal}
                width={0}
                height={0}
                sizes="100"
                className="w-auto h-[50vh] rounded"
              />
              <div className="flex flex-col justify-evenly">
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

            <div className="p-4">
              <h3 className="text-lg font-semibold mb-2">Instructions:</h3>
              <p>{instructions}</p>
            </div>
          </div>
        )}
        {!isExpanded && (
          <div className="">
            <img
              src={meal.strMealThumb}
              alt={meal.strMeal}
              width={0}
              height={0}
              sizes="100"
              className="w-fit h-fit rounded"
            />
            <h2 className="text-xl font-semibold text-center">{meal.strMeal}</h2>
          </div>
        )}
        <button
          onClick={onClick}
          className="p-2 w-full bg-blue-500 text-white rounded"
        >
          {buttonText}
        </button>
      </div>
    </div>
  );
};

export default RecipeCard;
