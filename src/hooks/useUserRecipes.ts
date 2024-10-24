import { useContext } from 'react';
import { UserRecipesContext } from '../contexts/UserRecipesProvider';
import { UserRecipesContextProps } from '../contexts/UserRecipesProvider';

export const useUserRecipes = (): UserRecipesContextProps => {
  const context = useContext(UserRecipesContext);
  if (context === undefined) {
    throw new Error('useUserRecipes must be used within a UserRecipesProvider');
  }
  return context;
};
