import React from 'react';

interface Instruction {
  text: string;
  key: number;
}

interface ExpandedRecipeCardUIProps {
  mealName: string;
  mealThumb: string;
  mealAlt: string;
  ingredients: string[];
  instructions: Instruction[];
  onAddRecipe: () => void;
  onClose: () => void;
}

const ExpandedRecipeCardUI: React.FC<ExpandedRecipeCardUIProps> = ({
  mealName,
  mealThumb,
  mealAlt,
  ingredients,
  instructions,
  onAddRecipe,
  onClose,
}) => {
  return (
    <div className="flex flex-col text-white bg-slate-800 pb-4 px-4">
      <div className="flex flex-col items-center">
        <h2 className="text-5xl font-extrabold text-center my-10 text-orange-300 font-main">
          {mealName}
        </h2>
        <div className="flex-col flex xl:flex-row justify-evenly items-center w-full">
          <img
            loading="lazy"
            src={mealThumb}
            alt={mealAlt}
            className="w-auto l-6 flex-1 lg:ml-4 object-cover h-[20vh] md:h-[30vw] lg:max-h-[40vh] lg:max-w-[40vw] rounded-lg border-slate-100"
          />
          <div className="flex flex-col justify-evenly items-center mt-6 px-14 font-secondary">
            <h3 className="text-xl font-semibold mb-6">Ingredients:</h3>
            <ul className="pl-5 mb-4">
              {ingredients.length > 0 ? (
                ingredients.map((ingredient, index) => <li key={index}>{ingredient}</li>)
              ) : (
                <li>No ingredients available.</li>
              )}
            </ul>
          </div>
        </div>

        <div className="p-2 sm:p-10 md:p-14 font-secondary">
          <h3 className="text-xl font-semibold my-6 text-center">Instructions:</h3>
          <p>
            {instructions.map((instruction) =>
              instruction.text ? (
                <React.Fragment key={instruction.key}>
                  <span>{instruction.text}</span>
                  <br />
                </React.Fragment>
              ) : null
            )}
          </p>
        </div>
      </div>
      <div className="w-full flex font-bold font-main">
        <button
          onClick={onAddRecipe}
          className="md:py-2 py-1 w-full px-2 text-orange-950 md:text-xl hover:bg-orange-300 rounded-l-lg bg-orange-200"
        >
          Save Recipe
        </button>
        <button
          onClick={onClose}
          className="md:py-2 py-1 px-2 md:text-xl hover:bg-red-800 text-xl bg-red-700 hover:text-white rounded-r-lg"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default ExpandedRecipeCardUI;
