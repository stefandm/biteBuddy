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
    <div className=" rounded-lg flex flex-col shadow-[1px_1px_2px_1px_#f6ad55] ">
      <div className="flex flex-col justify-between h-full items-center ">
        {isExpanded && (
          <div className="flex flex-col items-center">
            <h2 className="text-3xl font-semibold text-center my-10 text-orange-700">{meal.strMeal}</h2>
            <div className="flex-col flex md:flex-row justify-evenly  items-center w-full ">
              <img
                src={meal.strMealThumb}
                alt={meal.strMeal}
                width={0}
                height={0}
                sizes="100"
                className="w-auto flex-1 object-cover h-[40vh]  md:h-auto md:w-[40vw] lg:max-h-[60vh] lg:max-w-[60vw] rounded-lg border-2 border-orange-100"
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
              <h3 className="text-lg font-semibold mb-2 text-center pb-6">Instructions:</h3>
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
              className="w-full h-fit object-cover rounded-t-lg "
            />
          </div>
        )}
        <div className='w-full h-full flex justify-center align-middle'>
        <button
          onClick={() => onClick(meal.idMeal)} // Pass the meal ID when the button is clicked
          className="md:py-2 py-1 w-full px-2 rounded-b-lg text-orange-950 font-display md:text-lg hover:bg-orange-400 hover:text-white bg-orange-50"
        >
          {isExpanded ? buttonText :  meal.strMeal}
        </button>
        </div>
      </div>
    </div>
  );
};

export default RecipeCard;
