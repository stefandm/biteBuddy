// src/contexts/SearchContext.tsx
import React, { createContext, useState, useCallback, useContext, ReactNode } from 'react';
import { Meal } from '../types';
import { searchMeals, lookupMeal } from '../api/mealapi';
import { useUserRecipes } from './UserRecipesContext';
import { useSelectedMeal } from './SelectedMealContext';

interface SearchContextProps {
  query: string;
  searchType: 'recipe' | 'ingredient';
  suggestions: Meal[];
  searchResults: Meal[];
  highlightedIndex: number;
  isLoadingSearchResults: boolean;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSearch: () => Promise<void>;
  handleSearchTypeChange: (type: 'recipe' | 'ingredient') => void;
  handleSearchKeyDown: (
    e: React.KeyboardEvent<HTMLInputElement>,
    onSearchPerformed?: () => void
  ) => void;
  setSuggestions: (suggestions: Meal[]) => void;
  setHighlightedIndex: (index: number) => void;
  setQuery: (query: string) => void;
}

const SearchContext = createContext<SearchContextProps | undefined>(undefined);

export const SearchProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { userRecipes } = useUserRecipes();
  const { selectMeal } = useSelectedMeal();

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
        const response = await searchMeals(inputQuery, searchType === 'ingredient');
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

      let detailedResults: Meal[] = [];

      if (isIngredientSearch) {
        const fetchPromises = results.map((meal) => lookupMeal(meal.idMeal));
        detailedResults = await Promise.all(fetchPromises);
      } else {
        detailedResults = results;
      }

      const filteredResults = detailedResults.filter(
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

  const handleSearchKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    onSearchPerformed?: () => void
  ): void => {
    if (e.key === 'Enter') {
      e.preventDefault(); // Prevent form submission

      if (highlightedIndex >= 0 && suggestions[highlightedIndex]) {
        // Select the highlighted suggestion
        selectMeal(suggestions[highlightedIndex]);
        setSuggestions([]);
        setQuery('');
      } else {
        // No suggestion is highlighted; perform search
        handleSearch();
        setSuggestions([]);
        setQuery('');
        if (onSearchPerformed) {
          onSearchPerformed();
        }
      }
    } else if (e.key === 'Escape') {
      setSuggestions([]);
      setQuery('');
    } else if (e.key === 'ArrowDown') {
      e.preventDefault(); // Prevent cursor from moving to the end
      setHighlightedIndex((prevIndex) =>
        prevIndex < suggestions.length - 1 ? prevIndex + 1 : 0
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault(); // Prevent cursor from moving to the start
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
        setQuery,
      }}
    >
      {children}
    </SearchContext.Provider>
  );
};

// Custom hook to use SearchContext
export const useSearch = (): SearchContextProps => {
  const context = useContext(SearchContext);
  if (context === undefined) {
    throw new Error('useSearch must be used within a SearchProvider');
  }
  return context;
};
