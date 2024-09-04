import React from 'react';
import { Meal, INGREDIENT_KEYS, IngredientKey } from '../types'; // Adjust the path as necessary

interface CardProps {
  meal: Meal;
  onClick: (idMeal: string) => void;
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
    <div className=" rounded-lg flex flex-col shadow-[rgba(50,50,93,0.25)_0px_6px_12px_-2px,_rgba(0,0,0,0.3)_0px_3px_7px_-3px]">
      <div className="flex flex-col justify-between h-full items-center ">
        {isExpanded && (
          <div className="flex flex-col items-center">
            <h2 className="text-xl font-semibold text-center my-4">{meal.strMeal}</h2>
            <div className="flex-col flex md:flex-row justify-evenly w-full ">
              <img
                src={meal.strMealThumb}
                alt={meal.strMeal}
                width={0}
                height={0}
                sizes="100"
                className="w-auto object-cover h-[40vh]  md:h-auto md:w-[40vw] lg:max-h-[50vh] lg:max-w-[60vw] rounded-lg border-4 border-teal-100"
              />
              <div className="flex flex-col justify-evenly items-center">
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
              <h3 className="text-lg font-semibold mb-2 text-center">Instructions:</h3>
              <p>{instructions}</p>
            </div>
          </div>
        )}
        {!isExpanded && (
          <div className="flex flex-col h-full ">
            <img
              src={meal.strMealThumb}
              alt={meal.strMeal}
              width={0}
              height={0}
              sizes="100"
              className="w-full h-fit object-cover rounded-t-lg border-b border-teal-200"
            />
            <div className='flex justify-center h-full items-center p-2'>
            <h2 className="text-base font-medium text-center">{meal.strMeal}</h2>
            </div>
          </div>
        )}
        <button
          onClick={() => onClick(meal.idMeal)} // Pass the meal ID when the button is clicked
          className="md:py-2 w-[80%] md:w-[70%] bg-orange-400 hover:bg-orange-600 text-white rounded-t-lg"
        >
          {buttonText}
        </button>
      </div>
    </div>
  );
};

export default RecipeCard;
