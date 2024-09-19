// hooks/useSearch.ts

import { useState, useCallback } from 'react';
import { searchMeals } from '../api/mealapi';
import { Meal, Recipe } from '../types';

const useSearch = (
  userRecipes: Recipe[],
  handleSelectMeal: (meal: Meal) => void
) => {
  const [query, setQuery] = useState<string>('');
  const [searchType, setSearchType] = useState<'recipe' | 'ingredient'>('recipe');
  const [suggestions, setSuggestions] = useState<Meal[]>([]);
  const [searchResults, setSearchResults] = useState<Meal[]>([]);
  const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);
  const [isLoadingSearchResults, setIsLoadingSearchResults] = useState<boolean>(false);

  const handleInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputQuery = e.target.value;
    setQuery(inputQuery);
    setHighlightedIndex(-1);

    if (inputQuery.length > 2) {
      try {
        const response = await searchMeals(inputQuery);
        const results = response.meals || [];
        setSuggestions(results.slice(0, 5));
      } catch (error) {
        console.error('Error fetching suggestions:', error);
        setSuggestions([]);
      }
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
    try {
      const isIngredientSearch = searchType === 'ingredient';
      const response = await searchMeals(query, isIngredientSearch);
      const results = response.meals || [];

      const filteredResults = results.filter(
        (meal: Meal) =>
          !userRecipes.some((recipe) => recipe.meal.idMeal === meal.idMeal)
      );

      setSearchResults(filteredResults);
    } catch (error) {
      console.error('Error performing search:', error);
      setSearchResults([]);
    } finally {
      setIsLoadingSearchResults(false);
      setSuggestions([]);
      setQuery('');
    }
  }, [query, searchType, userRecipes]);

  const handleSearchTypeChange = (type: 'recipe' | 'ingredient') => {
    setSearchType(type);
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      if (highlightedIndex >= 0 && suggestions[highlightedIndex]) {
        // User pressed Enter on a highlighted suggestion
        handleSelectMeal(suggestions[highlightedIndex]); // Pass Meal object
      } else {
        // User pressed Enter without selecting a suggestion
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

  return {
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
    setQuery, // Ensure this is returned
  };
};

export default useSearch;
