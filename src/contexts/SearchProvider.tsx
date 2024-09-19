// contexts/SearchProvider.tsx

import React, { useState, useCallback } from 'react';
import { searchMeals } from '../api/mealapi';
import { Meal } from '../types';
import { useUserRecipesContext } from './useUserRecipesContext';
import { useSelectedMealContext } from './useSelectedMealContext';
import { SearchContext } from './SearchContext';

const SearchProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { userRecipes } = useUserRecipesContext();
  const { selectMeal } = useSelectedMealContext();

  const [query, setQuery] = useState<string>('');
  const [searchType, setSearchType] = useState<'recipe' | 'ingredient'>('recipe');
  const [suggestions, setSuggestions] = useState<Meal[]>([]);
  const [searchResults, setSearchResults] = useState<Meal[]>([]);
  const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);
  const [isLoadingSearchResults, setIsLoadingSearchResults] = useState<boolean>(false);

  const handleInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setQuery(query);
    setHighlightedIndex(-1);

    if (query.length > 2) {
      const response = await searchMeals(query);
      const results = response.meals || [];
      setSuggestions(results.slice(0, 5));
    } else {
      setSuggestions([]);
    }
  };

  const handleSearch = useCallback(async () => {
    if (query.trim() === '') {
      setSearchResults([]);
      return;
    }
    
    setIsLoadingSearchResults(true);
    const isIngredientSearch = searchType === 'ingredient';
    const response = await searchMeals(query, isIngredientSearch);

    const results = response.meals || [];

    const filteredResults = results.filter(
      (meal: Meal) => !userRecipes.some((recipe) => recipe.meal.idMeal === meal.idMeal)
    );

    setSearchResults(filteredResults);
    setSuggestions([]);
    setIsLoadingSearchResults(false);
  }, [query, searchType, userRecipes]);

  const handleSearchTypeChange = (type: 'recipe' | 'ingredient') => {
    setSearchType(type);
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      if (highlightedIndex >= 0 && suggestions[highlightedIndex]) {
        selectMeal(suggestions[highlightedIndex]);
      } else {
        handleSearch();
      }
      setSuggestions([]);
      setQuery('');
    } else if (e.key === 'Escape') {
      setSuggestions([]);
      setQuery('');
    } else if (e.key === 'ArrowDown') {
      setHighlightedIndex((prevIndex) =>
        prevIndex < suggestions.length - 1 ? prevIndex + 1 : 0
      );
    } else if (e.key === 'ArrowUp') {
      setHighlightedIndex((prevIndex) =>
        prevIndex > 0 ? prevIndex - 1 : suggestions.length - 1
      );
    }
  };

  return (
    <SearchContext.Provider
      value={{
        query,
        searchType,
        suggestions,
        searchResults,
        highlightedIndex,
        isLoadingSearchResults,
        handleInputChange,
        handleSearch,
        handleSearchTypeChange,
        handleSearchKeyDown,
        setSuggestions,
        setHighlightedIndex,
      }}
    >
      {children}
    </SearchContext.Provider>
  );
};

export default SearchProvider;
