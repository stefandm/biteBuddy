import React, { createContext, useState, useCallback, ReactNode } from 'react';
import { Meal } from '../types';
import { searchMeals, lookupMeal } from '../api/mealapi';
import { useUserRecipes } from '../hooks/useUserRecipes';
import { useSelectedMeal } from '../hooks/useSelectedMeal';

export interface SearchContextProps {
  query: string;
  searchType: 'recipe' | 'ingredient';
  suggestions: Meal[];
  searchResults: Meal[];
  isLoadingSearchResults: boolean;
  highlightedIndex: number;
  setHighlightedIndex: (index: number) => void;
  setQuery: (query: string) => void;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSearch: () => Promise<void>;
  handleSearchTypeChange: (type: 'recipe' | 'ingredient') => void;
  handleSearchKeyDown: (
    e: React.KeyboardEvent<HTMLInputElement>,
    onSearchPerformed?: () => void
  ) => void;
  setSuggestions: (suggestions: Meal[]) => void;
}

export const SearchContext = createContext<SearchContextProps | undefined>(undefined);

export const SearchProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { userRecipes } = useUserRecipes();
  const { selectMeal } = useSelectedMeal();

  const [query, setQuery] = useState<string>('');
  const [searchType, setSearchType] = useState<'recipe' | 'ingredient'>('recipe');
  const [suggestions, setSuggestions] = useState<Meal[]>([]);
  const [searchResults, setSearchResults] = useState<Meal[]>([]);
  const [isLoadingSearchResults, setIsLoadingSearchResults] = useState<boolean>(false);
  const [highlightedIndex, setHighlightedIndex] = useState<number>(-1); 

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
      let results = response.meals || [];

      if (isIngredientSearch) {
        const detailedResults = await Promise.all(results.map((meal) => lookupMeal(meal.idMeal)));
        results = detailedResults;
      }

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
      setHighlightedIndex(-1); 
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
      e.preventDefault(); 
      if (highlightedIndex >= 0 && suggestions[highlightedIndex]) {
        selectMeal(suggestions[highlightedIndex]);
        setSuggestions([]);
        setQuery('');
        setHighlightedIndex(-1);
      } else {
        handleSearch();
        setSuggestions([]);
        setQuery('');
        setHighlightedIndex(-1);
        if (onSearchPerformed) {
          onSearchPerformed();
        }
      }
    } else if (e.key === 'Escape') {
      setSuggestions([]);
      setQuery('');
      setHighlightedIndex(-1);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault(); 
      setHighlightedIndex((prevIndex) =>
        prevIndex < suggestions.length - 1 ? prevIndex + 1 : 0
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault(); 
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
        isLoadingSearchResults,
        highlightedIndex, 
        setHighlightedIndex, 
        setQuery, 
        handleInputChange,
        handleSearch,
        handleSearchTypeChange,
        handleSearchKeyDown,
        setSuggestions,
      }}
    >
      {children}
    </SearchContext.Provider>
  );
};
