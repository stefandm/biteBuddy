import { useContext } from 'react';
import { UserRecipesContext } from '../contexts/UserRecipesContext';

export const useUserRecipesContext = () => {
  const context = useContext(UserRecipesContext);
  if (context === undefined) {
    throw new Error('useUserRecipesContext must be used within a UserRecipesProvider');
  }
  return context;
};
