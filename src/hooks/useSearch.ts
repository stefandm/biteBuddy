import { useState, useCallback } from 'react';
import { searchMeals, lookupMeal } from '../api/mealapi';
import { Meal, Recipe} from '../types';

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

      // If searching by ingredient, results contain only idMeal, strMeal, and strMealThumb
      // To get full details, you need to fetch each meal's full data
      let detailedResults: Meal[] = [];

      if (isIngredientSearch) {
        // Fetch full details for each meal
        const fetchPromises = results.map((meal) => lookupMeal(meal.idMeal));
        detailedResults = await Promise.all(fetchPromises);
      } else {
        // If searching by recipe, assume full details are already present
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

  /**
   * Handle key down events in the search input.
   * @param e - Keyboard event
   * @param onSearchPerformed - Callback to execute if a search is performed without selecting a suggestion
   */
  const handleSearchKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    onSearchPerformed?: () => void
  ): void => {
    if (e.key === 'Enter') {
      if (highlightedIndex >= 0 && suggestions[highlightedIndex]) {
        // User pressed Enter on a highlighted suggestion
        handleSelectMeal(suggestions[highlightedIndex]); // Pass Meal object
        setSuggestions([]);
        setQuery('');
      } else {
        // User pressed Enter without selecting a suggestion
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
