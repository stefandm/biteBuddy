import React from 'react';
import Modal from './Modal';
import ExpandedRecipeCardContainer from './ExpandedRecipeCard/Container';
import { useSelectedMeal } from '../hooks/useSelectedMeal';
import { useUserRecipes } from '../hooks/useUserRecipes';

const ModalContainer: React.FC = () => {
  const { selectedMeal, clearSelectedMeal } = useSelectedMeal();
  const { addRecipeToUser } = useUserRecipes();

  const handleAddRecipe = async () => {
    if (selectedMeal) {
      await addRecipeToUser(selectedMeal);
      clearSelectedMeal();
    }
  };

  return (
    <Modal isOpen={!!selectedMeal} onClose={clearSelectedMeal}>
      {selectedMeal && (
        <ExpandedRecipeCardContainer onAddRecipe={handleAddRecipe} onClose={clearSelectedMeal} />
      )}
    </Modal>
  );
};

export default ModalContainer;
