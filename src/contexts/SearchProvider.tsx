// contexts/SearchProvider.tsx

import React from 'react';
import { useUserRecipesContext } from './useUserRecipesContext';
import { useSelectedMealContext } from '../hooks/useSelectedMealContext';
import useSearch from '../hooks/useSearch';
import { SearchContext } from './SearchContext';

const SearchProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { userRecipes } = useUserRecipesContext();
  const { selectMeal } = useSelectedMealContext(); // Function to set the selected meal

  const search = useSearch(userRecipes, selectMeal); // Pass selectMeal as handleSelectMeal

  return (
    <SearchContext.Provider value={search}>
      {children}
    </SearchContext.Provider>
  );
};

export { SearchProvider };
