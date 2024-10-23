// src/contexts/SearchContext.tsx
import React, { createContext, useState, useCallback, useContext, ReactNode, useEffect } from 'react';
import { Meal } from '../types';
import { searchMeals, lookupMeal, fetchRandomMeal } from '../api/mealapi';
import { useUserRecipes } from './UserRecipesContext';
import { useSelectedMeal } from './SelectedMealContext';
import { toast } from 'react-toastify';
import useDebounce from '../hooks/useDebounce';


interface SearchContextProps {
  query: string;
  searchType: 'recipe' | 'ingredient';
  suggestions: Meal[];
  searchResults: Meal[];
  isLoadingSearchResults: boolean;
  isLoadingMoreResults: boolean;
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
  fetchMoreResults: () => Promise<void>;
}

const SearchContext = createContext<SearchContextProps | undefined>(undefined);

export const SearchProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { userRecipes } = useUserRecipes();
  const { selectMeal } = useSelectedMeal();

  const [query, setQuery] = useState<string>('');
  const [searchType, setSearchType] = useState<'recipe' | 'ingredient'>('recipe');
  const [suggestions, setSuggestions] = useState<Meal[]>([]);
  const [searchResults, setSearchResults] = useState<Meal[]>([]);
  const [isLoadingSearchResults, setIsLoadingSearchResults] = useState<boolean>(false);
  const [isLoadingMoreResults, setIsLoadingMoreResults] = useState<boolean>(false);
  const [highlightedIndex, setHighlightedIndex] = useState<number>(-1); // Added highlightedIndex state

  // Handle input changes and fetch suggestions
  const handleInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputQuery = e.target.value;
    setQuery(inputQuery);
    setHighlightedIndex(-1); // Reset highlighted index on input change

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

  // Handle the initial search
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
      setHighlightedIndex(-1); // Reset highlighted index after search
    }
  }, [query, searchType, userRecipes]);

  // Handle search type changes
  const handleSearchTypeChange = (type: 'recipe' | 'ingredient') => {
    setSearchType(type);
  };

  // Handle keyboard events in the search input
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
        setHighlightedIndex(-1);
      } else {
        // No suggestion is highlighted; perform search
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

  // Fetch more results when "Load More" is pressed
  const fetchMoreResults = async () => {
    try {
      setIsLoadingMoreResults(true);
      const additionalMeals: Meal[] = [];
      const fetchCount = 5; // Number of meals to fetch each time
      const existingMealIds = new Set(searchResults.map((meal) => meal.idMeal).concat(userRecipes.map((recipe) => recipe.meal.idMeal)));
  
      while (additionalMeals.length < fetchCount) {
        const meal = await fetchRandomMeal();
        if (meal && !existingMealIds.has(meal.idMeal) && !additionalMeals.some((m) => m.idMeal === meal.idMeal)) {
          additionalMeals.push(meal);
          existingMealIds.add(meal.idMeal);
        }
        // Optional: Add a break condition to prevent infinite loops
        // e.g., after a certain number of attempts
      }
  
      if (additionalMeals.length === 0) {
        toast.info('No more unique recipes found.');
        return;
      }
  
      setSearchResults((prevResults) => [...prevResults, ...additionalMeals]);
    } catch (error) {
      console.error('Error fetching more results:', error);
      toast.error('Failed to load more recipes.');
    } finally {
      setIsLoadingMoreResults(false);
    }
  };

  const debouncedQuery = useDebounce(query, 300); // 300ms debounce
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (debouncedQuery.length > 2) {
        try {
          const response = await searchMeals(debouncedQuery, searchType === 'ingredient');
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
  
    fetchSuggestions();
  }, [debouncedQuery, searchType]);
  
  return (
    <SearchContext.Provider
      value={{
        query,
        searchType,
        suggestions,
        searchResults,
        isLoadingSearchResults,
        isLoadingMoreResults,
        highlightedIndex, // Provided to context
        setHighlightedIndex, // Provided to context
        setQuery, // Provided to context
        handleInputChange,
        handleSearch,
        handleSearchTypeChange,
        handleSearchKeyDown,
        setSuggestions,
        fetchMoreResults,
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
