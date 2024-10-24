import React from 'react';
import { useSelectedMeal } from '../../hooks/useSelectedMeal';
import ExpandedRecipeCardUI from './Ui';
import { INGREDIENT_KEYS, IngredientKey } from '../../types';

interface ExpandedRecipeCardProps {
  onAddRecipe: () => void;
  onClose: () => void;
}

const ExpandedRecipeCardContainer: React.FC<ExpandedRecipeCardProps> = ({
  onAddRecipe,
  onClose,
}) => {
  const { selectedMeal } = useSelectedMeal();

  if (!selectedMeal) return null;

  const ingredients = INGREDIENT_KEYS
    .map((key) => selectedMeal[key as IngredientKey])
    .filter((ingredient): ingredient is string => Boolean(ingredient));

  const instructions = selectedMeal.strInstructions
    ? selectedMeal.strInstructions.split('.').map((sentence: string, index: number) => ({
        text: sentence.trim() ? `${sentence.trim()}.` : '',
        key: index,
      }))
    : [{ text: 'No instructions available.', key: 0 }];

  return (
    <ExpandedRecipeCardUI
      mealName={selectedMeal.strMeal}
      mealThumb={selectedMeal.strMealThumb}
      mealAlt={selectedMeal.strMeal}
      ingredients={ingredients}
      instructions={instructions}
      onAddRecipe={onAddRecipe}
      onClose={onClose}
    />
  );
};

export default ExpandedRecipeCardContainer;
